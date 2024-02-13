import { useEffect, useState } from 'react';
import './App.css';
import { AuthClient } from '@dfinity/auth-client';
import { Actor, AnonymousIdentity, HttpAgent, Identity } from '@dfinity/agent';
import { createActor, dao } from './declarations/dao';

let actor = dao;

const user = {
  name: 'Motoko ghost',
  imageUrl: 'assets/motoko.png',
  imageSize: 90,
};

export default function Profile() {
  const [principal, setPrincipal] = useState<string | null>(null);

  function refreshIdentity(identity: Identity) {
    setPrincipal(identity.getPrincipal().toString());
    const agent = Actor.agentOf(actor);
    if (!agent || !agent.replaceIdentity) {
      throw new Error('Agent not found');
    }
    agent.replaceIdentity(identity);
  }

  async function login() {
    const authClient = await AuthClient.create({
      idleOptions: {
        idleTimeout: 1000 * 60 * 30,
      },
    });
    let identity = authClient.getIdentity();
    if (
      identity.getPrincipal().toString() !==
      new AnonymousIdentity().getPrincipal().toString()
    ) {
      refreshIdentity(identity);
      return;
    }
    if (!process.env.CANISTER_ID_BACKEND) {
      console.error('Please set the environment variable CANISTER_ID_BACKEND');
      return;
    }
    await new Promise((resolve) => {
      authClient.login({
        identityProvider:
          process.env.DFX_NETWORK === 'ic'
            ? 'https://identity.ic0.app'
            : `http://rdmx6-jaaaa-aaaaa-aaadq-cai.localhost:4943`,
        onSuccess: () => resolve(null),
      });
    });
    identity = authClient.getIdentity();
    const agent = new HttpAgent({ identity });
    actor = createActor(process.env.CANISTER_ID_BACKEND, {
      agent,
    });
    refreshIdentity(identity);
  }

  useEffect(() => {
    async function checkLoggedIn() {
      const authClient = await AuthClient.create();
      const identity = authClient.getIdentity();
      if (
        identity.getPrincipal().toString() !==
        new AnonymousIdentity().getPrincipal().toString()
      ) {
        refreshIdentity(identity);
      }
    }
    checkLoggedIn();
  });

  return (
    <>
      <h1>{user.name}</h1>
      <h1>Principal: {principal}</h1>
      <img
        className="avatar"
        src={user.imageUrl}
        alt={'Photo of ' + user.name}
        style={{
          width: user.imageSize,
          height: user.imageSize,
        }}
      />
      <button onClick={login}>Login</button>
    </>
  );
}
