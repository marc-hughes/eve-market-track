import {
  makeStyles,
  TableCell,
  TableRow,
  createStyles
} from '@material-ui/core';
import millify from 'millify';
import React from 'react';

import { IOwnOrder, useSells } from '../orders/orders';
import { useStationMap } from '../station-service';

const useStyles = makeStyles(() =>
  createStyles({
    competition: {
      fontSize: 10,
      color: '#666'
    }
  })
);

export const ActiveOrders: React.FC<{ order: IOwnOrder }> = ({ order }) => {
  const stationMap = useStationMap();
  const otherOrders = useSells(order.typeId, order.locationId);
  const classes = useStyles();

  return (
    <React.Fragment>
      {otherOrders
        ?.filter((other) => other.price > order.price)
        .reverse()
        .map((other) => {
          return (
            <TableRow>
              <TableCell>&nbsp;</TableCell>
              <TableCell className={classes.competition} align="right">
                {millify(other.price, { precision: 4 })}
              </TableCell>
              <TableCell className={classes.competition}>
                {millify(other.volumeRemain)}
              </TableCell>
            </TableRow>
          );
        })}

      <TableRow key={order.orderId}>
        <TableCell component="th" scope="row">
          {stationMap[order.locationId]?.name}
        </TableCell>
        <TableCell align="right">
          {(order.isBuyOrder ? '-' : '') +
            millify(order.price, { precision: 3 })}
        </TableCell>
        <TableCell>
          {millify(order.volumeRemain)}/{millify(order.volumeTotal)}
        </TableCell>
      </TableRow>

      {otherOrders
        ?.filter((other) => other.price < order.price)
        .reverse()
        .map((other) => {
          return (
            <TableRow>
              <TableCell>&nbsp;</TableCell>
              <TableCell className={classes.competition} align="right">
                {millify(other.price, { precision: 4 })}
              </TableCell>
              <TableCell className={classes.competition}>
                {millify(other.volumeRemain)}
              </TableCell>
            </TableRow>
          );
        })}
    </React.Fragment>
  );
};
