import { makeStyles, Paper, Table } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React from 'react';
import { ITradingStrategy } from '../strategy/ITradingStrategy';
import { deleteStrategy, useStrategies } from '../strategy/strategy-service';
import { TradeStrategy } from './TradeStrategy';
import { TradeStrategyAdd } from './TradeStrategyAdd';

export const TradeStrategies: React.FC = () => {
  const strategies = useStrategies();
  return (
    <React.Fragment>
      <h1>Strategies</h1>
      <Alert severity="info">
        Set up target thresholds for importing, listing, and relisting items.
        Then you can apply different strategies to different items and we use
        those values in the "suggestions" and "importing" tabs.
      </Alert>

      <Paper>
        <Table>
          {strategies?.map((strategy) => (
            <TradeStrategy
              onDelete={deleteStrategy}
              key={strategy.id}
              readOnly={strategy.id < 0}
              strategy={strategy}
            />
          ))}
        </Table>

        <TradeStrategyAdd />
      </Paper>
    </React.Fragment>
  );
};
