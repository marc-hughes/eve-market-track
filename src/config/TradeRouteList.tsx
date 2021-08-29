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
  const auth = useAuth();
  const stations = useStationMap();
  const routes = useTradeRoutes();
  const [loading, setLoading] = useState(false);

  const refreshRoute = (route: ITradeRoute) => {
    setLoading(true);
    updateMarket(auth, route.fromStation)
      .then(() => updateMarket(auth, route.toStation))
      .then(() => setLoading(false));
  };

  if (!routes) {
    return null;
  }
  return (
    <React.Fragment>
      <TableContainer component={Paper}>
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
                    onClick={() => refreshRoute(route)}
                  >
                    Refresh Prices
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Backdrop className={classes.backdrop} open={loading}>
        <Alert className={classes.infoBox} severity="info">
          <p>
            Sit Tight. This can take a minute, we're grabbing all the orders and
            saving them for future use.
          </p>
          <p>
            Because of the way the ESI works, we have to load an entire region's
            worth of orders for NPC stations.
          </p>
        </Alert>
        <CircularProgress color="inherit" />
      </Backdrop>
    </React.Fragment>
  );
};
