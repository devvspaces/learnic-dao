import { Actor, AnonymousIdentity, Identity } from "@dfinity/agent";
import { AuthClient } from "@dfinity/auth-client";
import { Principal } from "@dfinity/principal";
import { Member, Proposal } from "../declarations/dao/dao.did";

export enum Role {
  Student = 'Student',
  Graduate = 'Graduate',
  Mentor = 'Mentor',
}

export enum ProposalType {
  ChangeManifesto = 'ChangeManifesto',
  AddMentor = 'AddMentor',
}

export function getProposalStatus(proposal: Proposal) {
  const status = proposal.status as any;
  if (status.Open === null) {
    return 'Open';
  }
  if (status.Accepted === null) {
    return 'Accepted';
  }
  if (status.Rejected === null) {
    return 'Rejected';
  }
}

export function countProposalVotes(proposal: Proposal) {
  const approves = proposal.votes.filter((vote) => vote.vote).length;
  const rejects = proposal.votes.filter((vote) => !vote.vote).length;
  return {
    approves,
    rejects,
  };
}

export function getProposalString(proposal: Proposal) {
  const type = proposal.content as any;
  if (type.ChangeManifesto) {
    return 'Change Manifesto';
  }
  if (type.AddMentor) {
    return 'Add Mentor';
  }
}

export function getProposalContent(proposal: Proposal) {
  const content = proposal.content as any;
  if (content.ChangeManifesto) {
    return content.ChangeManifesto;
  }
  if (content.AddMentor) {
    return content.AddMentor.toString();
  }

}

export async function createClient() {
  const authClient = await AuthClient.create({
    idleOptions: {
      idleTimeout: 1000 * 60 * 30,
    },
  });
  return authClient;
}

export const AnonymousPrincipal = new AnonymousIdentity().getPrincipal().toString();

export function refreshIdentity(identity: Identity, actor: Actor, setPrincipal: (principal: Principal) => void) {
  setPrincipal(identity.getPrincipal());
  const agent = Actor.agentOf(actor);
  if (!agent || !agent.replaceIdentity) {
    throw new Error('Agent not found');
  }
  agent.replaceIdentity(identity);
}

export function getRole(member: Member) {
  const role = member.role as any;
  if (role.Student === null) {
    return Role.Student;
  }
  if (role.Graduate === null) {
    return Role.Graduate;
  }
  if (role.Mentor === null) {
    return Role.Mentor;
  }
}
