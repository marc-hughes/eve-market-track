import systemsData from './static/mapSolarSystems.json';

export interface IESISystem {
  regionID: number;
  constellationID: number;
  solarSystemID: number;
  solarSystemName: string;
}

interface IESISystemHash {
  [key: string]: IESISystem;
}

export const systems: IESISystemHash = systemsData;
