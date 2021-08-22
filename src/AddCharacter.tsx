import { CircularProgress } from '@material-ui/core';
import React, { ReactElement } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import { AuthTokenInfo, esiRequest } from './esi';
import { CharacterName } from './CharacterName';
import { CharacterInfo } from './character-service';
import { db } from './db';

const retrieveCharacterInfo = (
  accessToken: AuthTokenInfo
): Promise<CharacterInfo & AuthTokenInfo> => {
  return esiRequest(accessToken, '/oauth/verify', {}).then((response) => {
    const {
      CharacterID: characterID,
      CharacterName: characterName
      //CharacterOwnerHash: characterOwnerHash,
      //ExpiresOn: expiresOn,
      //IntellectualProperty: intellectualProperty,
      //Scopes: scopes,
      //TokenType: tokenType
    } = response.data;
    console.info(characterName, characterID);
    return {
      ...accessToken,
      characterID,
      characterName
    };
  });
};

const parseAuthToken = (result: any): AuthTokenInfo => {
  if (result.status === 200) {
    const {
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: refreshToken
    } = result.data;

    return { accessToken, expiresIn, refreshToken };
  } else {
    throw new Error('Could not get auth token');
  }
};

export const AddCharacter = (): ReactElement => {
  const [error, setError] = React.useState(null);
  const [character, setCharacter] = React.useState(null);
  const params = new URLSearchParams(window.location.search);

  const code = params.get('code');
  const codeVerifier = params.get('codeVerifier');

  useEffect(() => {
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', '6d9027a5346d42e1babfda3a8b34a1f1');
    params.append('code_verifier', codeVerifier);
    console.info(params);

    axios
      .post('https://login.eveonline.com/v2/oauth/token', params)
      .then(parseAuthToken)
      .then(retrieveCharacterInfo)
      .then((result) => {
        setCharacter({ name: result.characterName, id: result.characterID });
        db.characters.add({
          name: result.characterName,
          id: result.characterID,
          wallet: 0,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expires: Math.round(new Date().getTime() / 1000) + result.expiresIn
        });
        return result;
      })
      .catch((e) => setError('Could not get auth token'));
  }, [code]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      Loading Character details...
      <CircularProgress />
      {character && <CharacterName {...character} />}
    </div>
  );
};
