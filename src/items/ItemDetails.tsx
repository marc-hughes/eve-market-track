import {
  Button,
  Card,
  createStyles,
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableRow
} from '@material-ui/core';
import { useLiveQuery } from 'dexie-react-hooks';
import Dexie from 'dexie';
import React from 'react';
import { db } from '../data/db';
import { getItem, IESIStatic } from './esi-static';

// TODO: I don't like how millify(n,{precision:4}) will output 1.314k instead of just 1,314, and precion:4 is most useful in order price
import millify from 'millify';

import { useStationMap } from '../station-service';

import { IWalletEntry } from '../character/IWalletEntry';
import { IStation } from '../config/IStation';
import { IOrders } from '../orders/orders';
import { IInventory } from '../inventory/inventory';
import { useCharacters } from '../character/character-service';
import moment from 'moment';
import { ItemDetailLeftColumn } from './ItemDetailLeftColumn';
import { ActiveOrders } from './ActiveOrders';

/*
    [img]
    Item Name
    Volume m3

    [Trade Route] to [Trade Route]
    Import cost: 101001 (1000 buy + 100 ship)
    Sell: 10101010 (10000 sell - tax - fee)
    Potential Profit: 1010101


    xxx right column:

    Active orders:
    xxxx
    Available Inventry:
    xxxx
    Recent purchases:
    xxxx
    Recent sales:
    xxxx



*/

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      padding: 15
    },
    next: {
      position: 'fixed',
      bottom: 5,
      right: 10
    },
    detailCard: {
      marginBottom: 15,
      padding: 10
    }
  })
);

export const ItemDetails: React.FC<{
  itemId: number;
  showNext: boolean;
  onNext: () => void;
  onPrevious?: () => void;
  currentPage?: number;
  maxPage?: number;
}> = ({
  itemId,
  onNext,
  showNext,
  onPrevious,
  currentPage = null,
  maxPage = null
}) => {
  const classes = useStyles();
  const itemDef = getItem(itemId);

  if (!itemDef) return null;

  return (
    <Grid container className={classes.root}>
      {showNext && (
        <React.Fragment>
          <Grid item md={8}>
            <Button onClick={onPrevious}>Prev</Button>
            {currentPage} / {maxPage}
            <Button onClick={onNext}>Next</Button>
          </Grid>
        </React.Fragment>
      )}
      <Grid item md={6}>
        <ItemDetailLeftColumn itemDef={itemDef} itemId={itemId} />
      </Grid>
      <Grid item md={6}>
        <RightDetailCol itemDef={itemDef} itemId={itemId} />
      </Grid>
    </Grid>
  );
};

