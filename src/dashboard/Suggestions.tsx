import React, { useEffect } from 'react';
import styled from '@emotion/styled';
import {
  makeStyles,
  createStyles,
  Paper,
  Button,
  Drawer,
  AppBar,
  Toolbar
} from '@material-ui/core';
import {
  getCancelSuggestions,
  getListSuggestions,
  getRelistSuggestions,
  Suggestion
} from './suggestion-service';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridValueFormatterParams,
  GridValueGetterParams
} from '@material-ui/data-grid';
import { getItem } from '../items/esi-static';
import { ItemImage } from '../items/ItemImage';
import { useAuth } from '../auth';
import { ItemDetails } from '../items/ItemDetails';
import { usePagination } from '../pagination';
import { FullDrawer } from '../FullDrawer';

// TODO: (Refactor) Get rid of emotion/styled and use only @material-ui styles
const PageContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  label: 'PageContainer',
  position: 'relative'
});

const useStyles = makeStyles(() =>
  createStyles({
    paper: {
      width: '100%',
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    avatar: {
      marginRight: 15
    },
    tabs: {
      marginLeft: 10,
      flexGrow: 1
    }
  })
);

export const Suggestions: React.FC = () => {
  const classes = useStyles();
  const auth = useAuth();
  const {
    currentIndex,
    currentList,
    setList,
    setCurrentItem,
    onSortModelChange,
    count,
    currentItem,
    next,
    previous
  } = usePagination<Suggestion>([]);

  const generateRelistSuggestions = () => {
    getRelistSuggestions(auth).then((l) => {
      setList(l);
    });
  };
  const generateCancelSuggestions = () => {
    getCancelSuggestions(auth).then((l) => {
      setList(l);
    });
  };
  const generateListSuggestions = () => {
    getListSuggestions(auth).then((l) => {
      setList(l);
    });
  };

  const columns: GridColDef[] = [
    {
      field: 'description',
      headerName: 'Suggestion',
      width: 300
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 200
    },
    {
      field: 'itemId',
      headerName: 'Item',
      width: 300,
      renderCell: (params: GridValueGetterParams) => (
        <React.Fragment>
          <ItemImage typeId={params.row.itemId} />
          {getItem(params.row.itemId)?.typeName}
        </React.Fragment>
      )
    },
    {
      field: 'profitPercent',
      headerName: 'Profit Percent',
      width: 100,
      valueFormatter: (params: GridValueFormatterParams) =>
        `${params.row.profitPercent}%`
    },
    {
      field: 'importance',
      headerName: 'Importance',
      width: 100
    }
  ];

  return (
    <PageContainer>
      <AppBar position="relative">
        <Toolbar>
          <Button variant="contained" onClick={generateRelistSuggestions}>
            Order Relist Suggestions
          </Button>
          <Button variant="contained" onClick={generateCancelSuggestions}>
            Order Cancel Suggestions
          </Button>
          <Button variant="contained" onClick={generateListSuggestions}>
            New Listing Suggestions
          </Button>
        </Toolbar>
      </AppBar>
      <Paper square className={classes.paper}>
        <DataGrid
          onSortModelChange={onSortModelChange}
          rowHeight={30}
          disableColumnMenu={true}
          onRowClick={(params) => setCurrentItem(params.row as Suggestion)}
          columns={columns}
          rows={currentList}
          getRowId={(row) => row.suggestionId}
        />
      </Paper>
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
    </PageContainer>
  );
};
