import React, { MouseEventHandler, useState } from 'react';
import { useTradeRoutes } from './trade-route-service';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { useStationMap } from '../station-service';
import { Backdrop, Button, CircularProgress } from '@material-ui/core';
import { ITradeRoute } from './ITradeRoute';
import { useAuth } from '../auth';
import { updateMarket } from '../market-service';
import { Alert } from '@material-ui/lab';
import { db } from '../data/db';
import { TradeRouteAdd } from './TradeRouteAdd';

const useStyles = makeStyles({
  table: {
    minWidth: 650
  },
  infoBox: {
    marginBottom: 50
  },
  backdrop: {
    zIndex: 9999,
    color: '#fff',
    flexDirection: 'column'
  }
});

export const TradeRouteList: React.FC = (props) => {
  const classes = useStyles();
  const stations = useStationMap();
  const routes = useTradeRoutes();

  const deleteRoute = (route: ITradeRoute) => {
    db.tradeRoute.delete(route.id);
  };

  if (!routes) {
    return null;
  }

  return (
    <React.Fragment>
      <h1>Trade Routes</h1>
      <Alert severity="info">
        This is where you configure where you are going to import from 👉 to.
        You'll only see stations that you've traded at, so if the one you want
        is missing, go buy something and refresh that character's transactions.
      </Alert>
      <Paper>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell align="right">Broker Fee</TableCell>
              <TableCell align="right">Sales Tax</TableCell>
              <TableCell align="right">Shipping</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.map((route, idx) => (
              <TableRow key={idx}>
                <TableCell component="th" scope="row">
                  {stations[route.fromStation].name}
                </TableCell>
                <TableCell component="th" scope="row">
                  {stations[route.toStation].name}
                </TableCell>
                <TableCell align="right">{route.broker}%</TableCell>
                <TableCell align="right">{route.tax}%</TableCell>
                <TableCell align="right">{route.shippingCost}isk/m3</TableCell>

                <TableCell>
                  <Button
                    variant="outlined"
                    color="primary"
                    onClick={() => deleteRoute(route)}
                  >
                    Delete Route
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TradeRouteAdd />
      </Paper>
    </React.Fragment>
  );
};
