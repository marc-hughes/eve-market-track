export interface ITradeRoute {
  id: number;
  fromStation: string;
  toStation: string;
  shippingCost: number;
  tax: number;
  broker: number;
}
