import React from 'react';
import { AuthTokenInfo } from './esi';

export const AuthContext = React.createContext<AuthTokenInfo>(null);

export const useAuth = (): AuthTokenInfo => {
  const auth = React.useContext(AuthContext);
  return auth;
};
