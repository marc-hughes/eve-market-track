import {
  Backdrop,
  Button,
  CircularProgress,
  createStyles,
  makeStyles
} from '@material-ui/core';
import React, { useState } from 'react';
import { useCharacters } from './character/character-service';
import { useTradeRoutes } from './config/trade-route-service';
import { useStationMap } from './station-service';
import DoneIcon from '@material-ui/icons/Done';
import { updateMarket } from './market-service';
import { useAuth } from './auth';
import { refreshWallet } from './character/wallet-service';
import { updateOwnOrders } from './orders/orders-service';
import SyncProblemIcon from '@material-ui/icons/SyncProblem';
import { db } from './data/db';
import { Alert } from '@material-ui/lab';
import { updateInventory } from './inventory/inventory-service';
import { esiLoginVerify } from './esi';

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
    for (const character of characters) {
      await refreshWallet(character);
      await updateOwnOrders(character);
      await updateInventory(character);
      setSyncMap((syncMap) => ({ ...syncMap, [character.id]: true }));
    }

    db.orders.clear();

    for (const stationId of stationsToSync) {
      await updateMarket(auth, stationId, false);
      setSyncMap((syncMap) => ({ ...syncMap, [stationId]: true }));
    }
    setSyncing(false);
  };

  return (
    <div>
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
