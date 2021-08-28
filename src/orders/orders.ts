export interface IOrders {
  duration: number;
  isBuyOrder: boolean;
  issued: string;
  locationId: number;
  minVolume: number;
  orderId: number;
  price: number;
  range: string;
  typeId: number;
  volumeRemain: number;
  volumeTotal: number;
}

export interface IOwnOrder extends IOrders {
  characterId: number;
  escrow: number;
  isCorporation: boolean;
  regionId: number;
}
