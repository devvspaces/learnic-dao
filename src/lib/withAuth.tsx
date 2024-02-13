import { LOGIN, useAuth } from './AuthContext';
import { useEffect } from 'react';
import { AnonymousPrincipal, createClient, refreshIdentity } from './helper';
import { useNavigate } from 'react-router-dom';
import { dao } from '../declarations/dao';
import { Member } from '../declarations/dao/dao.did';

let actor = dao;

function withAuth(Component: any) {
  return function WithAuth(props: any) {
    const { state, dispatch } = useAuth();
    const navigation = useNavigate();

    useEffect(() => {
      async function checkAuthenticated() {
        const authClient = await createClient();
        const identity = authClient.getIdentity();
        if (identity.getPrincipal().toString() !== AnonymousPrincipal) {
          refreshIdentity(identity, actor, () => {});
          const response = (await actor.getMember(
            identity.getPrincipal(),
          )) as any;
          const member = (response.ok as Member) ?? null;
          dispatch({
            type: LOGIN,
            payload: {
              principal: identity.getPrincipal(),
              member,
            },
          });
        } else {
          // logout
          localStorage.clear();
          sessionStorage.clear();
          indexedDB.deleteDatabase('icp');
          navigation('/');
        }
      }
      checkAuthenticated();
    }, [dispatch, navigation]);

    if (state.isAuthenticated) {
      return <Component {...props} />;
    } else {
      return <p>You are not logged in.</p>;
    }
  };
}

export default withAuth;
