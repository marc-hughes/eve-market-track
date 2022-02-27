import React, { ChangeEvent, useState } from 'react';

import { useStations } from '../station-service';
import { IStation } from './IStation';
import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  Paper,
  TextField
} from '@material-ui/core';
import { db } from '../data/db';
import { ITradeRoute } from './ITradeRoute';
import { Alert } from '@material-ui/lab';
import { StationInput } from './StationSelect';
import { ITradingStrategy } from '../strategy/ITradingStrategy';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      flexGrow: 1,
      padding: 20
    },
    paper: {
      height: 140,
      width: 100
    },
    control: {
      padding: 2
    }
  })
);

const empty: ITradingStrategy = {
  id: undefined,
  name: '',
  description: '',
  importMinProfit: 0,
  importMinProfitPercent: 0,
  importMinDailyProfit: 0,
  importMaxStockDays: 10000,
  listMinProfitPercent: 0,
  importMinDailyVolume: 0,
  relistMinProfitPercent: 0,
  relistStockAheadDays: 0,
  default: false
};

export const TradeStrategyAdd: React.FC = () => {
  const stations = useStations();
  const classes = useStyles();

  const [strategy, setStrategy] = useState<ITradingStrategy>(empty);

  if (!stations) {
    return null;
  }

  const addStrategy = () => {
    db.strategies.add(strategy).then(() => setStrategy(empty));
  };

  const setValue =
    (name: keyof ITradingStrategy) =>
    (event: ChangeEvent<HTMLInputElement>) => {
      setStrategy({ ...strategy, [name]: event.target.value });
    };

  const allSet = strategy.name.length > 0;

  return (
    <div>
      <Grid container className={classes.root} spacing={2}>
        <Grid item md={12}>
          <b>Create new strategy:</b>
        </Grid>
        <Grid item md={6} xs={12}>
          <TextField
            value={strategy.name}
            onChange={setValue('name')}
            label="Name"
            type="text"
            helperText="What do you want to call this strategy?"
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <TextField
            value={strategy.description}
            onChange={setValue('description')}
            label="Description"
            type="text"
            helperText="What's it for?"
          />
        </Grid>

        <Grid item md={12}>
          <b>Importing:</b>
        </Grid>

        <Grid item md={6} xs={12}>
          <TextField
            value={strategy.importMinProfit}
            onChange={setValue('importMinProfit')}
            label="Minimum Profit"
            type="number"
            helperText="Amount, in isk, per item, that is your desired minimum profit"
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <TextField
            value={strategy.importMinProfitPercent}
            onChange={setValue('importMinProfitPercent')}
            label="Minimum Profit %"
            type="number"
            helperText="Minmum profit percentage, after fees and shipping"
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <TextField
            value={strategy.importMinDailyVolume}
            onChange={setValue('importMinDailyVolume')}
            label="Min Volume"
            type="number"
            helperText="Minimum daily average volume"
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <TextField
            value={strategy.importMinDailyProfit}
            onChange={setValue('importMinDailyProfit')}
            label="Import Daily Minimum"
            type="number"
            helperText="Minimum daily potential profit, in isk"
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <TextField
            value={strategy.importMaxStockDays}
            onChange={setValue('importMaxStockDays')}
            label="Max Stock Days"
            type="number"
            helperText="Max stock, measured in days, based on average volume"
          />
        </Grid>

        <Grid item md={12}>
          <b>Listing:</b>
        </Grid>

        <Grid item md={6} xs={12}>
          <TextField
            value={strategy.listMinProfitPercent}
            onChange={setValue('listMinProfitPercent')}
            label="Minimum Profit %"
            type="number"
            helperText="The minimum profit percentage you will list an item at."
          />
        </Grid>

        <Grid item md={12}>
          <b>Relisting:</b>
        </Grid>

        <Grid item md={6} xs={12}>
          <TextField
            value={strategy.relistMinProfitPercent}
            onChange={setValue('relistMinProfitPercent')}
            label="Minimum Profit %"
            type="number"
            helperText="The minimum profit percentage you will relist an item at"
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <TextField
            value={strategy.relistStockAheadDays}
            onChange={setValue('relistStockAheadDays')}
            label="Relist Stocking Level"
            type="number"
            helperText="Don't relist an item if there is less than X days of stock below it"
          />
        </Grid>

        <Grid item md={12}>
          <Button
            disabled={!allSet}
            variant="contained"
            color="primary"
            onClick={addStrategy}
          >
            Add Route
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
