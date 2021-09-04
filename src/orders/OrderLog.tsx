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
import { esiOpenMarket } from '../esi';
import { IChar } from '../character/IChar';
import { db } from '../data/db';
import { useStationMap } from '../station-service';
import { IOwnOrder } from './orders';
import { IItemNotes } from '../items/ItemNotes';
import moment from 'moment';

type ItemSelectedCallback = (itemId: number) => void;
type ItemListCallback = (itemId: number[]) => void;

export const OrderLog: React.FC<{
  character: IChar;
  onItemSelected: ItemSelectedCallback;
  onItemListChanged: ItemListCallback;
}> = ({ character, onItemSelected, onItemListChanged }) => {
  const stationMap = useStationMap();

  // TODO: (Refactor) extract to hook
  const orders = useLiveQuery(
    () =>
      character &&
      db.ownOrders
        .where(['characterId+issued'])
        .between([character.id, Dexie.minKey], [character.id, Dexie.maxKey])
        .reverse()
        .toArray(),
    [character]
  );

  useEffect(
    () => orders && onItemListChanged(orders.map((o) => o.typeId)),
    [orders]
  );

  // TODO: (Refactor) extract to hook
  const noteMap = useLiveQuery(() =>
    db.itemNotes.toArray().then((notes) =>
      notes.reduce<Record<string, IItemNotes>>((map, current) => {
        map[current.itemId] = current;
        return map;
      }, {})
    )
  );

  if (!character || !orders) return null;

  // TODO: (Refactor) useMemo the column defs
  const columns: GridColDef[] = [
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
      width: 100,
      valueFormatter: (params: GridValueGetterParams) =>
        `${millify(params.row.volumeRemain, {
          precision: 2
        })} /  
      ${millify(params.row.volumeTotal, {
        precision: 2
      })}`
    },

    {
      field: 'value',
      headerName: 'value',
      width: 100,
      valueGetter: (params: GridValueGetterParams) =>
        params.row.price * params.row.volumeRemain,
      valueFormatter: (params: GridValueGetterParams) =>
        millify(params.row.price * params.row.volumeRemain, {
          precision: 2
        })
    },
    {
      field: 'issued',
      headerName: 'Issued',
      width: 200,
      valueFormatter: (params: GridValueGetterParams) =>
        moment(params.row.issued).format('yyyy-MM-DD HH:mm')
    }
  ];

  return (
    <DataGrid
      rowHeight={30}
      disableColumnMenu={true}
      onRowClick={(params) => onItemSelected(params.row.typeId)}
      columns={columns}
      rows={orders}
      getRowId={(row) => row.orderId}
    />
  );
};
