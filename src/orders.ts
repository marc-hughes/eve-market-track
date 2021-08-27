export interface IOrders {
  duration: number;
  isBuyOrder: boolean;
  issued: boolean;
  locationId: number;
  minVolume: number;
  orderId: number;
  price: number;
  range: string;
  typeId: number;
  volumeRemain: number;
  volumeTotal: number;
}
