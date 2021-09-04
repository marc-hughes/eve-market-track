import {
  Avatar,
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
import { IChar } from '../character/IChar';
import { db } from '../data/db';
import { getItem, IESIStatic } from './esi-static';

// TODO: I don't like how millify(n,{precision:4}) will output 1.314k instead of just 1,314, and precion:4 is most useful in order price
import millify from 'millify';

import { useStationMap } from '../station-service';

import { IWalletEntry } from '../character/IWalletEntry';
import { IStation } from '../config/IStation';
import { ItemTradeRoute } from './ItemTradeRoute';
import { esiOpenMarket } from '../esi';
import { IOrders, IOwnOrder, useSells } from '../orders/orders';
import { IInventory } from '../inventory/inventory';
import { useCharacters } from '../character/character-service';
import { ItemColorFlag } from './ItemColorFlag';
import moment from 'moment';

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
    },
    competition: {
      fontSize: 10,
      color: '#666'
    }
  })
);

export const ItemDetails: React.FC<{
  itemId: number;
  showNext: boolean;
  onNext: () => void;
}> = ({ itemId, onNext, showNext }) => {
  const classes = useStyles();
  const itemDef = getItem(itemId);

  if (!itemDef) return null;
  return (
    <React.Fragment>
      {showNext && (
        <Button className={classes.next} onClick={onNext}>
          Next
        </Button>
      )}
      <Grid container className={classes.root}>
        <Grid item md={6}>
          <LeftDetailCol itemDef={itemDef} itemId={itemId} />
        </Grid>
        <Grid item md={6}>
          <RightDetailCol itemDef={itemDef} itemId={itemId} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

const LeftDetailCol: React.FC<{
  itemDef: IESIStatic;
  itemId: number;
}> = ({ itemDef, itemId }) => {
  const tradeRoutes = useLiveQuery(() => db.tradeRoute.toArray(), []);
  const characters = useCharacters();

  const openItemWindow = (char: IChar) => {
    esiOpenMarket(char, { type_id: String(itemId) }, {});
  };

  return (
    <Grid container>
      <Grid item md={2}>
        <img src={`https://imageserver.eveonline.com/Type/${itemId}_64.png`} />
      </Grid>
      <Grid item md={10}>
        <h2>
          <Button
            onClick={() => navigator.clipboard.writeText(itemDef.typeName)}
          >
            {itemDef.typeName}
          </Button>
          <Grid container>
            <Grid item md={1}>
              <ItemColorFlag itemId={itemId} />
            </Grid>

            {characters?.map((char) => (
              <Grid key={String(char.id)} item md={1}>
                <Avatar
                  onClick={() => openItemWindow(char)}
                  aria-label="recipe"
                  alt={char.name}
                  src={`https://image.eveonline.com/Character/${char.id}_64.jpg`}
                />
              </Grid>
            ))}
          </Grid>
        </h2>
        <ul>
          <li>
            Volume: {itemDef.volume} m3 ({itemDef.packagedVolume} m3 packaged)
          </li>
        </ul>
      </Grid>
      {tradeRoutes?.map((route, i) => (
        <ItemTradeRoute
          key={i}
          route={route}
          itemId={itemId}
          itemDef={itemDef}
        />
      ))}
    </Grid>
  );
};

const ActiveOrder: React.FC<{ order: IOwnOrder }> = ({ order }) => {
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
                <ActiveOrder key={order.orderId} order={order} />
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
