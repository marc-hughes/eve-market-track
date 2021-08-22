import axios from 'axios';

export interface AuthTokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export function esiRequest(auth: AuthTokenInfo, path: string, body: any) {
  return axios.get('https://login.eveonline.com' + path, {
    headers: {
      Authorization: `Bearer ${auth.accessToken}`
    },
    params: body
  });
}