// TODO: Refactor this to it's own file (maybe with RightDetailCol)
const InventoryTable: React.FC<{
  inventory: IInventory[];
  stationMap: Record<string, IStation>;
}> = ({ inventory, stationMap }) => {
  const characters = useCharacters();

  return inventory?.length > 0 ? (
    <Table size="small">
      <TableBody>
        {inventory?.map((inv) => (
          <TableRow key={inv.itemId}>
            <TableCell style={{ width: 250 }} component="th" scope="row">
              {stationMap[inv.locationId].name}
            </TableCell>
            <TableCell>
              {characters?.find((c) => c.id === inv.characterId)?.name ||
                inv.characterId}
            </TableCell>

            <TableCell>x{millify(inv.quantity)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <span>None Found</span>
  );
};

// TODO: Refactor this to it's own file (maybe with RightDetailCol)
const TransactionTable: React.FC<{
  transactions: IWalletEntry[];
  stationMap: Record<string, IStation>;
}> = ({ transactions, stationMap }) => {
  return transactions?.length > 0 ? (
    <Table size="small">
      <TableBody>
        {transactions?.map((transaction) => (
          <TableRow key={transaction.journalRefId}>
            <TableCell style={{ width: 250 }} component="th" scope="row">
              {stationMap[transaction.locationId].name}
            </TableCell>
            <TableCell>
              {moment(transaction.date).format('yyyy-MM-DD HH:mm')}
            </TableCell>
            <TableCell align="right">
              {(transaction.isBuy ? '-' : '') + millify(transaction.unitPrice)}
            </TableCell>
            <TableCell>x{millify(transaction.quantity)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <span>No Recent Transactions</span>
  );
};

// TODO: Refactor this to it's own file (maybe with RightDetailCol)
const OrdersTable: React.FC<{
  orders: IOrders[];
  stationMap: Record<string, IStation>;
}> = ({ orders, stationMap }) => {
  return orders?.length > 0 ? (
    <Table size="small">
      <TableBody>
        {orders?.map((order) => (
          <TableRow key={order.orderId}>
            <TableCell style={{ width: 250 }} component="th" scope="row">
              {stationMap[order.locationId].name}
            </TableCell>
            <TableCell>
              {moment(order.issued).format('yyyy-MM-DD HH:mm')}
            </TableCell>
            <TableCell align="right">
              {(order.isBuyOrder ? '-' : '') + millify(order.price)}
            </TableCell>
            <TableCell>
              {millify(order.volumeRemain)}/{millify(order.volumeTotal)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ) : (
    <span>No Recent order</span>
  );
};

// TODO: Refactor this to it's own file
const RightDetailCol: React.FC<{
  itemDef: IESIStatic;
  itemId: number;
}> = ({ itemDef, itemId }) => {
  const stationMap = useStationMap();
  const classes = useStyles();

  const activeOrders = useLiveQuery(
    () =>
      db.ownOrders
        .where(['typeId+issued'])
        .between([itemId, Dexie.minKey], [itemId, Dexie.maxKey])
        .reverse()
        .filter((o) => 0 === o.isBuyOrder)
        .toArray(),
    [itemId]
  );

  const recentSales = useLiveQuery(
    () =>
      db.walletTransactions
        .where(['typeId+isBuy+date'])
        .between([itemId, 0, Dexie.minKey], [itemId, 0, Dexie.maxKey])
        .reverse()
        .limit(7)
        .toArray(),
    [itemId]
  );

  const recentBuys = useLiveQuery(
    () =>
      db.walletTransactions
        .where(['typeId+isBuy+date'])
        .between([itemId, 1, Dexie.minKey], [itemId, 1, Dexie.maxKey])
        .reverse()
        .limit(7)
        .toArray(),
    [itemId]
  );

  const completedOrders = useLiveQuery(
    () =>
      db.orderHistory
        .where(['typeId+issued'])
        .between([itemId, Dexie.minKey], [itemId, Dexie.maxKey])
        .reverse()
        .limit(3)
        .toArray(),
    [itemId]
  );

  const inventory = useLiveQuery(
    () => db.inventory.where('typeId').equals(itemId).toArray(),
    [itemId]
  );

  return (
    <div>
      <Card className={classes.detailCard}>
        <h2>Active orders: </h2>

        {activeOrders?.length > 0 ? (
          <Table size="small">
            <TableBody>
              {activeOrders?.map((order) => (
                <ActiveOrders key={order.orderId} order={order} />
              ))}
            </TableBody>
          </Table>
        ) : (
          'No Active Orders'
        )}
      </Card>

      {/* <h2>Available Inventory: </h2> */}
      <Card className={classes.detailCard}>
        <h2>Recent purchases: </h2>
        <TransactionTable transactions={recentBuys} stationMap={stationMap} />
      </Card>
      <Card className={classes.detailCard}>
        <h2>Recent sales:</h2>
        <TransactionTable transactions={recentSales} stationMap={stationMap} />
      </Card>
      <Card className={classes.detailCard}>
        <h2>Inventory</h2>
        <InventoryTable inventory={inventory} stationMap={stationMap} />
      </Card>
      <Card className={classes.detailCard}>
        <h2>Completed Orders</h2>
        <OrdersTable orders={completedOrders} stationMap={stationMap} />
      </Card>
    </div>
  );
};
