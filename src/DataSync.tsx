import {
  Backdrop,
  Button,
  CircularProgress,
  createStyles,
  makeStyles
} from '@material-ui/core';
import * as Sentry from '@sentry/browser';
import React, { useState } from 'react';
import { useCharacters } from './character/character-service';
import { useTradeRoutes } from './config/trade-route-service';
import { useStationMap } from './station-service';
import DoneIcon from '@material-ui/icons/Done';
import { updateMarket } from './market-service';
import { useAuth } from './auth';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import { db } from './data/db';
import { Alert } from '@material-ui/lab';
import { esiServerStatus } from './esi';
import { refreshCharacter } from './sync-service';

const useStyles = makeStyles(() =>
  createStyles({
    syncList: {
      listStyle: 'none'
    },
    icon: { position: 'relative', top: 7, marginRight: 20 },
    info: { marginTop: 20 },
    infoBox: {
      marginBottom: 50
    },
    backdrop: {
      zIndex: 9999,
      color: '#fff',
      flexDirection: 'column'
    }
  })
);

export const DataSync: React.FC<any> = () => {
  const tradeRoutes = useTradeRoutes();
  const characters = useCharacters();
  const stations = useStationMap();
  const auth = useAuth();
  const [syncMap, setSyncMap] = useState<Record<string, boolean>>({});
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');
  const classes = useStyles();

  const stationsToSync = Array.from(
    new Set(
      tradeRoutes
        ?.map((route) => [route.toStation, route.fromStation])
        .reduce((acc, val) => acc.concat(val), [])
    ).values()
  );

  const refresh = async () => {
    setSyncing(true);

    try {
      // Clear them all. This fixes a bug where if you delete a character, their old orders & inventory stick around.
      await db.ownOrders.clear();
      await db.inventory.clear();

      for (const character of characters) {
        // Do a server status on each char, so if the auth is expired, the esiRequest retry
        // logic grabs a new one and we can ignore these 403 errors in our logs.
        await esiServerStatus(character);
      }

      for (const character of characters) {
        await refreshCharacter(character);
        setSyncMap((syncMap) => ({ ...syncMap, [character.id]: true }));
      }

      db.orders.clear();

      for (const stationId of stationsToSync) {
        await updateMarket(stationId, false);
        setSyncMap((syncMap) => ({ ...syncMap, [stationId]: true }));
      }
    } catch (e) {
      Sentry.captureException(e);
      setError(e.message + ' ' + JSON.stringify(e.request?.__sentry_xhr__));
    }
    setSyncing(false);
  };

  return (
    <div>
      {error}
      <h1>Data Refresh</h1>
      <ul className={classes.syncList}>
        {characters?.map((character) => (
          <li key={'C' + character.id}>
            {syncMap[String(character.id)] ? (
              <DoneIcon className={classes.icon} />
            ) : (
              <SyncProblemIcon className={classes.icon} />
            )}
            {character.name}
          </li>
        ))}

        {stationsToSync.map((stationId) => (
          <li key={stationId}>
            {syncMap[String(stationId)] ? (
              <DoneIcon className={classes.icon} />
            ) : (
              <SyncProblemIcon className={classes.icon} />
            )}
            {stations[stationId]?.name}
          </li>
        ))}
      </ul>
      <Button
        disabled={syncing}
        variant="contained"
        color="primary"
        onClick={refresh}
      >
        Refresh
      </Button>
      <Alert severity="info" className={classes.info}>
        Refreshing order data can take a while. Please be patient. Because of
        the way the EVE API works, we need to refresh an entire region for NPC
        stations.
      </Alert>

      <Backdrop className={classes.backdrop} open={syncing}>
        <Alert className={classes.infoBox} severity="info">
          <p>
            Sit Tight. This can take a minute, we're grabbing all the
            transactions and orders then saving them for future use.
          </p>
        </Alert>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};
