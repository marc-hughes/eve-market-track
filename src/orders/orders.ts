import { useLiveQuery } from 'dexie-react-hooks';
import Dexie, { PromiseExtended } from 'dexie';
import { db } from '../data/db';
import { IWalletEntry } from '../character/IWalletEntry';

export interface IOrders {
  duration: number;
  isBuyOrder: number;
  issued: string;
  locationId: number;
  minVolume: number;
  orderId: number;
  price: number;
  range: string;
  typeId: number;
  volumeRemain: number;
  volumeTotal: number;
}

export interface IOwnOrder extends IOrders {
  characterId: number;
  escrow: number;
  isCorporation: boolean;
  regionId: number;
}

export interface IOwnOrderHistory extends IOwnOrder {
  state: string;
}

export const getBestSell = (itemId: number, locationId: number) =>
  db.orders
    .where(['typeId+locationId+isBuyOrder+price'])
    .between(
      [itemId, locationId, 0, Dexie.minKey],
      [itemId, locationId, 0, Dexie.maxKey]
    )
    .first();

export const useBestSell = (itemId: number, locationId: number) => {
  return useLiveQuery(
    () => getBestSell(itemId, locationId),
    [itemId, locationId]
  );
};

export const getOwnSells = (
  itemId: number,
  locationId: number
): PromiseExtended<IOrders[]> => {
  return db.ownOrders
    .where(['typeId+locationId'])
    .equals([itemId, locationId])
    .toArray();
};

export const getSells = (
  itemId: number,
  locationId: number
): PromiseExtended<IOrders[]> => {
  return db.orders
    .where(['typeId+locationId+isBuyOrder+price'])
    .between(
      [itemId, locationId, 0, Dexie.minKey],
      [itemId, locationId, 0, Dexie.maxKey]
    )
    .toArray();
};

export const useSells = (itemId: number, locationId: number) => {
  return useLiveQuery(() => getSells(itemId, locationId), [itemId, locationId]);
};

export const useMyLastBuy = (itemId: number): IWalletEntry => {
  return useLiveQuery(
    () =>
      db.walletTransactions
        .where(['typeId+isBuy+date'])
        .between([itemId, 1, Dexie.minKey], [itemId, 1, Dexie.maxKey])
        .reverse()
        .first(),
    [itemId]
  );
};
