import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  MenuItem,
  Paper,
  Select,
  TextField,
  Toolbar,
  Tooltip
} from '@material-ui/core';
import {
  DataGrid,
  GridColDef,
  GridValueGetterParams
} from '@material-ui/data-grid';
import { Autocomplete } from '@material-ui/lab';
import { useLiveQuery } from 'dexie-react-hooks';
import React, { useEffect } from 'react';
import { useAuth } from '../auth';
import { ITradeRoute } from '../config/ITradeRoute';
import { db } from '../data/db';
import FlagIcon from '@material-ui/icons/Flag';
import { getItem } from '../items/esi-static';
import { ItemImage } from '../items/ItemImage';
import { IItemNotes } from '../items/ItemNotes';
import { useStationMap } from '../station-service';
import { Deal, findDeals, FindDealsOptions } from './import-service';
import styled from '@emotion/styled';
import millify from 'millify';
import { ItemDetails } from '../items/ItemDetails';
import { usePagination } from '../pagination';
import { FullDrawer } from '../FullDrawer';
import {
  getDefaultStrategy,
  useStrategies
} from '../strategy/strategy-service';
import { ITradingStrategy } from '../strategy/ITradingStrategy';

const useStyles = makeStyles(() =>
  createStyles({
    inputGrid: {
      paddingLeft: 10,
      paddingTop: 16
    },
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

// TODO: (Refactor) Get rid of emotion/styled and use only @material-ui styles
const GridContainer = styled.div({
  width: '100%',
  flex: '1 1 auto',
  label: 'GridContainer',
  marginTop: 20,
  fontSize: 10,
  display: 'flex',
  flexDirection: 'column'
});
export const Import: React.FC = () => {
  const routes = useLiveQuery(() => db.tradeRoute.toArray());
  const stationMap = useStationMap();
  const classes = useStyles();
  const [tradeRoute, setTradeRoute] = React.useState(null);
  const [processing, setProcessing] = React.useState(false);
  const [_strategy, setStrategy] = React.useState(null);

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
  } = usePagination<Deal>([]);

  const strategies = useStrategies();

  useEffect(() => {
    if (
      routes &&
      stationMap &&
      routes.length > 0 &&
      stationMap[routes[0].toStation] &&
      !tradeRoute
    ) {
      setTradeRoute(routes[0]);
    }
  }, [routes, stationMap]);

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
    },
    {
      field: 'stock',
      headerName: 'Current sell order stock',
      width: 100,
      valueFormatter: (params: GridValueGetterParams) =>
        millify(params.row.stock)
    },
    {
      field: 'daysOfStock',
      headerName: 'Days of Stock',
      width: 100,
      valueFormatter: (params: GridValueGetterParams) =>
        millify(params.row.daysOfStock)
    },
    {
      field: 'potential',
      headerName: 'Potential Daily Profit',
      width: 100,
      valueFormatter: (params: GridValueGetterParams) =>
        millify(params.row.potential)
    }
  ];

  if (!strategies) return null;

  const strategy: ITradingStrategy =
    _strategy || getDefaultStrategy(strategies);

  const onCalc = () => {
    setProcessing(true);
    findDeals(auth, tradeRoute, stationMap, {
      minProfit: strategy.importMinProfit,
      minProfitPercent: strategy.importMinProfitPercent,
      minDailyProfit: strategy.importMinDailyProfit,
      maxProfitPercent: Number.MAX_SAFE_INTEGER,
      minStockDays: 0,
      maxStockDays: strategy.importMaxStockDays,
      minDailyVolume: strategy.importMinDailyVolume
    })
      .then(setList)
      .then(() => setProcessing(false));
  };

  return (
    <Paper className={classes.paper}>
      {routes && (
        <Grid container>
          <Grid item md={12}>
            <Toolbar>
              <Grid container>
                <Grid item md={6}>
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
                      <TextField
                        {...params}
                        label="Trade Route"
                        variant="standard"
                      />
                    )}
                  />
                </Grid>
                <Grid item md={6} className={classes.inputGrid}>
                  <Select
                    value={strategy.id}
                    label="Import Strategy"
                    onChange={(event) => {
                      setStrategy(
                        strategies.find((s) => s.id === event.target.value)
                      );
                    }}
                  >
                    {strategies.map((strategy) => (
                      <MenuItem key={strategy.id} value={strategy.id}>
                        {strategy.name}
                      </MenuItem>
                    ))}
                  </Select>

                  <Button
                    disabled={processing}
                    onClick={onCalc}
                    variant="outlined"
                  >
                    Find
                  </Button>
                </Grid>
              </Grid>
            </Toolbar>
          </Grid>
        </Grid>
      )}
      <GridContainer>
        {processing && <div>Processing trade route...</div>}
        {processing || (
          <DataGrid
            onSortModelChange={onSortModelChange}
            rowHeight={30}
            onRowClick={(params) => setCurrentItem(params.row as Deal)}
            columns={columns}
            rows={currentList}
            disableColumnMenu={true}
            getRowId={(deal) => deal.itemId}
          />
        )}
      </GridContainer>
      <FullDrawer open={!!currentItem} onClose={() => setCurrentItem(null)}>
        <ItemDetails
          maxPage={count}
          currentPage={currentIndex + 1}
          itemId={currentItem?.itemId}
          onNext={next}
          onPrevious={previous}
          showNext={true}
        />
      </FullDrawer>

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
