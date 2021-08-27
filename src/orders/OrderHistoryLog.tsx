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
import { IChar } from '../character/IChar';
import { db } from '../data/db';
import { useStationMap } from '../station-service';
import { IItemNotes } from '../items/ItemNotes';
import { IOwnOrderHistory } from './orders';
import { SortModel } from '../pagination';

type ItemSelectedCallback = (itemId: IOwnOrderHistory) => void;
type ItemListCallback = (itemId: IOwnOrderHistory[]) => void;

export const OrderHistoryLog: React.FC<{
  character: IChar;
  onItemSelected: ItemSelectedCallback;
  onItemListChanged: ItemListCallback;
  onSortModelChange: (sortModel: SortModel) => void;
}> = ({ character, onItemSelected, onItemListChanged, onSortModelChange }) => {
  const stationMap = useStationMap();
  const orders = useLiveQuery(
    () =>
      character &&
      db.orderHistory
        .where({ characterId: character.id })
        .reverse()
        .limit(10000)
        .toArray(),
    [character]
  );

  const noteMap = useLiveQuery(() =>
    db.itemNotes.toArray().then((notes) =>
      notes.reduce<Record<string, IItemNotes>>((map, current) => {
        map[current.itemId] = current;
        return map;
      }, {})
    )
  );

  useEffect(() => orders && onItemListChanged(orders), [orders]);

  if (!character || !orders) return null;

  // TODO: (Refactor) useMemo the column defs
  const columns: GridColDef[] = [
    {
      field: 'locationId',
      headerName: 'locationId',
      width: 220,
      valueFormatter: (params: GridValueGetterParams) =>
        stationMap[params.row.locationId]?.name
    },

    { field: 'state', headerName: 'State', width: 100 },

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
      field: 'price',
      headerName: 'each',
      width: 120,
      valueFormatter: (params: GridValueGetterParams) =>
        (params.row.isBuyOrder ? '-' : '') +
        millify(params.getValue(params.id, 'price') as number, {
          precision: 2
        })
    },

    {
      field: 'volumeRemain',
      headerName: 'qty',
      width: 150,
      valueFormatter: (params: GridValueGetterParams) =>
        `${millify(params.row.volumeRemain, {
          precision: 2
        })} /  
      ${millify(params.row.volumeTotal, {
        precision: 2
      })}`
    }
  ];

  return (
    <DataGrid
      onSortModelChange={onSortModelChange}
      rowHeight={30}
      disableColumnMenu={true}
      onRowClick={(params) => onItemSelected(params.row as IOwnOrderHistory)}
      columns={columns}
      rows={orders}
      getRowId={(row) => row.orderId}
    />
  );
};
