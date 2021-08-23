import Dexie from 'dexie';
import { ITradeRoute } from '../config/ITradeRoute';
import { IChar } from '../character/IChar';
import { IStation } from '../config/IStation';

class AppDB extends Dexie {
  characters: Dexie.Table<IChar, string>;
  tradeRoute: Dexie.Table<ITradeRoute, number>;
  stations: Dexie.Table<IStation, string>;

  constructor() {
    super('eve-market');
    this.version(1).stores({
      characters: 'id,name,wallet,accessToken,refreshToken,expires',
      tradeRoute: 'id++,fromStation,toStation,shippingCost,tax,broker'
    });

    this.version(2).stores({
      characters: 'id,name,wallet,accessToken,refreshToken,expires',
      tradeRoute: 'id++,fromStation,toStation,shippingCost,tax,broker',
      stations: 'id, name'
    });

    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    //this.characters = this.table('characters');
  }
}

export const db = new AppDB();
