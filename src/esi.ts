import axios, { AxiosResponse } from 'axios';
import { db } from './data/db';

export type IAuth = { accessToken: string; refreshToken: string };
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
  base: string,
  method: 'get' | 'post' = 'get',
  retry = true
): Promise<AxiosResponse<TResponse>> {
  return axios({
    method,
    url: base + path,
    headers: {
      Authorization: `Bearer ${auth.accessToken}`
    },
    params
  }).catch((e) => {
    if (
      e.isAxiosError &&
      e.response &&
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
            'Content-Type': 'application/x-www-form-urlencoded'
            //Host: 'login.eveonline.com'
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

    if (retry) {
      console.warn('Retyring ESI request');
      return esiRequest(auth, path, params, base, method, false);
    }

    return Promise.reject(e);
  });
}

function genRequest<TRequest, TResponse>(
  path: string,
  base = 'https://esi.evetech.net/latest',
  method: 'get' | 'post' = 'get'
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
      base,
      method
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

export const esiOpenMarket = genRequest<NoRequestBody, NoRequestBody>(
  '/ui/openwindow/marketdetails/',
  'https://esi.evetech.net/latest',
  'post'
);

interface Position {
  x: number;
  y: number;
  z: number;
}
interface IESIStationResponse {
  max_dockable_ship_volume: number;
  name: string;
  office_rental_cost: number;
  owner: number;
  position: Position;
  race_id: number;
  reprocessing_efficiency: number;
  reprocessing_stations_take: number;
  services: string[];
  station_id: number;
  system_id: number;
  type_id: number;
}

export const esiStation = genRequest<NoRequestBody, IESIStationResponse>(
  '/universe/stations/:stationId/'
);

interface IESIStructureResponse {
  name: string;
  owner_id: number;
  position: Position;
  solar_system_id: number;
  type_id: number;
}

export const esiStructure = genRequest<NoRequestBody, IESIStructureResponse>(
  '/universe/structures/:structureId/'
);

interface IESIMarketOrderResponse {
  is_buy_order: boolean;
  issued: string;
  location_id: number;
  min_volume: number;
  order_id: number;
  price: number;
  range: string;
  region_id?: number;
  type_id: number;
  volume_remain: number;
  volume_total: number;
  duration: number;
}

export const esiMarketOrders = genRequest<
  NoRequestBody,
  IESIMarketOrderResponse[]
>('/markets/structures/:structureId/');

export const esiRegionMarketOrders = genRequest<
  NoRequestBody,
  IESIMarketOrderResponse[]
>('/markets/:regionId/orders/');

interface IESIMarketOwnOrderResponse {
  is_buy_order: boolean;
  issued: string;
  location_id: number;
  min_volume: number;
  order_id: number;
  price: number;
  range: string;
  region_id?: number;
  type_id: number;
  volume_remain: number;
  volume_total: number;
  duration: number;

  character_id: number;
  escrow: number;
  is_corporation: boolean;
  regionId: number;
}
export const esiMarketOwnOrders = genRequest<
  NoRequestBody,
  IESIMarketOwnOrderResponse[]
>('/characters/:characterId/orders/');

export interface IESIMarketOrderHistory extends IESIMarketOwnOrderResponse {
  state: string;
}
export const esiMarketOrderHistory = genRequest<
  NoRequestBody,
  IESIMarketOrderHistory[]
>('/characters/:characterId/orders/history/');

export interface IESICharacterAssets {
  item_id: number;
  location_id: number;
  location_type: string;
  quantity: number;
  type_id: number;
  location_flag: string;
}

export const esiCharacterAssets = genRequest<
  NoRequestBody,
  IESICharacterAssets[]
>('/characters/:characterId/assets/');

export interface IESIMarketStats {
  average: number;
  date: string;
  lowest: number;
  order_count: number;
  volume: number;
}
export const esiMarketStats = genRequest<NoRequestBody, IESIMarketStats[]>(
  '/markets/:regionId/history/'
);

export const esiMarketTypes = genRequest<NoRequestBody, number[]>(
  '/markets/:regionId/types/'
);
