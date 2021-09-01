import { ContactSupportOutlined } from '@material-ui/icons';

import { IStation } from '../config/IStation';
import { ITradeRoute } from '../config/ITradeRoute';
import { esiMarketStats, esiMarketTypes, IAuth, IESIMarketStats } from '../esi';
import { getItem } from '../items/esi-static';
import { getBestSell } from '../orders/orders';
import { systems } from '../systems';
import marketGroupsData from '../static/invMarketGroups.json';

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
}

// Takes a list of groups to ignore, and finds all the child groups we should also ignore.
const ignoreList = (list: number[]): number[] => {
  const groups = marketGroups.filter(
    (group) =>
      list.indexOf(group.parentGroupID) !== -1 &&
      list.indexOf(group.marketGroupID) === -1
  );
  console.info('ignoreList', list.length, groups);

  if (groups.length > 0) {
    return ignoreList([...list, ...groups.map((group) => group.marketGroupID)]);
  }
  return list;
};

export const findDeals = async (
  auth: IAuth,
  route: ITradeRoute,
  stationMap: Record<number, IStation>
): Promise<Deal[]> => {
  //const { fromStation, toStation, shippingCost, tax, broker } = route;
  const fromStation = stationMap[route.fromStation];
  const toStation = stationMap[route.toStation];
  const toSystem = systems[String(toStation.solarSystemId)];
  const toRegion = toSystem.regionID;

  const getStats = async (itemId: number) => {
    try {
      const stats = await esiMarketStats(
        auth,
        { type_id: String(itemId) },
        { regionId: String(toRegion) }
      );
      const recent = stats.data.slice(stats.data.length - 30);
      return recent;
    } catch (e) {
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
        profitPercent: 0
      };
    }

    if (buy && !sell) {
      return {
        itemId: itemId,
        buy: buy.price,
        sell: 0,
        profit: buy.price * 0.2, // Assume 20% profit
        volume: 0,
        profitPercent: 20
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
      volume: 0
    };
  };

  const possibleTypesPage1 = await esiMarketTypes(
    auth,
    {},
    { regionId: String(toRegion) }
  );
  let possibleTypes = possibleTypesPage1.data;

  for (let n = 2; n <= possibleTypesPage1.headers['x-pages']; n++) {
    const p = await esiMarketTypes(
      auth,
      { page: String(n) },
      { regionId: String(toRegion) }
    );
    possibleTypes = possibleTypes.concat(p.data);
  }

  const groupsToIgnore = ignoreList([2, 1954, 1396, 19]);
  debugger;
  console.info(`${possibleTypes.length} types traded`);

  possibleTypes = possibleTypes.filter((itemId) => {
    const itemDef = getItem(itemId);
    return itemDef && groupsToIgnore.indexOf(itemDef.marketGroupID) === -1;
  });

  console.info(`${possibleTypes.length} types filtered`);

  const potentialDeals = [];
  for (const itemId of possibleTypes) {
    potentialDeals.push(await calcDeal(itemId));
  }

  const probablyGoodDeals = potentialDeals.filter(
    (d) => d.profit > 0 && d.profitPercent > 10
  );

  const stats = await asyncBatch(
    probablyGoodDeals,
    async (deal: Deal) => getStats(deal.itemId),
    20
  );

  // Stats:
  // average: number;
  // date: string;
  // lowest: number;
  // order_count: number;
  // volume: number;

  const goodDeals = probablyGoodDeals
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

      deal.volume = Math.round(
        stats[i].reduce((a: number, b: IESIMarketStats) => a + b.volume, 0) /
          stats[i].length
      );
      return deal;
    })

    .filter(
      (d) =>
        !isNaN(d.profitPercent) &&
        !isNaN(d.sell) &&
        !isNaN(d.profit) &&
        !isNaN(d.volume) &&
        d.profit * d.volume > 100000 &&
        d.profitPercent > 10
    );

  return goodDeals;
};
