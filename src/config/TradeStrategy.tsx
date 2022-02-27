import { Button, makeStyles, TableCell, TableRow } from '@material-ui/core';
import React from 'react';
import { ITradingStrategy } from '../strategy/ITradingStrategy';

const useStyles = makeStyles(() => ({
  descriptionCol: {
    maxWidth: '200px'
  }
}));

export const TradeStrategy: React.FC<{
  strategy: ITradingStrategy;
  readOnly: boolean;
  onDelete: (strategy: ITradingStrategy) => void;
}> = ({ readOnly, strategy, onDelete }) => {
  const classes = useStyles();
  return (
    <TableRow>
      <TableCell>{strategy.name}</TableCell>
      <TableCell className={classes.descriptionCol}>
        {strategy.description}
      </TableCell>
      <TableCell>
        <ul>
          <li>
            Import Min Profit: <b>{strategy.importMinProfit}</b>
          </li>
          <li>
            Import Min Profit Percent: <b>{strategy.importMinProfitPercent}%</b>
          </li>
          <li>
            Import Min Daily Profit: <b>{strategy.importMinDailyProfit}</b>
          </li>

          <li>
            Minimum daily volume: <b>{strategy.importMinDailyVolume}</b>
          </li>

          <li>
            Import Max Stock Days: <b>{strategy.importMaxStockDays}</b>
          </li>

          <li>
            List Min Profit Percent: <b>{strategy.listMinProfitPercent}%</b>
          </li>

          <li>
            Relist Min Profit Percent: <b>{strategy.relistMinProfitPercent}%</b>
          </li>
          <li>
            Relist Stock Ahead Days: <b>{strategy.relistStockAheadDays}</b>
          </li>
        </ul>
      </TableCell>
      <TableCell>
        {readOnly || <Button onClick={() => onDelete(strategy)}>Delete</Button>}
      </TableCell>
    </TableRow>
  );
};
