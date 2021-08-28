export interface IWalletEntry {
  transactionId: number;
  characterId: number;
  clientId: number;
  date: string;
  isBuy: number;
  isPersonal: boolean;
  journalRefId: number;
  locationId: number;
  quantity: number;
  typeId: number;
  unitPrice: number;
}
