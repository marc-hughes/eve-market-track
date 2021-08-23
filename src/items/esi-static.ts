import data from '../static/invTypesMinimal.json';

export interface IESIStatic {
  packagedVolume: number;
  groupID: number;
  typeName: string;
  volume: number;
  basePrice: number;
  marketGroupID: number;
  iconID: number;
  graphicID: number;
}

interface IESIStaticHash {
  [key: string]: IESIStatic;
}

const typedData: IESIStaticHash = data;

export const itemNames: string[] = Object.values(typedData).map(
  (x) => x.typeName
);

// This used to be a complicated hook with loading logic & syncronized between multiple instances
// but we always used the data, so we just do it the easy way now.
export const useStatic = (itemId: string | number): IESIStatic => {
  return typedData[String(itemId)];
};

export const getItem = (itemId: string | number): IESIStatic =>
  typedData[String(itemId)];
