import { db } from '../data/db';
import { esiWalletTransactions } from '../esi';
import { IChar } from './IChar';
import { IWalletEntry } from './IWalletEntry';

export const refreshWallet = (character: IChar): Promise<boolean> => {
  return esiWalletTransactions(character, {}, { id: character.id }).then(
    (result) => {
      const transactions: IWalletEntry[] = result.data.map((transaction) => ({
        transactionId: transaction.transaction_id,
        characterId: character.id,
        clientId: transaction.client_id,
        date: transaction.date,
        isBuy: transaction.is_buy,
        isPersonal: transaction.is_personal,
        journalRefId: transaction.journal_ref_id,
        locationId: transaction.location_id,
        quantity: transaction.quantity,
        typeId: transaction.type_id,
        unitPrice: transaction.unit_price
      }));
      db.walletTransactions.bulkPut(transactions);
      return true;
    }
  );
};
