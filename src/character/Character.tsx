import { Card } from '@material-ui/core';
import { useLiveQuery } from 'dexie-react-hooks';
import React from 'react';
import { useRouteMatch } from 'react-router';
import { CharacterName } from './CharacterName';
import { db } from '../data/db';
import { IChar } from './IChar';

export const Character: React.FC = () => {
  const match = useRouteMatch<{ characterId: string }>();
  const { characterId } = match.params;

  const character: IChar = useLiveQuery(
    () => db.characters.get({ id: characterId }),
    [characterId]
  );

  if (!character) return null;

  return (
    <Card>
      <CharacterName name={character.name} id={characterId} />
    </Card>
  );
};
