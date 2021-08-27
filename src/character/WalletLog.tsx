import React, { useEffect } from 'react';
import Dexie from 'dexie';

import { useLiveQuery } from 'dexie-react-hooks';
import FlagIcon from '@material-ui/icons/Flag';
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams
} from '@material-ui/data-grid';
import millify from 'millify';

import { getItem } from '../items/esi-static';
import { ItemImage } from '../items/ItemImage';
import { IChar } from './IChar';
import { db } from '../data/db';
import { useStationMap } from '../station-service';
import { IItemNotes } from '../items/ItemNotes';
import { createStyles } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import moment from 'moment';
import { IWalletEntry } from './IWalletEntry';
import { SortModel } from '../pagination';

type ItemSelectedCallback = (itemId: IWalletEntry) => void;

const useStyles = makeStyles(() =>
  createStyles({
    compactRow: {}
  })
);
type ItemListCallback = (itemId: IWalletEntry[]) => void;

export const WalletLog: React.FC<{
  character: IChar;
  onItemSelected: ItemSelectedCallback;
  onItemListChanged: ItemListCallback;
  onSortModelChange: (sortModel: SortModel) => void;
}> = ({ character, onItemSelected, onItemListChanged, onSortModelChange }) => {
  const stationMap = useStationMap();
  const classes = useStyles();

  // TODO: (Refactor) Create hook to get the notemap
  const noteMap = useLiveQuery(() =>
    db.itemNotes.toArray().then((notes) =>
      notes.reduce<Record<string, IItemNotes>>((map, current) => {
        map[current.itemId] = current;
        return map;
      }, {})
    )
  );

  // TODO: (Refactor) Create hook to get transactions
  const transactions = useLiveQuery(
    () =>
      db.walletTransactions
        .where(['characterId+date'])
        .between([character.id, Dexie.minKey], [character.id, Dexie.maxKey])
        .reverse()
        .limit(10000)
        .toArray(),
    [character]
  );

  useEffect(
    () => transactions && onItemListChanged(transactions),
    [transactions]
  );

  if (!character || !transactions) return null;

  const columns: GridColDef[] = [
    {
      field: 'date',
      headerName: 'date',
      width: 180,
      valueFormatter: (params: GridValueGetterParams) =>
        moment(params.row.date).format('yyyy-MM-DD HH:mm')
    },
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
      onSortModelChange={onSortModelChange}
      rowHeight={30}
      disableColumnMenu={true}
      onRowClick={(params) => onItemSelected(params.row as IWalletEntry)}
      columns={columns}
      rows={transactions}
      getRowId={(row) => row.transactionId}
    />
  );
};
