import Dexie from 'dexie';
import { IChar } from '../character/IChar';

class AppDB extends Dexie {
  characters: Dexie.Table<IChar, string>;
  constructor() {
    super('eve-market');
    this.version(1).stores({
      characters: 'id,name,wallet,accessToken,refreshToken,expires',
      tradeRoute: 'id++,fromStation,toStation,shippingCost,tax,broker'
      //...other tables goes here...
    });
    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    //this.characters = this.table('characters');
  }
}

export const db = new AppDB();
