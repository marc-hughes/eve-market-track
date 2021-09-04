import React from 'react';
import { TradeRouteAdd } from './TradeRouteAdd';
import { TradeRouteList } from './TradeRouteList';

// TODO: (Refactor) Do we need this div?
export const TradeConfig: React.FC = () => (
  <div>
    <TradeRouteAdd />
    <TradeRouteList />
  </div>
);
