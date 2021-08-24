import { Button, Card, CardActions, Table } from '@material-ui/core';
import { useLiveQuery } from 'dexie-react-hooks';
import React from 'react';
import { useRouteMatch } from 'react-router';
import { CharacterName } from './CharacterName';
import { db } from '../data/db';
import { IChar } from './IChar';
import { refreshWallet } from './wallet-service';
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams
} from '@material-ui/data-grid';
import millify from 'millify';
import styled from '@emotion/styled';

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
  marginTop: 10
});

const columns: GridColDef[] = [
  { field: 'date', headerName: 'date', width: 180 },
  // { field: 'isBuy', headerName: 'isBuy', width: 90 },
  { field: 'locationId', headerName: 'locationId', width: 110 },

  { field: 'typeId', headerName: 'typeId', width: 150 },
  {
    field: 'unitPrice',
    headerName: 'each',
    width: 120,
    valueFormatter: (params: GridValueGetterParams) =>
      millify(params.getValue(params.id, 'unitPrice') as number, {
        precision: 2
      })
  },
  { field: 'quantity', headerName: 'qty', width: 100 },
  {
    field: 'totalPrice',
    headerName: 'total',
    width: 120,
    valueFormatter: (params: GridValueGetterParams) =>
      millify(params.getValue(params.id, 'totalPrice') as number, {
        precision: 2
      }),
    valueGetter: (params: GridValueGetterParams) =>
      (params.getValue(params.id, 'quantity') as number) *
      (params.getValue(params.id, 'unitPrice') as number)
  }
];

export const Character: React.FC = () => {
  const match = useRouteMatch<{ characterId: string }>();
  const { characterId } = match.params;
  const transactions = useLiveQuery(
    () => db.walletTransactions.where({ characterId }).sortBy('date'),
    [characterId]
  );

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
        <DataGrid
          columns={columns}
          rows={transactions}
          getRowId={(row) => row.transactionId}
        />
      </GridContainer>
    </PageContainer>
  );
};
