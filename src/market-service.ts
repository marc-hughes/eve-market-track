import { db } from './data/db';

import { esiMarketOrders, esiRegionMarketOrders, IAuth } from './esi';
import { systems } from './systems';

const getOrders = (auth: IAuth, structureId: number, page = 1) => {
  if (structureId > 100000000) {
    // Player structure
    return esiMarketOrders(
      auth,
      { page: String(page) },
      { structureId: String(structureId) }
    ).then((orders) => {
      return { orders: orders.data, pages: orders.headers['x-pages'] };
    });
  }

  return db.stations
    .get(structureId)
    .then((station) => {
      const system = systems[String(station.solarSystemId)];
      return esiRegionMarketOrders(
        auth,
        { page: String(page) },
        { regionId: String(system.regionID) }
      );
    })
    .then((orders) => {
      return { orders: orders.data, pages: orders.headers['x-pages'] };
    });
};

export const updateMarket = async (
  auth: IAuth,
  structureId: number
): Promise<any> => {
  const first = await getOrders(auth, structureId);
  const otherOrders = await Promise.all(
    Array(first.pages - 1)
      .fill(0)
      .map((_, i) => getOrders(auth, structureId, i + 2))
  );
  const allOrders = [
    ...first.orders,
    ...otherOrders.map((o) => o.orders).reduce((a, b) => a.concat(b), [])
  ]
    .filter((o) => o.location_id === structureId)
    .map((p) => ({
      orderId: p.order_id,
      duration: p.duration,
      isBuyOrder: p.is_buy_order,
      issued: p.issued,
      locationId: p.location_id,
      minVolume: p.min_volume,
      price: p.price,
      range: p.range,
      typeId: p.type_id,
      volumeRemain: p.volume_remain,
      volumeTotal: p.volume_total
    }));
  try {
    console.info(`Retrieved ${allOrders.length} orders`);
    await db.orders.where({ locationId: structureId }).delete();
    console.info('Old orders deleted');
    await db.orders.bulkPut(allOrders);
    console.info('New orders saved');
  } catch (e) {
    console.error(e);
    // TODO: HANDLE ERRORS
    throw e;
  }
};
