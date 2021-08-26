import { db } from './data/db';
import { esiStation, esiStructure, IAuth } from './esi';

const addPlayerStation = async (auth: IAuth, structureId: number) => {
  const stationResponse = await esiStructure(
    auth,
    {},
    { structureId: String(structureId) }
  );

  const station = stationResponse.data;

  db.stations.put({
    id: structureId,
    name: station.name,
    ownerId: station.owner_id,
    solarSystemId: station.solar_system_id,
    typeId: station.type_id
  });
  console.info('Found new station', station);
};

const addNPCStation = async (auth: IAuth, locationId: number) => {
  const stationResponse = await esiStation(
    auth,
    {},
    { stationId: String(locationId) }
  );

  const station = stationResponse.data;

  db.stations.put({
    id: locationId,
    name: station.name,
    ownerId: station.owner,
    solarSystemId: station.system_id,
    typeId: station.type_id
  });
  console.info('Found new station', station);
};

export const validateStations = async (
  auth: IAuth,
  stationIds: number[]
): Promise<boolean> => {
  const uniqueIds = new Set(stationIds).values();
  for (const locationId of uniqueIds) {
    const station = await db.stations.get(locationId);
    if (!station) {
      if (locationId > 100000000) {
        await addPlayerStation(auth, locationId);
      } else {
        await addNPCStation(auth, locationId);
      }
    }
  }
  return Promise.resolve(true);
};
