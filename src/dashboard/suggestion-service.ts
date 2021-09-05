import { db } from '../data/db';
import Dexie from 'dexie';
import { IAuth } from '../esi';
import { getItemStats } from '../items/itemstat';
import { getOwnSells, getSells } from '../orders/orders';
import { getRegionId } from '../region';
import { getStationMap } from '../station-service';
import { getPrice, getProfit } from '../items/profit-calc';
import millify from 'millify';

export interface Suggestion {
  suggestionId: string;
  description: string;
  itemId: number;
  locationId: number;
  importance: number;
  category: string;
  profitPercent: number;
}

const inventorySuggestions = async (auth: IAuth): Promise<Suggestion[]> => {
  const routes = await db.tradeRoute.toArray();
  const rv: Suggestion[] = [];
  for (const route of routes) {
    const inventory = await db.inventory
      .where('locationId')
      .equals(route.toStation)
      .toArray();
    for (const inv of inventory) {
      const lastBuy = await db.walletTransactions
        .where(['typeId+isBuy+date'])
        .between([inv.typeId, 1, Dexie.minKey], [inv.typeId, 1, Dexie.maxKey])
        .reverse()
        .first();
      if (!lastBuy) continue;

      const myOrders = await getOwnSells(inv.typeId, route.toStation);
      if (myOrders.length > 0) continue;

      const targetPrice = getPrice(lastBuy.unitPrice, 1.05, inv.typeId, route);

      const otherOrders = await getSells(inv.typeId, route.toStation);
      const lowerOrders = otherOrders.filter(
        (other) => other.price < targetPrice
      );
      if (lowerOrders.length === 0) {
        const profit = getProfit(
          lastBuy.unitPrice,
          otherOrders[0]?.price ||
            getPrice(lastBuy.unitPrice, 1.2, inv.typeId, route),
          inv.typeId,
          route
        );
        rv.push({
          suggestionId: `inv-${inv.typeId}-${inv.locationId}`,
          description: `List item at ${millify(targetPrice, {
            precision: 4
          })} `,
          itemId: inv.typeId,
          locationId: route.toStation,
          importance: profit.profitPercent + Math.log(0.2 * targetPrice) / 5,
          category: 'New List',
          profitPercent: profit.profitPercent
        });
      }
    }
  }
  return rv;
};

const orderSuggestions = async (
  auth: IAuth,
  type = 'relist'
): Promise<Suggestion[]> => {
  const orders = await db.ownOrders.toArray();
  const routes = await db.tradeRoute.toArray();
  const stationMap = await getStationMap();
  const rv: Suggestion[] = [];

  for (const order of orders.filter((o) => o.isBuyOrder === 0)) {
    const route = routes.find((r) => r.toStation === order.locationId);
    if (!route) continue;

    const stats = await getItemStats(
      auth,
      order.typeId,
      getRegionId(stationMap, order.locationId)
    );
    const otherOrders = await getSells(order.typeId, order.locationId);
    const lowerOrders = otherOrders.filter(
      (other) => other.price < order.price
    );

    if (lowerOrders.length === 0) continue;

    const lowerStock = lowerOrders.reduce(
      (sum, order) => sum + order.volumeRemain,
      0
    );
    const lowerStockDays = lowerStock / Math.max(1, stats?.dailyVolume || 0);

    const lastBuy = await db.walletTransactions
      .where(['typeId+isBuy+date'])
      .between([order.typeId, 1, Dexie.minKey], [order.typeId, 1, Dexie.maxKey])
      .reverse()
      .first();

    if (!lastBuy) continue;

    const profit = getProfit(
      lastBuy.unitPrice,
      lowerOrders[0].price,
      order.typeId,
      route
    );

    if (
      type === 'relist' &&
      lowerStockDays > 0.75 &&
      profit.profitPercent > 10
    ) {
      const newPrice = lowerOrders[0].price;

      rv.push({
        suggestionId: `order-${order.orderId}`,
        description: `Relist item below ${millify(newPrice, {
          precision: 4
        })} (-${millify(order.price - newPrice)})`,
        itemId: order.typeId,
        locationId: order.locationId,
        importance: lowerStockDays * Math.min(stats.dailyVolume, 1),
        category: 'Order Maintenance',
        profitPercent: profit.profitPercent
      });
    }

    if (type != 'relist' && lowerStockDays > 5 && profit.profitPercent < 5) {
      rv.push({
        suggestionId: `order-${order.orderId}`,
        description: `Loser, good candidate if you need to free up order slots`,
        itemId: order.typeId,
        locationId: order.locationId,
        importance: 0.1 / Math.max(1, profit.profitPercent),
        category: 'Bad Deal',
        profitPercent: profit.profitPercent
      });
    }
  }

  return rv;
};

export const getCancelSuggestions = async (
  auth: IAuth
): Promise<Suggestion[]> => {
  return (await orderSuggestions(auth, 'cancel')).sort(
    (a: Suggestion, b: Suggestion) => b.importance - a.importance
  );
};

export const getRelistSuggestions = async (
  auth: IAuth
): Promise<Suggestion[]> => {
  return (await orderSuggestions(auth)).sort(
    (a: Suggestion, b: Suggestion) => b.importance - a.importance
  );
};

export const getListSuggestions = async (
  auth: IAuth
): Promise<Suggestion[]> => {
  return (await inventorySuggestions(auth)).sort(
    (a: Suggestion, b: Suggestion) => b.importance - a.importance
  );
};
