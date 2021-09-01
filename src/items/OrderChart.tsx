import { useLiveQuery } from 'dexie-react-hooks';
import React from 'react';
import {
  LineChart,
  Line,
  Bar,
  BarChart,
  Area,
  CartesianGrid,
  ComposedChart,
  AreaChart,
  Scatter,
  XAxis,
  YAxis
} from 'recharts';
import { db } from '../data/db';
import { IOrders } from '../orders/orders';

const data = [
  { name: 'Page A', uv: 400, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 100, pv: 2400, amt: 2400 }
];

export const OrderChart: React.FC<{ itemId: number; locationId: number }> = ({
  itemId,
  locationId
}) => {
  const stationOrders = useLiveQuery(
    () =>
      db.orders
        .where(['typeId+locationId'])
        .equals([itemId, locationId])
        .toArray(),
    [itemId, locationId]
  );
  if (!stationOrders) return null;

  const calcVolume = (isBuy: number, price: number): number =>
    stationOrders
      .filter((o) => o.isBuyOrder === isBuy && price >= o.price)
      .reduce((acc: number, order) => acc + order.volumeRemain, 0);

  const graphData = stationOrders.map((order: IOrders) => ({
    price: order.isBuyOrder === 1 ? -order.price : order.price,
    buy: order.isBuyOrder ? calcVolume(order.isBuyOrder, order.price) : null,
    sell: order.isBuyOrder ? null : calcVolume(order.isBuyOrder, order.price)
  }));

  graphData.sort((a, b) => a.price - b.price);

  console.info('Graph:', itemId, locationId, stationOrders, graphData);

  return (
    <ComposedChart width={400} height={200} data={graphData}>
      <Area
        type="stepBefore"
        dataKey="buy"
        stroke="#8884d8"
        fillOpacity={1}
        fill="#ff0000"
      />
      <Area
        type="stepAfter"
        dataKey="sell"
        stroke="#8884d8"
        fillOpacity={1}
        fill="#00ff00"
      />

      <Scatter dataKey="buy" fill="#ff0000" />
      <Scatter dataKey="sell" fill="#00ffff" />

      <CartesianGrid stroke="#ccc" />
      <XAxis
        type="number"
        dataKey="price"
        interval="preserveStart"
        domain={[
          (dataMin: number) => Math.min(0, dataMin),
          (dataMax: number) => Math.max(0, dataMax)
        ]}
      />
      <YAxis />
    </ComposedChart>
  );
};
