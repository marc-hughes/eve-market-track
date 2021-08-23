import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { HashRouter, Link, Route, Switch } from 'react-router-dom';
import { Dashboard } from './dashboard/Dashboard';
import CssBaseline from '@material-ui/core/CssBaseline';

function render() {
  ReactDOM.render(
    <React.Fragment>
      <CssBaseline />
      <HashRouter>
        <Dashboard />
      </HashRouter>
    </React.Fragment>,
    document.querySelector('#react-content')
  );
}

render();
