import { validateStations } from '../station-service';
import { db } from '../data/db';
import { esiWalletTransactions, walletBallance } from '../esi';
import { IChar } from './IChar';
import { IWalletEntry } from './IWalletEntry';

export const refreshWallet = (character: IChar): Promise<boolean> => {
  return esiWalletTransactions(
    character,
    {},
    { id: String(character.id) }
  ).then((result) => {
    const transactions: IWalletEntry[] = result.data.map((transaction) => ({
      transactionId: transaction.transaction_id,
      characterId: character.id,
      clientId: transaction.client_id,
      date: transaction.date,
      isBuy: transaction.is_buy ? 1 : 0, // need to convert to number so we can index
      isPersonal: transaction.is_personal,
      journalRefId: transaction.journal_ref_id,
      locationId: transaction.location_id,
      quantity: transaction.quantity,
      typeId: transaction.type_id,
      unitPrice: transaction.unit_price
    }));

    return Promise.all([
      db.walletTransactions.bulkPut(transactions),
      validateStations(
        {
          ...character,
          characterId: character.id
        },
        transactions.map<number>((t: IWalletEntry) => t.locationId)
      )
    ])
      .then(() =>
        walletBallance(character, {}, { characterId: String(character.id) })
      )
      .then((bal) => {
        return db.characters.update(character.id, {
          wallet: bal.data
        });
      })
      .then(() => true);
    // TODO: Error handling
  });
};
