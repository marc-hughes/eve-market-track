import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { ITradingStrategy } from './ITradingStrategy';

const defaultStrategies: ITradingStrategy[] = [
  {
    id: -1,
    name: 'Conservative',
    description:
      'Conservative strategy focusing on the best deals and limiting relists',

    importMinProfit: 1,
    importMinProfitPercent: 20,
    importMinDailyProfit: 1000000,
    importMaxStockDays: 4,
    importMinDailyVolume: 5,

    listMinProfitPercent: 10,

    relistMinProfitPercent: 8,
    relistStockAheadDays: 0.75,
    default: false
  },
  {
    id: -2,
    name: 'Aggressive',
    description:
      'Aggressive strategy focusing on taking advantage of every possible bit of profit',

    importMinProfit: 1,
    importMinProfitPercent: 2,
    importMinDailyProfit: 1000,
    importMinDailyVolume: 1,
    importMaxStockDays: 10,

    listMinProfitPercent: 2,

    relistMinProfitPercent: 1,
    relistStockAheadDays: 0,
    default: false
  }
];

export const getStrategies = (): Promise<ITradingStrategy[]> =>
  db.strategies
    .toArray()
    .then((strategies) => [...defaultStrategies, ...strategies]);

export const useStrategies = (): ITradingStrategy[] =>
  useLiveQuery(getStrategies);

export const getDefaultStrategy = (
  strategies: ITradingStrategy[]
): ITradingStrategy => strategies.find((s) => s.default) || strategies[0];

export const deleteStrategy = (strat: ITradingStrategy) => {
  db.itemNotes.where('strategy').equals(strat.id).modify({ strategy: -1 });
  db.strategies.delete(strat.id);
};

export const findStratForItem = async (
  allStrategies: ITradingStrategy[],
  itemId: number
): Promise<ITradingStrategy> => {
  const note = await db.itemNotes.get(itemId);
  const stratId = note?.strategy || -1;
  const strategy = allStrategies.find((s) => s.id === stratId);
  return strategy;
};

export const getStratForItem = async (
  itemId: number
): Promise<ITradingStrategy> => {
  const allStrategies = await getStrategies();
  const note = await db.itemNotes.get(itemId);
  const stratId = note?.strategy || -1;
  const strategy = allStrategies.find((s) => s.id === stratId);
  return strategy;
};
