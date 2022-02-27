import { db } from './data/db';

import {
  esiMarketOrders,
  esiMarketStats,
  esiRegionMarketOrders,
  IAuth
} from './esi';
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

const findAuthForStructure = async (structureId: number): Promise<IAuth> => {
  const station = await db.stations.get(structureId);
  if (station && station.founderId) {
    // We know who "found" this station, so they should have access to it.
    const user = await db.characters.get(station.founderId);
    if (user) {
      return {
        ...user,
        characterId: user.id
      };
    }
  }

  // If we don't find a specific user, just use the first one
  const firstUser = await db.characters.toCollection().first();
  return {
    ...firstUser,
    characterId: firstUser.id
  };
};

export const updateMarket = async (
  structureId: number,
  deleteOld = true
): Promise<any> => {
  const auth = await findAuthForStructure(structureId);
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
      isBuyOrder: p.is_buy_order ? 1 : 0,
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
    if (deleteOld) {
      await db.orders.where({ locationId: structureId }).delete();
      console.info('Old orders deleted');
    }

    await db.orders.bulkAdd(allOrders);
    console.info('New orders saved');
  } catch (e) {
    console.error(e);
    // TODO: HANDLE ERRORS
    throw e;
  }
};
