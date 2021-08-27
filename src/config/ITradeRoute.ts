export interface ITradeRoute {
  id?: number;
  fromStation: number;
  toStation: number;
  shippingCost: number;
  tax: number;
  broker: number;
}
