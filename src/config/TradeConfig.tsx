import { makeStyles, createStyles } from '@material-ui/core';
import React from 'react';
import { CharacterList } from './CharacterList';
import { TradeRouteAdd } from './TradeRouteAdd';
import { TradeRouteList } from './TradeRouteList';
import { TradeStrategies } from './TradeStrategies';

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      position: 'fixed',
      top: 60,
      padding: 30,
      left: 240,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
      overFlowX: 'hidden'
    }
  })
);

export const TradeConfig: React.FC = () => {
  const classes = useStyles();
  return (
    <div className={classes.root}>
      <TradeRouteList />
      <TradeStrategies />
      <CharacterList />
    </div>
  );
};
