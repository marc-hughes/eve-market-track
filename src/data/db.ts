import Dexie from 'dexie';
import { ITradeRoute } from '../config/ITradeRoute';
import { IChar } from '../character/IChar';
import { IStation } from '../config/IStation';
import { IWalletEntry } from '../character/IWalletEntry';
import { IOrders, IOwnOrder, IOwnOrderHistory } from '../orders/orders';
import { IInventory } from '../inventory/inventory';
import { IItemNotes } from '../items/ItemNotes';
import { IItemStat } from '../items/itemstat';
import { ITradingStrategy } from '../strategy/ITradingStrategy';

class AppDB extends Dexie {
  itemStat: Dexie.Table<IItemStat, number>;
  characters: Dexie.Table<IChar, number>;
  tradeRoute: Dexie.Table<ITradeRoute, number>;
  stations: Dexie.Table<IStation, number>;
  walletTransactions: Dexie.Table<IWalletEntry, number>;
  orders: Dexie.Table<IOrders, number>;
  ownOrders: Dexie.Table<IOwnOrder, number>;
  inventory: Dexie.Table<IInventory, number>;
  orderHistory: Dexie.Table<IOwnOrderHistory, number>;
  itemNotes: Dexie.Table<IItemNotes, number>;
  strategies: Dexie.Table<ITradingStrategy, number>;

  constructor() {
    super('eve-market');

    this.version(1).stores({
      characters: 'id,name,refreshToken',
      tradeRoute: 'id++,fromStation,toStation',
      stations: 'id,name,ownerId,solarSystemId,typeId',
      walletTransactions:
        'transactionId,[characterId+date],[typeId+isBuy+date]',
      orders:
        'orderId,locationId,typeId,[typeId+locationId],[typeId+locationId+isBuyOrder+price]',
      ownOrders:
        'orderId,locationId,[characterId+issued],[typeId+issued],[typeId+locationId]',
      inventory:
        'itemId,locationId,characterId,[characterId+locationId],typeId',
      orderHistory: 'orderId,locationId,[characterId+issued],[typeId+issued]',
      itemNotes: 'itemId',
      itemStat: '[itemId+regionId]'
    });

    this.version(3)
      .stores({
        stations: 'id,name,ownerId,solarSystemId,typeId,founderId'
      })
      .upgrade((tx) => {
        tx.table('stations').clear();
        // This will repopulate next data sync
      });

    this.version(4).stores({
      strategies: '++id, name'
    });

    this.version(5).stores({
      itemNotes: 'itemId,strategy'
    });
  }
}

export const db = new AppDB();
