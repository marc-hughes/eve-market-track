import {
  AppBar,
  Avatar,
  Button,
  createStyles,
  Drawer,
  makeStyles,
  Paper,
  Snackbar,
  Tab,
  Tabs,
  Toolbar,
  Typography
} from '@material-ui/core';
import { useLiveQuery } from 'dexie-react-hooks';
import React from 'react';
import { useRouteMatch } from 'react-router';

import { db } from '../data/db';
import { IChar } from './IChar';
import { refreshWallet } from './wallet-service';
import styled from '@emotion/styled';
import { WalletLog } from './WalletLog';
import { Alert } from '@material-ui/lab';
import { updateOwnOrders } from '../orders/orders-service';
import { OrderLog } from '../orders/OrderLog';
import { ItemDetails } from '../items/ItemDetails';

const PageContainer = styled.div({
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  label: 'PageContainer',
  position: 'relative'
});

const GridContainer = styled.div({
  width: '100%',
  flex: '1 1 auto',
  label: 'GridContainer',
  marginTop: 60,
  fontSize: 10
});

const useStyles = makeStyles(() =>
  createStyles({
    paper: {
      width: '100%',
      flexGrow: 1,
      display: 'flex',
      flexDirection: 'column'
    },
    avatar: {
      marginRight: 15
    },
    tabs: {
      marginLeft: 10,
      flexGrow: 1
    }
  })
);

export const Character: React.FC = () => {
  const match = useRouteMatch<{ characterId: string }>();
  const [tab, setTab] = React.useState(0);
  const [refreshedOpen, setRefreshedOpen] = React.useState(false);
  const [focusedItemId, setFocusedItemId] = React.useState<number | null>(null);

  const classes = useStyles();

  const handleRefreshedClose = () => {
    setRefreshedOpen(false);
  };

  const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
    setTab(newValue);
  };

  const refresh = () => {
    Promise.all([refreshWallet(character), updateOwnOrders(character)]).then(
      () => {
        setRefreshedOpen(true);
      }
    );
  };

  const { characterId } = match.params;

  const character: IChar = useLiveQuery(
    () => db.characters.get({ id: parseInt(characterId) }),
    [characterId]
  );

  if (!character) return null;

  return (
    <PageContainer>
      <Paper square className={classes.paper}>
        <AppBar position="absolute">
          <Toolbar>
            <Avatar
              className={classes.avatar}
              alt={character.name}
              src={`https://image.eveonline.com/Character/${character.id}_64.jpg`}
            />
            <Typography>{character.name}</Typography>
            <Tabs
              className={classes.tabs}
              value={tab}
              onChange={handleTabChange}
            >
              <Tab label="Transactions" />
              <Tab label="Orders" />
              <Tab label="Inventory" />
            </Tabs>
            <Button onClick={refresh} variant="contained" color="secondary">
              Refresh
            </Button>
          </Toolbar>
        </AppBar>

        <GridContainer>
          {tab === 0 && (
            <WalletLog
              onItemSelected={setFocusedItemId}
              character={character}
            />
          )}
          {tab === 1 && (
            <OrderLog onItemSelected={setFocusedItemId} character={character} />
          )}
        </GridContainer>
      </Paper>

      <Drawer
        anchor="bottom"
        open={!!focusedItemId}
        onClose={() => setFocusedItemId(null)}
      >
        <ItemDetails itemId={focusedItemId} />
      </Drawer>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={refreshedOpen}
        autoHideDuration={4000}
        onClose={handleRefreshedClose}
      >
        <Alert onClose={handleRefreshedClose} severity="success">
          {character.name} transaction, order, and inventory data refreshed.
          Doing this more than once an hour won't change anything due to ESI
          caching.
        </Alert>
      </Snackbar>
    </PageContainer>
  );
};
