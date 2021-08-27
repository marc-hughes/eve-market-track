import {
  Button,
  Card,
  createStyles,
  Divider,
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';
import { useLiveQuery } from 'dexie-react-hooks';
import millify from 'millify';
import React from 'react';
import { useAuth } from '../auth';
import { ITradeRoute } from '../config/ITradeRoute';
import { db } from '../data/db';
import { IgnoreError } from '../IgnoreError';
import { IOrders, useBestSell, useMyLastBuy, useSells } from '../orders/orders';
import { getRegionId } from '../region';
import { useStationMap } from '../station-service';
import { IESIStatic } from './esi-static';
import { useItemStats } from './itemstat';
import { PriceHistoryChart } from './PriceHistoryChart';
import { getPrice } from './profit-calc';
import { ProfitLoss } from './ProfitLoss';

const PriceDetailDisplay: React.FC<{
  buyPrice: number;
  sellPrice: number;
  shipping: number;
  route: ITradeRoute;
  description: string;
}> = ({ buyPrice, sellPrice, shipping, route, description }) => {
  const tax = (route.tax / 100) * sellPrice;
  const broker = (route.broker / 100) * sellPrice;
  const profit = sellPrice - buyPrice - tax - broker - shipping;
  const profitPercent =
    buyPrice > 0
      ? Math.round((profit / (buyPrice + tax + broker + shipping)) * 100)
      : 0;

  const copyPrice = () => {
    const fourSigDigits = Number.parseFloat(sellPrice.toPrecision(4));
    navigator.clipboard.writeText(String(fourSigDigits));
  };

  return (
    <TableRow>
      <TableCell>{description}</TableCell>
      <TableCell>{millify(buyPrice, { precision: 2 })}</TableCell>
      <TableCell>
        <Button size="small" onClick={copyPrice}>
          {millify(sellPrice, { precision: 2 })}
        </Button>
      </TableCell>
      <TableCell>
        {millify(profit)} ({profitPercent}%)
      </TableCell>
    </TableRow>
  ); //Ship: <b>{millify(shipping)}</b> Tax: <b>{millify(tax)}</b> Broker:{' '}
};

const useStyles = makeStyles(() =>
  createStyles({
    routeCard: {
      flexGrow: 1,
      padding: 10,
      marginBottom: 20,
      marginRight: 20
    },
    priceList: {
      '& li': {
        paddingBottom: 15
      }
    }
  })
);

export const ItemTradeRoute: React.FC<{
  itemDef: IESIStatic;
  itemId: number;
  route: ITradeRoute;
}> = ({ itemDef, itemId, route }) => {
  const stationMap = useStationMap();
  const classes = useStyles();
  const buyInfo = useBestSell(itemId, route.fromStation);
  const sellInfo = useBestSell(itemId, route.toStation);
  const buyPrice = buyInfo?.price || 0;
  const sellPrice = sellInfo?.price || 0;
  const shipping = Math.ceil(route.shippingCost * itemDef.packagedVolume);
  const lastBuy = useMyLastBuy(itemId);
  const auth = useAuth();
  const regionId = getRegionId(stationMap, route.toStation);
  const itemStats = useItemStats(auth, itemId, regionId);
  const activeOrders = useSells(itemId, route.toStation);

  const stock =
    activeOrders?.reduce(
      (total: number, current: IOrders) => total + current.volumeRemain,
      0
    ) || 0;

  const plus20 = getPrice(buyPrice, 1.2, itemId, route);

  const lastBuyPlus20 = getPrice(lastBuy?.unitPrice || 0, 1.2, itemId, route);

  const breakEven = getPrice(buyPrice, 1, itemId, route);

  const lastBuyBreakEven = getPrice(lastBuy?.unitPrice || 0, 1, itemId, route);

  if (!route) return null;

  return (
    <Card className={classes.routeCard}>
      <Grid container>
        <Grid item md={11}>
          {stationMap[route.fromStation]?.name} (
          <b>{buyPrice === 0 ? 'Not Found' : millify(buyPrice)})</b>
          <br />
          {stationMap[route.toStation]?.name} (
          <b>{sellPrice === 0 ? 'Not Found' : millify(sellInfo.price)}</b>)
          <br />
          Daily Volume: <b>{millify(itemStats?.dailyVolume || 0)}</b>
          &nbsp;|&nbsp;Stock: <b>{millify(stock || 0)}</b>
          &nbsp;|&nbsp;Stock Days:
          <b>{millify(stock / (itemStats?.dailyVolume || 1))}</b>
          &nbsp;|&nbsp;Orders: <b>{activeOrders?.length}</b>
        </Grid>

        <Grid item md={12}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Description</TableCell>
                <TableCell>Buy</TableCell>
                <TableCell>Sell</TableCell>
                <TableCell>Profit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <PriceDetailDisplay
                description="Import -> Best Sell"
                buyPrice={buyPrice}
                sellPrice={sellPrice}
                shipping={shipping}
                route={route}
              />

              <PriceDetailDisplay
                description="Import Plus 20%"
                buyPrice={buyPrice}
                sellPrice={plus20}
                shipping={shipping}
                route={route}
              />

              <PriceDetailDisplay
                description="Import break even"
                buyPrice={buyPrice}
                sellPrice={breakEven}
                shipping={shipping}
                route={route}
              />

              {lastBuy && (
                <React.Fragment>
                  <PriceDetailDisplay
                    description="Last Buy -> Best Sell"
                    buyPrice={lastBuy.unitPrice}
                    sellPrice={sellPrice}
                    shipping={shipping}
                    route={route}
                  />

                  <PriceDetailDisplay
                    description="Last Buy Plus 20%"
                    buyPrice={lastBuy.unitPrice}
                    sellPrice={lastBuyPlus20}
                    shipping={shipping}
                    route={route}
                  />

                  <PriceDetailDisplay
                    description="Last Buy Break Even"
                    buyPrice={lastBuy.unitPrice}
                    sellPrice={lastBuyBreakEven}
                    shipping={shipping}
                    route={route}
                  />
                </React.Fragment>
              )}
            </TableBody>
          </Table>
        </Grid>
      </Grid>

      <h2>Market Activity</h2>
      <PriceHistoryChart
        label={stationMap[route.fromStation]?.name}
        itemId={itemId}
        locationId={route.fromStation}
      />
      <PriceHistoryChart
        label={stationMap[route.toStation]?.name}
        itemId={itemId}
        locationId={route.toStation}
      />

      <IgnoreError>
        <ProfitLoss itemDef={itemDef} route={route} itemId={itemId} />
      </IgnoreError>

      {/* This was meant to show the buy/sell spread, but
          it was just too hard to read.
          <OrderChart itemId={itemId} locationId={route.toStation} /> */}
    </Card>
  );
};
