import Dexie from 'dexie';
import { ITradeRoute } from '../config/ITradeRoute';
import { IChar } from '../character/IChar';
import { IStation } from '../config/IStation';
import { IWalletEntry } from '../character/IWalletEntry';

class AppDB extends Dexie {
  characters: Dexie.Table<IChar, string>;
  tradeRoute: Dexie.Table<ITradeRoute, number>;
  stations: Dexie.Table<IStation, number>;
  walletTransactions: Dexie.Table<IWalletEntry, number>;

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

    this.version(3).stores({
      characters: 'id,name,wallet,accessToken,refreshToken,expires',
      tradeRoute: 'id++,fromStation,toStation,shippingCost,tax,broker',
      stations: 'id, name',
      walletTransactions:
        'transactionId,characterId,clientId,date,isBuy,isPersonal,journalRefId,locationId,quantity,typeId,unitPrice'
    });

    this.version(4).stores({
      characters: 'id,name,wallet,accessToken,refreshToken,expires',
      tradeRoute: 'id++,fromStation,toStation,shippingCost,tax,broker',
      stations: 'id,name,ownerId,solarSystemId,typeId',
      walletTransactions:
        'transactionId,characterId,clientId,date,isBuy,isPersonal,journalRefId,locationId,quantity,typeId,unitPrice'
    });

    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    //this.characters = this.table('characters');
  }
}

export const db = new AppDB();
