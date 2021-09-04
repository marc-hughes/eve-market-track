import {
  DataGrid,
  GridColDef,
  GridValueGetterParams
} from '@material-ui/data-grid';
import { useLiveQuery } from 'dexie-react-hooks';
import React, { useState } from 'react';
import FlagIcon from '@material-ui/icons/Flag';
import { db } from '../data/db';
import { getItem } from './esi-static';
import { ItemImage } from './ItemImage';
import { Drawer } from '@material-ui/core';
import { ItemDetails } from './ItemDetails';
import { ColorFlag } from './ColorFlag';

export const FlaggedLog = () => {
  const [focusedItemId, setFocusedItemId] = React.useState<number | null>(null);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const notes = useLiveQuery(
    () =>
      db.itemNotes
        .toArray()
        .then((f) => f.filter((n) => !filterColor || n.color === filterColor)),
    [filterColor]
  );

  if (!notes) return null;

  const onItemSelected = (itemId: number) => setFocusedItemId(itemId);

  // TODO: (Refactor) can this whole next-item logic be done in a hook and reused? This, the focusedItem, etc.
  const nextItem = () => {
    if (!focusedItemId) return;
    const index = notes.findIndex((n) => n.itemId === focusedItemId);
    const next = notes[index + 1]?.itemId;
    if (next) {
      setFocusedItemId(next);
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'itemId',
      headerName: 'Item',
      width: 330,
      renderCell: (params: GridValueGetterParams) => (
        <React.Fragment>
          <ItemImage typeId={params.row.itemId} />
          {getItem(params.row.itemId)?.typeName}
        </React.Fragment>
      )
    },

    {
      field: 'color',
      headerName: 'Flag',
      width: 330,
      sortable: false,
      filterable: false,

      renderHeader: () => (
        <ColorFlag value={filterColor} onChange={setFilterColor} />
      ),
      renderCell: (params: GridValueGetterParams) => (
        <FlagIcon style={{ color: params.row.color }} />
      )
    }
  ];

  return (
    <React.Fragment>
      <DataGrid
        rowHeight={30}
        disableColumnMenu={true}
        onRowClick={(params) => onItemSelected(params.row.itemId)}
        columns={columns}
        rows={notes}
        getRowId={(row) => row.itemId}
      />

      <Drawer
        anchor="bottom"
        open={!!focusedItemId}
        onClose={() => setFocusedItemId(null)}
      >
        <ItemDetails itemId={focusedItemId} onNext={nextItem} showNext={true} />
      </Drawer>
    </React.Fragment>
  );
};
