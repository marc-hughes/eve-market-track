import { db } from '../data/db';
import Dexie from 'dexie';
import { IESIStatic } from './esi-static';
import { IWalletEntry } from '../character/IWalletEntry';
import { getProfit } from './profit-calc';
import { ITradeRoute } from '../config/ITradeRoute';
import moment from 'moment';

const consumeQty = (
  qty: number,
  transactions: IWalletEntry[]
): { success: boolean; avgPrice: number } => {
  let consumed = 0;
  let total = 0;

  while (consumed < qty && transactions.length > 0) {
    const remaining = qty - consumed;
    const entry = transactions.shift();
    const toTake = Math.min(entry.quantity, remaining);
    if (toTake < entry.quantity) {
      // There are more than enough in this next stack, so put it back minus the amount we took
      transactions.unshift({ ...entry, quantity: entry.quantity - toTake });
    }
    total += toTake * entry.unitPrice;
    consumed += toTake;
  }

  return {
    success: consumed === qty,
    avgPrice: Math.round(total / consumed)
  };
};

// Combines like-priced entries
const collapseList = (transactions: IWalletEntry[]): IWalletEntry[] => {
  return transactions.reduce<IWalletEntry[]>(
    (acc: IWalletEntry[], curr: IWalletEntry) => {
      if (acc.length > 0 && acc[acc.length - 1].unitPrice === curr.unitPrice) {
        // Same price, collapse it
        acc[acc.length - 1].quantity += curr.quantity;
      } else {
        // different price, add it
        acc.push(curr);
      }
      return acc;
    },
    []
  );
};

export interface ProfitLossLine {
  date: string;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  profitPercent: number;
  qty: number;
  success: boolean;
  total: number;
}

export const calculateProfitLoss = async (
  itemDef: IESIStatic,
  itemId: number,
  route: ITradeRoute
): Promise<ProfitLossLine[]> => {
  // TODO: I should be filtering these by trade route location
  const buys = collapseList(
    await db.walletTransactions
      .where(['typeId+isBuy+date'])
      .between([itemId, 1, Dexie.minKey], [itemId, 1, Dexie.maxKey])
      .limit(500)
      .reverse()
      .toArray()
  );

  const sells = collapseList(
    await db.walletTransactions
      .where(['typeId+isBuy+date'])
      .between([itemId, 0, Dexie.minKey], [itemId, 0, Dexie.maxKey])
      .limit(100)
      .reverse()
      .toArray()
  );

  let total = 0;
  return sells.map<ProfitLossLine>((sell) => {
    const { success, avgPrice } = consumeQty(sell.quantity, buys);
    const { profit, profitPercent } = getProfit(
      avgPrice,
      sell.unitPrice,
      itemId,
      route
    );
    return {
      total: (total += profit * sell.quantity),
      success,
      date: moment(sell.date).format('YYYY-MM-DD'),
      buyPrice: avgPrice,
      sellPrice: sell.unitPrice,
      profit: profit * sell.quantity,
      profitPercent,
      qty: sell.quantity
    };
  });
};
