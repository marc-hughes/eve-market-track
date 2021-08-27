import { useLiveQuery } from 'dexie-react-hooks';
import Dexie from 'dexie';

import moment from 'moment';
import { db } from '../data/db';
import { esiMarketStats, IAuth, IESIMarketStats } from '../esi';

export interface IItemStat {
  regionId: number;
  itemId: number;
  dailyVolume: number;
  historicalPrice: number;
  lastUpdated: number;
}

const STAT_TIMEOUT = 24 * 60 * 60 * 1000;

const marketStatCache: Record<string, IESIMarketStats[]> = {};

export const getMarketStats = async (
  auth: IAuth,
  itemId: number,
  regionId: number
): Promise<IESIMarketStats[]> => {
  // These don't change more than once a day, so we're just going to cache them and skip making a request
  const cacheKey = `${itemId}-${regionId}`;
  if (marketStatCache[cacheKey]) return marketStatCache[cacheKey];

  // TODO: Error handling
  return esiMarketStats(
    auth,
    { type_id: String(itemId), d: String(new Date().getDay()) },
    { regionId: String(regionId) }
  ).then((res) => {
    const days = Array(30)
      .fill(0)
      .map((_, i) => moment().subtract(i, 'days').format('YYYY-MM-DD'))
      .reverse();

    const recent = days.map((day) => {
      const stat = res.data.find((stat) => stat.date === day);
      if (!stat) {
        return {
          date: day,
          average: null,
          lowest: null,
          order_count: null,
          volume: null
        };
      } else {
        return stat;
      }
    });

    marketStatCache[cacheKey] = recent;
    cacheSummaryStats(itemId, regionId, recent);
    return recent;
  });
};

const cacheSummaryStats = (
  itemId: number,
  regionId: number,
  stats: IESIMarketStats[]
) => {
  const summary = {
    regionId,
    itemId,
    dailyVolume:
      stats.length > 0
        ? stats.reduce((a: number, b: IESIMarketStats) => a + b.volume, 0) /
          stats.length
        : 0,
    historicalPrice:
      stats.length > 0
        ? stats.reduce((a: number, b: IESIMarketStats) => a + b.average, 0) /
          stats.length
        : 0,
    lastUpdated: new Date().getTime()
  };

  db.itemStat.put(summary);
  return summary;
};

export const getItemStats = async (
  auth: IAuth,
  itemId: number,
  regionId: number
): Promise<IItemStat> => {
  if (!itemId || !regionId) return null;

  const existing = await db.itemStat
    .where('[itemId+regionId]')
    .equals([itemId, regionId])
    .first();
  if (existing && existing.lastUpdated <= new Date().getTime() + STAT_TIMEOUT) {
    return existing;
  }

  // Don't have a recent value, so let's calculating some
  const stats = await getMarketStats(auth, itemId, regionId);

  return cacheSummaryStats(itemId, regionId, stats);
};

export const useItemStats = (
  auth: IAuth,
  itemId: number,
  regionId: number
): IItemStat =>
  useLiveQuery(
    () => regionId && itemId && getItemStats(auth, itemId, regionId),
    [itemId, regionId]
  );

export const getStock = async (
  itemId: number,
  locationId: number
): Promise<number> => {
  const orders = await db.orders
    .where(['typeId+locationId+isBuyOrder+price'])
    .between(
      [itemId, locationId, 0, Dexie.minKey],
      [itemId, locationId, 0, Dexie.maxKey]
    )
    .toArray();

  return orders.reduce((acc, order) => {
    return acc + order.volumeRemain;
  }, 0);
};
