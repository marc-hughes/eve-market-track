export interface IStation {
  id: number;
  name: string;
  ownerId: number;
  solarSystemId: number;
  typeId: number;
  founderId: number; // which character ID found this station (and has access to it)?
}
