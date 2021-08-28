export interface IWalletEntry {
  transactionId: number;
  characterId: number;
  clientId: number;
  date: string;
  isBuy: boolean;
  isPersonal: boolean;
  journalRefId: number;
  locationId: number;
  quantity: number;
  typeId: number;
  unitPrice: number;
}
