import Dexie from 'dexie';
import { IChar } from './IChar';

class AppDB extends Dexie {
  characters: Dexie.Table<IChar, number>;
  constructor() {
    super('AppDB');
    this.version(1).stores({
      characters: 'id,name,wallet,accessToken,refreshToken,expires'
      //...other tables goes here...
    });
    // The following line is needed if your typescript
    // is compiled using babel instead of tsc:
    //this.characters = this.table('characters');
  }
}

export const db = new AppDB();
