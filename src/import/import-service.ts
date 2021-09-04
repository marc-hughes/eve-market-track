import { IStation } from '../config/IStation';
import { ITradeRoute } from '../config/ITradeRoute';
import { getItem } from '../items/esi-static';
import { getBestSell } from '../orders/orders';
import moment from 'moment';
import { systems } from '../systems';
import marketGroupsData from '../static/invMarketGroups.json';
import { getMarketStats, getStock } from '../items/itemstat';
import { esiMarketTypes, IAuth, IESIMarketStats } from '../esi';

interface MarketGroup {
  marketGroupID: number;
  parentGroupID: number;
  marketGroupName: string;
  description: string;
  iconID: number;
  hasTypes: number;
}

const marketGroups: MarketGroup[] = marketGroupsData;

// eslint-disable-next-line @typescript-eslint/no-var-requires
const asyncBatch = require('async-batch').default;

interface Deal {
  itemId: number;
  buy: number;
  sell: number;
  profit: number;
  volume: number;
  profitPercent: number;
  potential: number;
  stock: number;
  daysOfStock: number;
}

// Takes a list of groups to ignore, and finds all the child groups we should also ignore.
const ignoreList = (list: number[]): number[] => {
  const groups = marketGroups.filter(
    (group) =>
      list.indexOf(group.parentGroupID) !== -1 &&
      list.indexOf(group.marketGroupID) === -1
  );

  if (groups.length > 0) {
    return ignoreList([...list, ...groups.map((group) => group.marketGroupID)]);
  }
  return list;
};

export type FindDealsOptions = {
  minProfit: number;
  minProfitPercent: number;
  minDailyProfit: number;
  maxProfitPercent: number;
  minStockDays: number;
  maxStockDays: number;
  minDailyVolume: number;
};

const getPossibleTypes = async (auth: IAuth, region: number) => {
  // TODO: Error handling
  const possibleTypesPage1 = await esiMarketTypes(
    auth,
    {},
    { regionId: String(region) }
  );

  let possibleTypes = possibleTypesPage1.data;

  for (let n = 2; n <= possibleTypesPage1.headers['x-pages']; n++) {
    const p = await esiMarketTypes(
      auth,
      { page: String(n) },
      { regionId: String(region) }
    );
    possibleTypes = possibleTypes.concat(p.data);
  }

  // Going to ignore things like skins and blueprints
  const groupsToIgnore = ignoreList([2, 1954, 1396, 19, 1907]);

  return possibleTypes.filter((itemId) => {
    const itemDef = getItem(itemId);
    return itemDef && groupsToIgnore.indexOf(itemDef.marketGroupID) === -1;
  });
};

