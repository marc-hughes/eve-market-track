import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { HashRouter, Link, Route, Switch } from 'react-router-dom';
import { Dashboard } from './dashboard/Dashboard';
import CssBaseline from '@material-ui/core/CssBaseline';

function bootstrap() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    navigator.storage.estimate().then(({ usage, quota }) => {
      console.log(`Using ${usage} out of ${quota} bytes.`);
    });
  }

  if (navigator.storage && navigator.storage.persist)
    navigator.storage.persist().then(function (persistent) {
      if (persistent)
        console.log(
          'Storage will not be cleared except by explicit user action'
        );
      else
        console.log('Storage may be cleared by the UA under storage pressure.');
    });

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

bootstrap();
