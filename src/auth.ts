import React from 'react';
import { AuthTokenInfo } from './esi';

export const AuthContext = React.createContext<AuthTokenInfo>(null);

// TODO: We need to be using the correct character's auth, especially when one is in alliance and one is out.
//       I'm not sure yet how to handle 2 different alliances. Maybe the station db table needs to remember
//       which character had access to it.
export const useAuth = (): AuthTokenInfo => {
  const auth = React.useContext(AuthContext);
  return auth;
};
