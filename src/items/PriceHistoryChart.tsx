import { useLiveQuery } from 'dexie-react-hooks';
import React, { useEffect } from 'react';
import { systems } from '../systems';
import {
  LineChart,
  Line,
  Bar,
  BarChart,
  Label,
  Tooltip,
  ResponsiveContainer,
  Area,
  CartesianGrid,
  ComposedChart,
  AreaChart,
  Scatter,
  XAxis,
  YAxis
} from 'recharts';
import { useAuth } from '../auth';
import { db } from '../data/db';
import { esiMarketOrderHistory, esiMarketStats } from '../esi';
import { IOrders } from '../orders/orders';
import { useStationMap } from '../station-service';
import millify from 'millify';

export const PriceHistoryChart: React.FC<{
  itemId: number;
  label: string;
  locationId: number;
}> = ({ itemId, locationId, label }) => {
  const auth = useAuth();
  const [history, setHistory] = React.useState([]);
  const stationMap = useStationMap();
  const toStation = stationMap[locationId];
  const toSystem = systems[String(toStation?.solarSystemId)];
  const toRegion = toSystem?.regionID;

  useEffect(() => {
    if (!itemId || !toRegion) return;
    esiMarketStats(
      auth,
      { type_id: String(itemId), d: String(new Date().getDay()) },
      { regionId: String(toRegion) }
    ).then((res) => {
      //console.log('GRAPHING', res.data.slice(res.data.length - 30));
      setHistory(res.data.slice(res.data.length - 30));
    });
  }, [itemId, toRegion]);

  if (!history) return null;
  return (
    <ResponsiveContainer height={200} width="100%">
      <ComposedChart data={history}>
        <Tooltip
          formatter={(value: number, name: string, props: any) =>
            millify(value)
          }
        />
        <Bar
          yAxisId="right"
          dataKey="volume"
          fill="#cccccc"
          isAnimationActive={false}
        />
        <Line
          yAxisId="left"
          type="monotone"
          isAnimationActive={false}
          dataKey="average"
          stroke="#8884d8"
        />
        <Line
          yAxisId="left"
          type="monotone"
          isAnimationActive={false}
          dataKey="lowest"
          stroke="#cccccc"
        />
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date">
          <Label offset={0} position="insideBottom">
            {label}
          </Label>
        </XAxis>
        <YAxis
          yAxisId="left"
          tickFormatter={(v) => (Number.isSafeInteger(v) ? millify(v) : v)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(v) => (Number.isSafeInteger(v) ? millify(v) : v)}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
