import React, { ChangeEvent, useState } from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
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

const StationInput: React.FC<{
  stations: IStation[];
  label: string;
  value: IStation;
  onChange: any;
}> = ({ stations, label, value, onChange }) => (
  <Autocomplete
    id="combo-box-demo"
    options={stations}
    value={value}
    onChange={onChange}
    getOptionLabel={(option) => option.name}
    style={{ width: 300 }}
    renderInput={(params) => (
      <TextField {...params} label={label} variant="outlined" />
    )}
  />
);

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
      <h1>Trade Routes</h1>
      <p>
        This is where you configure where you are going to import from 👉 to.
        You'll only see stations that you've traded at, so if the one you want
        is missing, go buy something and refresh that character's transactions.
      </p>

      <Paper>
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
              onChange={(event) =>
                setTaxPercent(parseFloat(event.target.value))
              }
              id="standard-number"
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
              id="standard-number"
              label="Brokers Fee Percent"
              type="number"
              helperText="The percentage you end up paying with skills. ex 2.5"
            />
          </Grid>

          <Grid item md={6} xs={12}>
            <TextField
              value={importCost}
              onChange={(event) =>
                setImportCost(parseFloat(event.target.value))
              }
              id="standard-number"
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
      </Paper>
    </div>
  );
};
