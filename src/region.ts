import { IStation } from './config/IStation';
import { systems } from './systems';

export const getRegionId = (
  stationMap: Record<string, IStation>,
  stationId: number
): number => {
  const station = stationMap[stationId];
  if (!station) return null;

  const toSystem = systems[String(station.solarSystemId)];
  return toSystem?.regionID;
};
