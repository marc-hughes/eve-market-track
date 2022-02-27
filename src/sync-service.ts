import { IChar } from './character/IChar';
import { refreshWallet } from './character/wallet-service';
import { updateInventory } from './inventory/inventory-service';
import { updateOwnOrders } from './orders/orders-service';

export const refreshCharacter = async (character: IChar) => {
  await refreshWallet(character);
  await updateOwnOrders(character);
  await updateInventory(character);
};
