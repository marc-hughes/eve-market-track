import React from 'react';
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

const useStyles = makeStyles({
  table: {
    minWidth: 650
  }
});

export const TradeRouteList: React.FC = (props) => {
  const classes = useStyles();
  const stations = useStationMap();
  const routes = useTradeRoutes();
  if (!routes) {
    return null;
  }
  return (
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
