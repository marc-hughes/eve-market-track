import axios, { AxiosResponse } from 'axios';
import { db } from './data/db';

type IAuth = { accessToken: string; refreshToken: string };
export interface AuthTokenInfo {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
type NoRequestBody = Record<string, never>;

export interface IESILoginVerifyResponse {
  CharacterID: number;
  CharacterName: string;
  ExpiresOn: string;
  Scopes: string;
  TokenType: string;
  CharacterOwnerHash: string;
  IntellectualProperty: string;
}

function esiRequest<TRequest, TResponse>(
  auth: IAuth,
  path: string,
  params: Record<string, string>,
  base: string
): Promise<AxiosResponse<TResponse>> {
  return axios
    .get(base + path, {
      headers: {
        Authorization: `Bearer ${auth.accessToken}`
      },
      params
    })
    .catch((e) => {
      if (
        e.isAxiosError &&
        e.response.status === 403 &&
        e.response.data.error === 'token is expired'
      ) {
        // we need to refresh our auth token.
        const oauthParams = new URLSearchParams();
        oauthParams.append('grant_type', 'refresh_token');
        oauthParams.append('refresh_token', auth.refreshToken);
        oauthParams.append('client_id', '6d9027a5346d42e1babfda3a8b34a1f1');
        return axios
          .post('https://login.eveonline.com/v2/oauth/token', oauthParams, {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Host: 'login.eveonline.com'
            }
          })
          .then(({ data }) => {
            const accessToken = data.access_token;
            const refreshToken = data.refresh_token;
            const newAuth = { accessToken, refreshToken };
            db.characters
              .where('refreshToken')
              .equals(refreshToken)
              .modify({ accessToken: accessToken });
            // Retry the original request with new auth data.
            return esiRequest<TRequest, TResponse>(newAuth, path, params, base);
          });
      }

      return Promise.reject(e);
    });
}

function genRequest<TRequest, TResponse>(
  path: string,
  base = 'https://esi.evetech.net/latest'
) {
  return (
    auth: IAuth,
    params: Record<string, string> = {},
    pathReplacements: Record<string, string> = {}
  ) =>
    esiRequest<TRequest, TResponse>(
      auth,
      Object.entries(pathReplacements).reduce((acc, curr) => {
        const [key, value] = curr;
        return acc.replace(`:${key}`, value);
      }, path),
      params,
      base
    );
}

export const esiLoginVerify = genRequest<
  NoRequestBody,
  IESILoginVerifyResponse
>('/oauth/verify', 'https://login.eveonline.com');

interface IESIStructuresRequest {
  structure_id: number;
}

interface IESIStructuresResponse {
  name: string;
}

export const esiStructures = genRequest<
  IESIStructuresRequest,
  IESIStructuresResponse
>('/universe/structures/:id');

export const esiAllStructures = genRequest<
  NoRequestBody,
  IESIStructuresResponse
>('/universe/structures/');

interface IESISovStructuresResponse {
  name: string;
}
export const esiSovStructures = genRequest<
  NoRequestBody,
  IESISovStructuresResponse
>('/sovereignty/structures/');

interface IESIWalletTransactionResponse {
  client_id: number;
  date: string; //"2021-08-23T00:02:37Z",
  is_buy: boolean;
  is_personal: boolean;
  journal_ref_id: number;
  location_id: number;
  quantity: number;
  transaction_id: number;
  type_id: number;
  unit_price: number;
}
export const esiWalletTransactions = genRequest<
  NoRequestBody,
  IESIWalletTransactionResponse[]
>('/characters/:id/wallet/transactions/');
