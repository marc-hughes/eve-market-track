import { IChar } from '../character/IChar';
import { db } from '../data/db';
import { esiMarketOrderHistory, esiMarketOwnOrders } from '../esi';
import { IOwnOrder } from './orders';

export const updateOwnOrders = async (
  character: IChar
): Promise<number | boolean> =>
  // TODO: Error handling
  esiMarketOwnOrders(character, {}, { characterId: String(character.id) })
    .then((response) =>
      // First delete old orders for this char, then add new ones
      db.ownOrders
        .where({ characterId: character.id })
        .delete()
        .then(() => response.data)
    )
    .then((orders) => {
      return db.ownOrders.bulkPut(
        orders.map<IOwnOrder>((o) => ({
          ...o,
          characterId: character.id,
          isBuyOrder: o.is_buy_order ? 1 : 0, // need this to be a number so we can index it
          locationId: o.location_id,
          minVolume: o.min_volume,
          orderId: o.order_id,
          typeId: o.type_id,
          volumeRemain: o.volume_remain,
          volumeTotal: o.volume_total,
          isCorporation: o.is_corporation,
          regionId: o.region_id
        }))
      );
    })
    .then(() =>
      esiMarketOrderHistory(
        character,
        {},
        { characterId: String(character.id) }
      )
    )
    .then((orderHistory) => {
      console.info(orderHistory);
      db.orderHistory.bulkPut(
        orderHistory.data
          .filter((o) => o.state === 'expired' && !o.is_buy_order)
          .map((o) => ({
            characterId: character.id,
            duration: o.duration,
            isBuyOrder: o.is_buy_order ? 1 : 0, // need this to be a number so we can index it
            issued: o.issued,
            locationId: o.location_id,
            minVolume: o.min_volume,
            orderId: o.order_id,
            price: o.price,
            range: o.range,
            typeId: o.type_id,
            volumeRemain: o.volume_remain,
            volumeTotal: o.volume_total,
            escrow: o.escrow,
            isCorporation: o.is_corporation,
            regionId: o.region_id,
            state: o.state
          }))
      );
      return true;
    });