export const findDeals = async (
  auth: IAuth,
  route: ITradeRoute,
  stationMap: Record<number, IStation>,
  options: FindDealsOptions = {
    minProfit: 0,
    minProfitPercent: 10,
    minDailyProfit: 100000,
    maxProfitPercent: Number.MAX_SAFE_INTEGER,
    minStockDays: 0,
    maxStockDays: Number.MAX_SAFE_INTEGER,
    minDailyVolume: 0
  }
): Promise<Deal[]> => {
  //const { fromStation, toStation, shippingCost, tax, broker } = route;
  const fromStation = stationMap[route.fromStation];
  const toStation = stationMap[route.toStation];
  const toSystem = systems[String(toStation.solarSystemId)];
  const toRegion = toSystem.regionID;

  const getStats = async (itemId: number): Promise<IESIMarketStats[]> => {
    try {
      const stats = await getMarketStats(auth, itemId, toRegion);

      // I want this to return the last 30 days of stats. But the data we get can have holes.
      const days = Array(30)
        .fill(0)
        .map((_, i) => moment().subtract(i, 'days').format('YYYY-MM-DD'))
        .reverse();

      const recent = days.map((day) => {
        const stat = stats.find((stat) => stat.date === day);
        if (!stat) {
          return {
            date: day,
            average: 0,
            lowest: 0,
            order_count: 0,
            volume: 0
          };
        } else {
          return stat;
        }
      });

      return recent;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const calcDeal = async (itemId: number): Promise<Deal> => {
    const buy = await getBestSell(itemId, fromStation.id);
    const sell = await getBestSell(itemId, toStation.id);
    const itemDef = getItem(itemId);

    if (!buy) {
      return {
        itemId: itemId,
        buy: 0,
        sell: 0,
        profit: 0,
        volume: 0,
        profitPercent: 0,
        potential: 0,
        stock: 0,
        daysOfStock: 0
      };
    }

    if (buy && !sell) {
      return {
        itemId: itemId,
        buy: buy.price,
        sell: 0,
        profit: buy.price * 0.2, // Assume 20% profit
        volume: 0,
        profitPercent: 20,
        potential: 0,
        stock: 0,
        daysOfStock: 0
      };
    }

    const shipping = itemDef
      ? Math.ceil(route.shippingCost * itemDef.packagedVolume)
      : 0;
    const tax = (route.tax / 100) * sell.price;
    const broker = (route.broker / 100) * sell.price;
    const profit = sell.price - buy.price - tax - broker - shipping;
    const profitPercent =
      buy.price > 0
        ? Math.round((profit / (buy.price + tax + broker + shipping)) * 100)
        : 0;

    return {
      itemId: itemId,
      buy: buy.price,
      sell: sell.price,
      profit: profit,
      profitPercent,
      volume: 0,
      potential: 0,
      stock: 0,
      daysOfStock: 0
    };
  };

  const possibleTypes = await getPossibleTypes(auth, toRegion);

  console.info(`${possibleTypes.length} types filtered`);

  const potentialDeals = [];
  for (const itemId of possibleTypes) {
    potentialDeals.push(await calcDeal(itemId));
  }

  // Filter out deals that don't meet our criteria, before we retrieve volume data
  const goodDealsBeforeVolume = potentialDeals.filter(
    (d) =>
      d.profit > options.minProfit && d.profitPercent > options.minProfitPercent
  );

  // Grab stats (which include volume data) for our good deals
  const stats = await asyncBatch(
    goodDealsBeforeVolume,
    async (deal: Deal) => getStats(deal.itemId),
    30
  );

  const stock = await asyncBatch(
    goodDealsBeforeVolume,
    async (deal: Deal) => getStock(deal.itemId, toStation.id),
    20
  );

  // Stats:
  // average: number;
  // date: string;
  // lowest: number;
  // order_count: number;
  // volume: number;

  // Now we can narrow down our deals based on volume
  const goodDeals = goodDealsBeforeVolume
    .map((deal, i) => {
      if (deal.sell === 0) {
        // use historical data instead
        deal.sell = Math.round(
          stats[i].reduce((a: number, b: IESIMarketStats) => a + b.lowest, 0) /
            stats[i].length
        );
        const itemDef = getItem(deal.itemId);
        const shipping = itemDef
          ? Math.ceil(route.shippingCost * itemDef.packagedVolume)
          : 0;
        const tax = (route.tax / 100) * deal.sell;
        const broker = (route.broker / 100) * deal.sell;
        const profit = deal.sell - deal.buy - tax - broker - shipping;
        const profitPercent =
          deal.buy > 0
            ? Math.round((profit / (deal.buy + tax + broker + shipping)) * 100)
            : 0;
        deal.profitPercent = profitPercent;
        deal.profit = profit;
      }

      deal.volume =
        stats[i].reduce((a: number, b: IESIMarketStats) => a + b.volume, 0) /
        stats[i].length;

      if (deal.volume > 5) {
        deal.volume = Math.round(deal.volume);
      }

      deal.stock = stock[i];
      deal.potential = deal.volume * deal.profit;
      deal.daysOfStock = deal.stock / Math.max(deal.volume, 0.001);
      return deal;
    })
    .filter((d) => {
      const stockDays = d.stock / Math.max(d.volume, 0.001);

      return (
        !isNaN(d.profitPercent) &&
        !isNaN(d.sell) &&
        !isNaN(d.profit) &&
        !isNaN(d.volume) &&
        d.volume >= options.minDailyVolume &&
        d.profit >= options.minProfit &&
        d.profit * d.volume >= options.minDailyProfit &&
        d.profitPercent >= options.minProfitPercent &&
        d.profitPercent <= options.maxProfitPercent &&
        stockDays >= options.minStockDays &&
        stockDays <= options.maxStockDays
      );
    });

  return goodDeals;
};
