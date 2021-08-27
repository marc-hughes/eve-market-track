import {
  DataGrid,
  GridColDef,
  GridValueGetterParams
} from '@material-ui/data-grid';
import { useLiveQuery } from 'dexie-react-hooks';
import React, { useEffect, useState } from 'react';
import FlagIcon from '@material-ui/icons/Flag';
import { db } from '../data/db';
import { getItem } from './esi-static';
import { ItemImage } from './ItemImage';
import { ItemDetails } from './ItemDetails';
import { ColorFlag } from './ColorFlag';
import { IItemNotes } from './ItemNotes';
import { usePagination } from '../pagination';
import { FullDrawer } from '../FullDrawer';

export const FlaggedLog = () => {
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const notes = useLiveQuery(
    () =>
      db.itemNotes
        .toArray()
        .then((f) => f.filter((n) => !filterColor || n.color === filterColor)),
    [filterColor]
  );

  const {
    currentIndex,
    setList,
    setCurrentItem,
    onSortModelChange,
    count,
    currentItem,
    next,
    previous
  } = usePagination<IItemNotes>(notes || []);

  useEffect(() => notes && setList(notes), [notes]);

  if (!notes) return null;

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
        onSortModelChange={onSortModelChange}
        rowHeight={30}
        disableColumnMenu={true}
        onRowClick={(params) => setCurrentItem(params.row as IItemNotes)}
        columns={columns}
        rows={notes}
        getRowId={(row) => row.itemId}
      />

      <FullDrawer open={!!currentItem} onClose={() => setCurrentItem(null)}>
        <ItemDetails
          itemId={currentItem?.itemId}
          onNext={next}
          onPrevious={previous}
          showNext={true}
          currentPage={currentIndex + 1}
          maxPage={count}
        />
      </FullDrawer>
    </React.Fragment>
  );
};
