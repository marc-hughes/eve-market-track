import React, { useEffect, ReactElement } from 'react';
import { CircularProgress } from '@material-ui/core';
import axios from 'axios';
import { AuthTokenInfo, esiLoginVerify } from '../esi';
import { CharacterInfo } from './character-service';
import { db } from '../data/db';
import { Redirect } from 'react-router';
import { refreshWallet } from './wallet-service';
import { getChallenge, getOuthCreds, resetChallenge } from './oauth';

const retrieveCharacterInfo = (
  accessToken: PartialAuthToken
): Promise<CharacterInfo & AuthTokenInfo> => {
  console.info('retrieveCharInfo', accessToken);
  return esiLoginVerify(accessToken, {}, {}, true).then((response) => {
    const { CharacterID: characterId, CharacterName: characterName } =
      response.data;
    console.info('Responded with', response.data);
    return {
      ...accessToken,
      characterId,
      characterName
    };
  });
};

interface PartialAuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
const parseAuthToken = (result: any): PartialAuthToken => {
  if (result.status === 200) {
    console.info('Got token', result.data);
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
  const { codeVerifier } = getChallenge();
  resetChallenge();

  useEffect(() => {
    const creds = getOuthCreds();
    const { clientId } = creds;
    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', clientId);
    params.append('code_verifier', codeVerifier);
    console.info('Getting token', creds, params.toString());

    axios
      .post('https://login.eveonline.com/v2/oauth/token', params)
      .then(parseAuthToken)
      .then(retrieveCharacterInfo)
      .then((result) => {
        console.info('Retrieved char info', result);
        setCharacter({ name: result.characterName, id: result.characterId });
        const char = {
          name: result.characterName,
          id: result.characterId,
          wallet: 0,
          accessToken: result.accessToken,
          refreshToken: result.refreshToken,
          expires: Math.round(new Date().getTime() / 1000) + result.expiresIn
        };

        db.characters
          .delete(result.characterId)
          .catch(() => true) // just ignore deletion errors for now
          .then(() => {
            db.characters.add(char);
          });
        return char;
      })
      .then(refreshWallet)
      .catch(() => setError('Could not get auth token'));
  }, [code]);

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      Loading Character details...
      <CircularProgress />
      {character && <Redirect to={`/character/${character.id}`} />}
    </div>
  );
};
