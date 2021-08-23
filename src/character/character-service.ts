import { AuthTokenInfo } from '../esi';

export interface CharacterInfo {
  characterID: number;
  characterName: string;
}

export interface Character {
  info: CharacterInfo;
  auth: AuthTokenInfo;
}
