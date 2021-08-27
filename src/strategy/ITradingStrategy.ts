export interface ITradingStrategy {
  id: number;

  name: string;
  description: string;

  importMinProfit: number;
  importMinProfitPercent: number;
  importMinDailyProfit: number;
  importMaxStockDays: number;
  importMinDailyVolume: number;

  listMinProfitPercent: number;

  relistMinProfitPercent: number;
  relistStockAheadDays: number;

  default: boolean;
}
