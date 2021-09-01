import React from 'react';
import Dexie from 'dexie';

import { useLiveQuery } from 'dexie-react-hooks';
import FlagIcon from '@material-ui/icons/Flag';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridValueGetterParams
} from '@material-ui/data-grid';
import millify from 'millify';

import { getItem } from '../items/esi-static';
import { ItemImage } from '../items/ItemImage';
import { esiOpenMarket } from '../esi';
import { IStation } from '../config/IStation';
import { IChar } from './IChar';
import { db } from '../data/db';
import { useStationMap } from '../station-service';
import { IItemNotes } from '../items/ItemNotes';
import { createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';

type ItemSelectedCallback = (itemId: number) => void;

const useStyles = makeStyles(() =>
  createStyles({
    compactRow: {}
  })
);

export const WalletLog: React.FC<{
  character: IChar;
  onItemSelected: ItemSelectedCallback;
}> = ({ character, onItemSelected }) => {
  const stationMap = useStationMap();
  const classes = useStyles();

  const noteMap = useLiveQuery(() =>
    db.itemNotes.toArray().then((notes) =>
      notes.reduce<Record<string, IItemNotes>>((map, current) => {
        map[current.itemId] = current;
        return map;
      }, {})
    )
  );

  const transactions = useLiveQuery(
    () =>
      db.walletTransactions
        .where(['characterId+date'])
        .between([character.id, Dexie.minKey], [character.id, Dexie.maxKey])
        .reverse()
        .toArray(),
    [character]
  );

  // const onCellDoubleClick = (params: GridValueGetterParams) => {
  //   if (params.field === 'typeId') {
  //     esiOpenMarket(character, { type_id: params.row.typeId });
  //   }
  // };

  if (!character || !transactions) return null;

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
          {noteMap[params.row.typeId] && (
            <FlagIcon style={{ color: noteMap[params.row.typeId].color }} />
          )}
        </React.Fragment>
      )
    },
    {
      field: 'unitPrice',
      headerName: 'each',
      width: 120,
      valueFormatter: (params: GridValueGetterParams) =>
        (params.row.isBuy ? '-' : '') +
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
        (params.row.isBuy ? '-' : '') +
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
      rowHeight={30}
      disableColumnMenu={true}
      onRowClick={(params) => onItemSelected(params.row.typeId)}
      columns={columns}
      rows={transactions}
      getRowId={(row) => row.transactionId}
    />
  );
};
