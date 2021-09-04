import { useLiveQuery } from 'dexie-react-hooks';
import { IStation } from './config/IStation';
import { db } from './data/db';
import { esiStation, esiStructure, IAuth } from './esi';

const addPlayerStation = async (auth: IAuth, structureId: number) => {
  // TODO: Error handling
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
  // TODO: Error handling
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

export const useStations = (): IStation[] =>
  useLiveQuery(() => db.stations.toArray());

export const getStationMap = async (): Promise<Record<string, IStation>> => {
  const stations = await db.stations.toArray();
  if (!stations) {
    return {};
  }

  const map = stations.reduce((map: Record<string, IStation>, station) => {
    map[String(station.id)] = station;
    return map;
  }, {});

  return new Proxy(map, {
    get: function (object, property: string): IStation {
      // eslint-disable-next-line no-prototype-builtins
      return object.hasOwnProperty(property)
        ? object[property]
        : {
            id: parseInt(property, 10),
            name: property,
            ownerId: 0,
            solarSystemId: 0,
            typeId: 0
          };
    }
  });
};

// TODO: (Refactor) duplicated code between this and getStationMap
export const useStationMap = (): Record<string, IStation> => {
  const stations = useLiveQuery(() => db.stations.toArray());
  if (!stations) {
    return {};
  }

  const map = stations.reduce((map: Record<string, IStation>, station) => {
    map[String(station.id)] = station;
    return map;
  }, {});

  return new Proxy(map, {
    get: function (object, property: string): IStation {
      // eslint-disable-next-line no-prototype-builtins
      return object.hasOwnProperty(property)
        ? object[property]
        : {
            id: parseInt(property, 10),
            name: property,
            ownerId: 0,
            solarSystemId: 0,
            typeId: 0
          };
    }
  });
};
