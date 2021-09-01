import {
  Button,
  Card,
  createStyles,
  Divider,
  Grid,
  makeStyles
} from '@material-ui/core';
import millify from 'millify';
import React from 'react';
import { ITradeRoute } from '../config/ITradeRoute';
import { useBestSell } from '../orders/orders';
import { useStationMap } from '../station-service';
import { IESIStatic } from './esi-static';
import { PriceHistoryChart } from './PriceHistoryChart';
// import { OrderChart } from './OrderChart';

const PriceDetailDisplay: React.FC<{
  buyPrice: number;
  sellPrice: number;
  shipping: number;
  route: ITradeRoute;
}> = ({ buyPrice, sellPrice, shipping, route }) => {
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
    <React.Fragment>
      <Button onClick={copyPrice}>
        ${millify(sellPrice, { precision: 3 })}
      </Button>
      <div>
        <i>
          Ship: <b>{millify(shipping)}</b> Tax: <b>{millify(tax)}</b> Broker:{' '}
          <b>{millify(broker)}</b>
        </i>
        <br />
        Profit: <b>{millify(profit)}</b> (<b>{profitPercent}%</b>)
      </div>
    </React.Fragment>
  );
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

  const plus20 = Math.round(
    (1.2 * buyPrice + 1.2 * shipping) /
      (1 - (1.2 * route.tax) / 100 - (1.2 * route.broker) / 100)
  );

  const breakEven = Math.ceil(
    (buyPrice + shipping) / (1 - route.tax / 100 - route.broker / 100)
  );

  if (!route) return null;

  return (
    <Card className={classes.routeCard}>
      <Grid container>
        <Grid item md={12}>
          {stationMap[route.fromStation]?.name} (
          <b>{buyPrice === 0 ? 'Not Found' : millify(buyPrice)})</b>
          <br />
          {stationMap[route.toStation]?.name} (
          <b>{sellPrice === 0 ? 'Not Found' : millify(sellInfo.price)})</b>
        </Grid>
        <Grid item md={6}>
          <ul className={classes.priceList}>
            <li>
              Sell@
              <PriceDetailDisplay
                buyPrice={buyPrice}
                sellPrice={sellPrice}
                shipping={shipping}
                route={route}
              />
            </li>
            <li>
              Plus 20% Price:
              <PriceDetailDisplay
                buyPrice={buyPrice}
                sellPrice={plus20}
                shipping={shipping}
                route={route}
              />
            </li>
            <li>
              Break even price:
              <PriceDetailDisplay
                buyPrice={buyPrice}
                sellPrice={breakEven}
                shipping={shipping}
                route={route}
              />
            </li>
          </ul>
        </Grid>
      </Grid>

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

      {/* This was meant to show the buy/sell spread, but
          it was just too hard to read.
          <OrderChart itemId={itemId} locationId={route.toStation} /> */}
    </Card>
  );
};
