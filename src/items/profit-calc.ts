import { ITradeRoute } from '../config/ITradeRoute';
import { getItem } from './esi-static';

type ProfitCalc = {
  profit: number;
  profitPercent: number;
  tax: number;
  shipping: number;
  broker: number;
};

// Returns a target price based on a markup percentage
// getPrice(100, 1.2, itemId, route) = something bigger than 120 depending on tax/brokers/ship
export const getPrice = (
  buyPrice: number,
  percent: number,
  itemId: number,
  route: ITradeRoute
): number => {
  const itemDef = getItem(itemId);
  const shipping = Math.ceil(route.shippingCost * itemDef.packagedVolume);
  return Math.round(
    (percent * buyPrice + percent * shipping) /
      (1 - (percent * route.tax) / 100 - (percent * route.broker) / 100)
  );
};

// Given a buy & sell price, what is the profit?
export const getProfit = (
  buyPrice: number,
  sellPrice: number,
  itemId: number,
  route: ITradeRoute
): ProfitCalc => {
  const itemDef = getItem(itemId);
  if (!itemDef) {
    console.info("Couldn't find item", itemId);
    return null;
  }
  const shipping = Math.ceil(route.shippingCost * itemDef.packagedVolume);
  const tax = (route.tax / 100) * sellPrice;
  const broker = (route.broker / 100) * sellPrice;
  const profit = sellPrice - buyPrice - tax - broker - shipping;
  const profitPercent =
    buyPrice > 0
      ? Math.round((profit / (buyPrice + tax + broker + shipping)) * 100)
      : 0;

  return {
    profit,
    profitPercent,
    tax,
    shipping,
    broker
  };
};
