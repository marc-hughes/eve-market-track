import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { AuthTokenInfo } from '../esi';
import { IChar } from './IChar';

export interface CharacterInfo {
  characterID: number;
  characterName: string;
}

export interface Character {
  info: CharacterInfo;
  auth: AuthTokenInfo;
}

export const useCharacters = (): IChar[] =>
  useLiveQuery(() => db.characters.toArray());
