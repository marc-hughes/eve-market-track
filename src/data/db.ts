import Dexie from 'dexie';
import { ITradeRoute } from '../config/ITradeRoute';
import { IChar } from '../character/IChar';
import { IStation } from '../config/IStation';
import { IWalletEntry } from '../character/IWalletEntry';
import { IOrders, IOwnOrder } from '../orders/orders';

class AppDB extends Dexie {
  characters: Dexie.Table<IChar, string>;
  tradeRoute: Dexie.Table<ITradeRoute, number>;
  stations: Dexie.Table<IStation, number>;
  walletTransactions: Dexie.Table<IWalletEntry, number>;
  orders: Dexie.Table<IOrders, number>;
  ownOrders: Dexie.Table<IOwnOrder, number>;

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
      ownOrders: 'orderId,locationId,[characterId+issued],[typeId+issued]'
    });

    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    //this.characters = this.table('characters');
  }
}

export const db = new AppDB();
