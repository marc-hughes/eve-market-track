import { useLiveQuery } from 'dexie-react-hooks';
import Dexie from 'dexie';
import { db } from '../data/db';

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

export const useBestSell = (itemId: number, locationId: number) => {
  return useLiveQuery(
    () =>
      db.orders
        .where(['typeId+locationId+isBuyOrder+price'])
        .between(
          [itemId, locationId, 0, Dexie.minKey],
          [itemId, locationId, 0, Dexie.maxKey]
        )
        .first(),
    [itemId, locationId]
  );
};
