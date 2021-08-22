import React from 'react';
import { HashRouter, Link, Route, Switch } from 'react-router-dom';
import { Dashboard } from './Dashboard';
import CssBaseline from '@material-ui/core/CssBaseline';

export const Routes = () => (
  <React.Fragment>
    <CssBaseline />
    <HashRouter>
      <Switch>
        <Route component={Dashboard} />
      </Switch>
    </HashRouter>
  </React.Fragment>
);
