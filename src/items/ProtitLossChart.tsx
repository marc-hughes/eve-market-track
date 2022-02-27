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
  YAxis,
  Scatter,
  ZAxis
} from 'recharts';
import millify from 'millify';
import { ProfitLossLine } from './profit-loss-service';
import moment from 'moment';

type ChartLine = {
  date: string;
  profitPercent: number;
  profit: number;
  qty: number;
};

export const ProfitLossChart: React.FC<{
  profitLoss: ProfitLossLine[];
}> = ({ profitLoss }) => {
  const [history, setHistory] = React.useState<ChartLine[]>([]);
  useEffect(() => {
    // Make buckets for days
    const days = Array(30)
      .fill(0)
      .map((_, i) => moment().subtract(i, 'days').format('YYYY-MM-DD'))
      .reverse();
    // Fill buckets with data

    setHistory(
      days.map<ChartLine>((d) => {
        const lines = profitLoss.filter((l) => l.date === d);
        const qty = lines.reduce((acc, l) => acc + l.qty, 0);
        return {
          profitPercent: lines[0]?.profitPercent,
          date: d,
          total: profitLoss.filter((l) => l.date === d)[0]?.total || null,
          qty: qty > 0 ? qty : null,
          profit: lines.reduce((acc, l) => acc + l.profit, 0)
        };
      })
    );
  }, [profitLoss]);

  if (!profitLoss) return null;
  return (
    <ResponsiveContainer height={200} width="100%">
      <ComposedChart data={history}>
        <Tooltip formatter={(value: number) => millify(value)} />

        <Bar
          yAxisId="right"
          dataKey="profit"
          fill="#82ca9d"
          isAnimationActive={false}
        />

        <Scatter
          yAxisId="left"
          type="monotone"
          isAnimationActive={false}
          dataKey="qty"
          stroke="#cccccc"
          fill="#cccccc"
        />

        <CartesianGrid stroke="#ccc" />
        <ZAxis type="number" dataKey="profitPercent" name="profitPercent" />
        <XAxis dataKey="date" />
        <YAxis
          yAxisId="right"
          orientation="right"
          tickFormatter={(v) => (Number.isSafeInteger(v) ? millify(v) : v)}
        />
        <YAxis
          yAxisId="left"
          tickFormatter={(v) => (Number.isSafeInteger(v) ? millify(v) : v)}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};
