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
  const [focusedItemId, setFocusedItemId] = React.useState<number | null>(null);
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);

  const onNext = () => {
    const index = suggestions.findIndex((s) => s.itemId === focusedItemId);

    if (index > -1) {
      setFocusedItemId(suggestions[index + 1].itemId);
    }
  };

  const generateRelistSuggestions = () => {
    getRelistSuggestions(auth).then(setSuggestions);
  };
  const generateCancelSuggestions = () => {
    getCancelSuggestions(auth).then(setSuggestions);
  };
  const generateListSuggestions = () => {
    getListSuggestions(auth).then(setSuggestions);
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
          rowHeight={30}
          disableColumnMenu={true}
          onRowClick={(params) => setFocusedItemId(params.row.itemId)}
          columns={columns}
          rows={suggestions}
          getRowId={(row) => row.suggestionId}
        />
      </Paper>
      <Drawer
        anchor="bottom"
        open={!!focusedItemId}
        onClose={() => setFocusedItemId(null)}
      >
        <ItemDetails itemId={focusedItemId} onNext={onNext} showNext={true} />
      </Drawer>
    </PageContainer>
  );
};
