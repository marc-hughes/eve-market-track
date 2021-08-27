import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { HashRouter, Link, Route, Switch } from 'react-router-dom';
import { Dashboard } from './dashboard/Dashboard';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { version } from './version';
import CssBaseline from '@material-ui/core/CssBaseline';
import { BigBad } from './BigBad';

if (
  location.host === 'eve-market.shittywebapp.com' &&
  location.protocol !== 'https:'
) {
  location.replace('https://eve-market.shittywebapp.com/');
}

Sentry.init({
  dsn: 'https://b70a82bc062442a98f62f8041abec897@o990106.ingest.sentry.io/5946573', // api key is public anwyays, doesn't seem horrible to code it in
  integrations: [new Integrations.BrowserTracing()],
  release: version || 'dev',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0
});

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
    <Sentry.ErrorBoundary fallback={<BigBad />}>
      <CssBaseline />
      <HashRouter>
        <Dashboard />
      </HashRouter>
    </Sentry.ErrorBoundary>,
    document.querySelector('#react-content')
  );
}

bootstrap();
