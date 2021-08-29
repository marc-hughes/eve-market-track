import { Divider, Grid } from '@material-ui/core';
import millify from 'millify';
import { Dir } from 'original-fs';
import React from 'react';
import { ITradeRoute } from '../config/ITradeRoute';
import { useBestSell } from '../orders/orders';
import { useStationMap } from '../station-service';
import { IESIStatic } from './esi-static';

//[typeId+locationId]

export const ItemTradeRoute: React.FC<{
  itemDef: IESIStatic;
  itemId: number;
  route: ITradeRoute;
}> = ({ itemDef, itemId, route }) => {
  const stationMap = useStationMap();

  const buyInfo = useBestSell(itemId, route.fromStation);
  const sellInfo = useBestSell(itemId, route.toStation);
  const buyPrice = buyInfo?.price || 0;
  const sellPrice = sellInfo?.price || 0;
  const tax = (route.tax / 100) * sellPrice;
  const broker = (route.broker / 100) * sellPrice;
  const shipping = Math.ceil(route.shippingCost * itemDef.packagedVolume);
  const profit = sellPrice - buyPrice - tax - broker - shipping;
  const profitPercent =
    buyPrice > 0 ? Math.round((profit / buyPrice) * 100) : 0;

  const plus20 = Math.ceil(
    (1.2 * (buyPrice + shipping)) /
      (1 - (1.2 * route.tax) / 100 - (1.2 * route.broker) / 100)
  );
  return (
    <Grid container>
      <Grid item md={12}>
        <Divider />
      </Grid>
      <Grid item md={12}>
        {stationMap[route.fromStation]?.name} (
        <b>{buyPrice === 0 ? 'Not Found' : millify(buyPrice)})</b>
        <br />
        {stationMap[route.toStation]?.name} (
        <b>{sellPrice === 0 ? 'Not Found' : millify(sellInfo.price)})</b>
      </Grid>
      <Grid item md={6}>
        <ul>
          <li>
            Sell@ <b>{millify(sellPrice)}</b>
            <ul>
              <li>
                Shipping Cost: <b>{millify(shipping)}</b>
              </li>
              <li>
                Broker Fee: <b>{millify(broker)}</b>
              </li>
              <li>
                Sales Tax: <b>{millify(tax)}</b>
              </li>
              <li>
                Max Potential Profit: <b>{millify(profit)}</b> ({profitPercent}
                %)
              </li>
            </ul>
          </li>
          <li>
            Plus 20% Price: <b>{millify(plus20)}</b>
          </li>
        </ul>
      </Grid>
    </Grid>
  );
};
