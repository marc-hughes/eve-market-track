import React, { useEffect } from 'react';
import { systems } from '../systems';
import {
  Line,
  Bar,
  Label,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ComposedChart,
  XAxis,
  YAxis
} from 'recharts';
import { useAuth } from '../auth';
import { useStationMap } from '../station-service';
import millify from 'millify';
import { getMarketStats } from './itemstat';

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

  // TODO: Error handling
  useEffect(() => {
    if (!itemId || !toRegion) return;
    getMarketStats(auth, itemId, toRegion).then((res) => {
      setHistory(res);
    });
  }, [itemId, toRegion]);

  if (!history) return null;
  return (
    <ResponsiveContainer height={200} width="100%">
      <ComposedChart data={history}>
        <Tooltip formatter={(value: number) => millify(value)} />
        <Bar
          yAxisId="right"
          dataKey="volume"
          fill="#cccccc"
          isAnimationActive={false}
        />
        <Line
          connectNulls={false}
          yAxisId="left"
          type="monotone"
          isAnimationActive={false}
          dataKey="average"
          stroke="#8884d8"
        />
        <Line
          connectNulls={false}
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
          orientation="right"
          tickFormatter={(v) => (Number.isSafeInteger(v) ? millify(v) : v)}
        />
        <YAxis
          yAxisId="right"
          tickFormatter={(v) => (Number.isSafeInteger(v) ? millify(v) : v)}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
