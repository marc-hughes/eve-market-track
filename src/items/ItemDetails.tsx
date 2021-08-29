import {
  Avatar,
  Button,
  createStyles,
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';
import { useLiveQuery } from 'dexie-react-hooks';
import Dexie from 'dexie';
import React from 'react';
import { IChar } from '../character/IChar';
import { db } from '../data/db';
import { getItem, IESIStatic } from './esi-static';
import millify from 'millify';
import { useStationMap } from '../station-service';
import { IWalletEntry } from '../character/IWalletEntry';
import { IStation } from '../config/IStation';
import { ItemTradeRoute } from './ItemTradeRoute';
import { esiOpenMarket } from '../esi';
import { IOwnOrder, useBestSell } from '../orders/orders';

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
  const characters: IChar[] = useLiveQuery(() => db.characters.toArray());

  const openItemWindow = (char: IChar) => {
    esiOpenMarket(char, { type_id: String(itemId) }, {});
  };

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
    </React.Fragment>
  );
};

const LeftDetailCol: React.FC<{
  itemDef: IESIStatic;
  itemId: number;
}> = ({ itemDef, itemId }) => {
  const tradeRoutes = useLiveQuery(() => db.tradeRoute.toArray(), []);
  return (
    <Grid container>
      <Grid item md={2}>
        <img src={`https://imageserver.eveonline.com/Type/${itemId}_64.png`} />
      </Grid>
      <Grid item md={10}>
        <h2>{itemDef.typeName}</h2>
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
  const bestSell = useBestSell(order.typeId, order.locationId);

  const label = !bestSell
    ? ''
    : bestSell.price === order.price
    ? '(top order)'
    : `(lowest: ${millify(bestSell.price, { precision: 3 })})`;
  return (
    <TableRow key={order.orderId}>
      <TableCell component="th" scope="row">
        {stationMap[order.locationId]?.name}
      </TableCell>
      <TableCell align="right">
        {(order.isBuyOrder ? '-' : '') + millify(order.price, { precision: 3 })}
        <br />
        {label}
      </TableCell>
      <TableCell>
        {millify(order.volumeRemain)}/{millify(order.volumeTotal)}
      </TableCell>
    </TableRow>
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
            <TableCell>{transaction.date}</TableCell>
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

const RightDetailCol: React.FC<{
  itemDef: IESIStatic;
  itemId: number;
}> = ({ itemDef, itemId }) => {
  const stationMap = useStationMap();

  //const

  const activeOrders = useLiveQuery(
    () =>
      db.ownOrders
        .where(['typeId+issued'])
        .between([itemId, Dexie.minKey], [itemId, Dexie.maxKey])
        .reverse()
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

  return (
    <div>
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

      {/* <h2>Available Inventory: </h2> */}
      <h2>Recent purchases: </h2>
      <TransactionTable transactions={recentBuys} stationMap={stationMap} />
      <h2>Recent sales:</h2>
      <TransactionTable transactions={recentSales} stationMap={stationMap} />
    </div>
  );
};
