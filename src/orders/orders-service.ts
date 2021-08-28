import { IChar } from '../character/IChar';
import { db } from '../data/db';
import { esiMarketOwnOrders } from '../esi';
import { IOwnOrder } from './orders';

export const updateOwnOrders = async (
  character: IChar
): Promise<number | boolean> =>
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
          isBuyOrder: !!o.is_buy_order,
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
    });
