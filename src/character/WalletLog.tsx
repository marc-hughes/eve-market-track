import React from 'react';

import { useLiveQuery } from 'dexie-react-hooks';

import {
  DataGrid,
  GridColDef,
  GridValueGetterParams
} from '@material-ui/data-grid';
import millify from 'millify';

import { getItem } from '../items/esi-static';
import { ItemImage } from '../items/ItemImage';
import { esiOpenMarket } from '../esi';
import { IStation } from '../config/IStation';
import { IChar } from './IChar';
import { db } from '../data/db';

export const WalletLog: React.FC<{
  character: IChar;
}> = ({ character }) => {
  const stations = useLiveQuery(() => db.stations.toArray());

  const transactions = useLiveQuery(
    () =>
      db.walletTransactions.where({ characterId: character.id }).sortBy('date'),
    [character.id]
  );

  const onCellDoubleClick = (params: GridValueGetterParams) => {
    if (params.field === 'typeId') {
      esiOpenMarket(character, { type_id: params.row.typeId });
    }
  };

  if (!character || !stations || !transactions) return null;

  const stationMap: Record<string, IStation> = stations.reduce(
    (map: Record<string, IStation>, station) => {
      map[String(station.id)] = station;
      return map;
    },
    {}
  );

  const columns: GridColDef[] = [
    { field: 'date', headerName: 'date', width: 180 },
    // { field: 'isBuy', headerName: 'isBuy', width: 90 },
    {
      field: 'locationId',
      headerName: 'locationId',
      width: 110,
      valueFormatter: (params: GridValueGetterParams) =>
        stationMap[params.row.locationId]?.name
    },

    {
      field: 'typeId',
      headerName: 'Item',
      width: 300,
      renderCell: (params: GridValueGetterParams) => (
        <React.Fragment>
          <ItemImage typeId={params.row.typeId} />
          {getItem(params.row.typeId)?.typeName}
        </React.Fragment>
      )
    },
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

  return (
    <DataGrid
      onCellDoubleClick={onCellDoubleClick}
      columns={columns}
      rows={transactions}
      getRowId={(row) => row.transactionId}
    />
  );
};
