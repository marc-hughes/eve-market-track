import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { ITradeRoute } from './ITradeRoute';

export const useTradeRoutes = (): ITradeRoute[] =>
  useLiveQuery(() => db.tradeRoute.toArray());
