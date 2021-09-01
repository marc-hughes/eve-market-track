import {
  createStyles,
  Drawer,
  makeStyles,
  Paper,
  TextField
} from '@material-ui/core';
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams
} from '@material-ui/data-grid';
import { Autocomplete } from '@material-ui/lab';
import { useLiveQuery } from 'dexie-react-hooks';
import React from 'react';
import { useAuth } from '../auth';
import { ITradeRoute } from '../config/ITradeRoute';
import { db } from '../data/db';
import FlagIcon from '@material-ui/icons/Flag';
import { getItem } from '../items/esi-static';
import { ItemImage } from '../items/ItemImage';
import { IItemNotes } from '../items/ItemNotes';
import { useStationMap } from '../station-service';
import { findDeals } from './import-service';
import styled from '@emotion/styled';
import millify from 'millify';
import { ItemDetails } from '../items/ItemDetails';

const useStyles = makeStyles(() =>
  createStyles({
    paper: {
      width: '100%',
      height: '100%',
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

const GridContainer = styled.div({
  width: '100%',
  flex: '1 1 auto',
  label: 'GridContainer',
  marginTop: 60,
  fontSize: 10,
  display: 'flex',
  flexDirection: 'column'
});
export const Import: React.FC = () => {
  const routes = useLiveQuery(() => db.tradeRoute.toArray());
  const stationMap = useStationMap();
  const classes = useStyles();
  const [focusedItemId, setFocusedItemId] = React.useState<number | null>(null);
  const [tradeRoute, setTradeRoute] = React.useState(null);
  const [processing, setProcessing] = React.useState(false);
  const [deals, setDeals] = React.useState([]);
  const noteMap = useLiveQuery(() =>
    db.itemNotes.toArray().then(
      (notes) =>
        notes?.reduce<Record<string, IItemNotes>>((map, current) => {
          map[current.itemId] = current;
          return map;
        }, {}) || {}
    )
  );
  const auth = useAuth();

  const onChange = (
    event: React.ChangeEvent<{}>,
    newValue: ITradeRoute | null
  ) => {
    setTradeRoute(newValue);
    setProcessing(true);
    findDeals(auth, newValue, stationMap)
      .then(setDeals)
      .then(() => setProcessing(false));
  };

  const columns: GridColDef[] = [
    {
      field: 'typeId',
      headerName: 'Item',
      width: 330,
      renderCell: (params: GridValueGetterParams) => (
        <React.Fragment>
          <ItemImage typeId={params.row.itemId} />
          {getItem(params.row.itemId)?.typeName}
          {noteMap[params.row.itemId] && (
            <FlagIcon style={{ color: noteMap[params.row.itemId].color }} />
          )}
        </React.Fragment>
      )
    },

    {
      field: 'buy',
      headerName: 'Buy Price',
      width: 100,
      valueFormatter: (params: GridValueGetterParams) => millify(params.row.buy)
    },
    {
      field: 'sell',
      headerName: 'Sell Price',
      width: 100,
      valueFormatter: (params: GridValueGetterParams) =>
        millify(params.row.sell)
    },
    {
      field: 'profit',
      headerName: 'Profit',
      width: 100,
      valueFormatter: (params: GridValueGetterParams) =>
        millify(params.row.profit)
    },
    {
      field: 'profitPercent',
      headerName: 'Profit Percent',
      width: 100,
      valueFormatter: (params: GridValueGetterParams) =>
        `${params.row.profitPercent}%`
    },
    {
      field: 'volume',
      headerName: 'Daily Average Volume',
      width: 100,
      valueFormatter: (params: GridValueGetterParams) =>
        millify(params.row.volume)
    }
  ];

  const nextItem = () => {
    if (!focusedItemId || !deals) return;
    const index = deals.findIndex((d) => d.itemId === focusedItemId);
    const next = deals[index + 1].itemId;
    if (next) {
      setFocusedItemId(next);
    }
  };

  return (
    <Paper className={classes.paper}>
      {routes && (
        <Autocomplete
          disabled={processing}
          options={routes}
          value={tradeRoute}
          onChange={onChange}
          getOptionLabel={(option: ITradeRoute) =>
            stationMap[option.fromStation].name +
            ' ⏩🚚⏩ ' +
            stationMap[option.toStation].name
          }
          style={{ width: '100%' }}
          renderInput={(params) => (
            <TextField {...params} label="Trade Route" variant="outlined" />
          )}
        />
      )}
      <GridContainer>
        {processing && <div>Processing trade route...</div>}
        {processing || (
          <DataGrid
            rowHeight={30}
            onRowClick={(params) => setFocusedItemId(params.row.itemId)}
            columns={columns}
            rows={deals}
            disableColumnMenu={true}
            getRowId={(deal) => deal.itemId}
          />
        )}
      </GridContainer>
      <Drawer
        anchor="bottom"
        open={!!focusedItemId}
        onClose={() => setFocusedItemId(null)}
      >
        <ItemDetails itemId={focusedItemId} onNext={nextItem} showNext={true} />
      </Drawer>

      {/* <Backdrop className={classes.backdrop} open={processing}>
        <Alert className={classes.infoBox} severity="info">
          <p>
            Sit Tight. This can take a minute, we're grabbing all the
            transactions and orders then saving them for future use.
          </p>
        </Alert>
        <CircularProgress color="inherit" />
      </Backdrop> */}
    </Paper>
  );
};
