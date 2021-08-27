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

export const TradeRouteAdd: React.FC = () => {
  const stations = useStations();
  const classes = useStyles();
  const [fromStation, setFromStation] = useState(null);
  const [toStation, setToStation] = useState(null);
  const [taxPercent, setTaxPercent] = useState(0);
  const [brokerPercent, setBrokerPercent] = useState(0);
  const [importCost, setImportCost] = useState(0);

  if (!stations) {
    return null;
  }

  const addRoute = () => {
    const route: ITradeRoute = {
      fromStation: fromStation.id,
      toStation: toStation.id,
      shippingCost: importCost,
      tax: taxPercent,
      broker: brokerPercent
    };
    db.tradeRoute.put(route);
  };

  const allSet =
    fromStation && toStation && taxPercent && brokerPercent && importCost;

  return (
    <div>
      <Grid container className={classes.root} spacing={2}>
        <Grid item xs={12} md={6}>
          <StationInput
            value={fromStation}
            onChange={(event: ChangeEvent, value: IStation) =>
              setFromStation(value)
            }
            label="From Station"
            stations={stations}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <StationInput
            value={toStation}
            onChange={(event: ChangeEvent, value: IStation) =>
              setToStation(value)
            }
            label="To Station"
            stations={stations}
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <TextField
            value={taxPercent}
            onChange={(event) => setTaxPercent(parseFloat(event.target.value))}
            label="Sales Tax Percent"
            type="number"
            helperText="The percentage you end up paying with skills. ex 2.5"
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <TextField
            value={brokerPercent}
            onChange={(event) =>
              setBrokerPercent(parseFloat(event.target.value))
            }
            label="Brokers Fee Percent"
            type="number"
            helperText="The percentage you end up paying with skills. ex 2.5"
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <TextField
            value={importCost}
            onChange={(event) => setImportCost(parseFloat(event.target.value))}
            label="Import Cost"
            type="number"
            helperText="How much is costs you per m3 to import from->to either using a service or your own fuel. ex 1700"
          />
        </Grid>

        <Grid item md={12}>
          <Button
            disabled={!allSet}
            variant="contained"
            color="primary"
            onClick={addRoute}
          >
            Add Route
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};
