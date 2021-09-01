import React, { ChangeEvent, useEffect, useState } from 'react';
import Dexie from 'dexie';
import FlagIcon from '@material-ui/icons/Flag';
import { useLiveQuery } from 'dexie-react-hooks';

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
import { useStationMap, useStations } from '../station-service';
import { IStation } from '../config/IStation';
import { StationInput } from '../config/StationSelect';
import { makeStyles } from '@material-ui/core';
import { IItemNotes } from '../items/ItemNotes';

const useStyle = makeStyles({
  stationSelect: {
    position: 'relative',
    top: 10
  }
});

type ItemSelectedCallback = (itemId: number) => void;
type ItemListCallback = (itemId: number[]) => void;

export const InventoryLog: React.FC<{
  character: IChar;
  onItemSelected: ItemSelectedCallback;
  onItemListChanged: ItemListCallback;
}> = ({ character, onItemSelected, onItemListChanged }) => {
  const stationMap = useStationMap();
  const stations = useStations();
  const [station, setStation] = useState(null);
  const classes = useStyle();

  useEffect(() => {
    if (station || !stations) {
      return;
    }
    const activeStation = window.localStorage.getItem('activeStation');
    const last = stations.find((s) => s.id === parseInt(activeStation, 10));
    if (last) {
      setStation(last);
    } else if (stations.length > 0) {
      setStation(stations[0]);
    }
  }, [stations]);

  const noteMap = useLiveQuery(() =>
    db.itemNotes.toArray().then(
      (notes) =>
        notes?.reduce<Record<string, IItemNotes>>((map, current) => {
          map[current.itemId] = current;
          return map;
        }, {}) || {}
    )
  );

  const inventory = useLiveQuery(
    () =>
      db.inventory
        .where(['characterId+locationId'])
        .between([character.id, Dexie.minKey], [character.id, Dexie.maxKey])
        .toArray(),
    [character]
  );

  const onPickStation = (event: ChangeEvent, value: IStation) => {
    window.localStorage.setItem('activeStation', String(value.id));
    setStation(value);
  };

  useEffect(() => {
    onItemListChanged &&
      inventory &&
      onItemListChanged(
        inventory
          .filter((i) => i.locationId === station?.id)
          .map((i) => i.typeId)
      );
  }, [inventory, station]);

  if (!character || !inventory || !stations) return null;

  const columns: GridColDef[] = [
    {
      field: 'locationId',
      headerName: 'locationId',
      width: 300,
      sortable: false,
      renderHeader: (params) => (
        <StationInput
          className={classes.stationSelect}
          value={station}
          onChange={onPickStation}
          label="Station"
          stations={stations}
        />
      ),
      valueFormatter: (params: GridValueGetterParams) =>
        stationMap[params.row.locationId]?.name
    },

    {
      field: 'typeId',
      headerName: 'Item',
      width: 330,
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

    { field: 'quantity', headerName: 'qty', width: 100 }
  ];

  return (
    <React.Fragment>
      <DataGrid
        rowHeight={30}
        disableColumnMenu={true}
        onRowClick={(params) => onItemSelected(params.row.typeId)}
        columns={columns}
        rows={inventory.filter((i) => i.locationId === station?.id)}
        getRowId={(row) => row.itemId}
      />
    </React.Fragment>
  );
};
