import { Button, CardActions } from '@material-ui/core';
import { useLiveQuery } from 'dexie-react-hooks';
import React from 'react';
import { useRouteMatch } from 'react-router';
import { CharacterName } from './CharacterName';
import { db } from '../data/db';
import { IChar } from './IChar';
import { refreshWallet } from './wallet-service';
import styled from '@emotion/styled';
import { WalletLog } from './WalletLog';

const PageContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  label: 'PageContainer'
});

const GridContainer = styled.div({
  width: '100%',
  flex: '1 1 auto',
  label: 'GridContainer',
  marginTop: 10,
  fontSize: 10
});

export const Character: React.FC = () => {
  const match = useRouteMatch<{ characterId: string }>();
  const { characterId } = match.params;

  const character: IChar = useLiveQuery(
    () => db.characters.get({ id: characterId }),
    [characterId]
  );

  if (!character) return null;

  return (
    <PageContainer>
      <CharacterName name={character.name} id={characterId}>
        <CardActions>
          <Button
            onClick={() => refreshWallet(character)}
            variant="contained"
            color="primary"
          >
            Refresh Transactions
          </Button>
        </CardActions>
      </CharacterName>
      <GridContainer>
        <WalletLog character={character} />
      </GridContainer>
    </PageContainer>
  );
};
