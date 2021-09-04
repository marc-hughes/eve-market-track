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
import { updateInventory } from '../inventory/inventory-service';
import { InventoryLog } from '../inventory/InventoryLog';
import { OrderHistoryLog } from '../orders/OrderHistoryLog';

// TODO: (Refactor) Get rid of emotion/styled and use only @material-ui styles
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
  fontSize: 10,
  display: 'flex',
  flexDirection: 'column'
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
  const [itemList, _setItemList] = React.useState<number[]>([]);

  const setItemList = (items: number[]) => _setItemList([...new Set(items)]);

  const classes = useStyles();

  const handleRefreshedClose = () => {
    setRefreshedOpen(false);
  };

  const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
    setTab(newValue);
  };

  // TODO: (Refactor) Extract character-refresh logic to a separate function, reuse in the data sync page
  const refresh = () => {
    Promise.all([refreshWallet(character), updateOwnOrders(character)])
      .then(() => updateInventory(character))
      .then(() => {
        setRefreshedOpen(true);
      });
  };

  const { characterId } = match.params;

  // TODO: (Refactor) useCharacter
  const character: IChar = useLiveQuery(
    () => db.characters.get({ id: parseInt(characterId) }),
    [characterId]
  );

  if (!character) return null;

  // TODO: Support next/previous and respect the current sort order of the table
  const nextItem = () => {
    if (!focusedItemId) return;
    const index = itemList.indexOf(focusedItemId);
    const next = itemList[index + 1];
    if (next) {
      setFocusedItemId(next);
    }
  };

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
              <Tab label="Orders" />
              <Tab label="Inventory" />
              <Tab label="Transactions" />
              <Tab label="Completed Orders" />
            </Tabs>
            <Button onClick={refresh} variant="contained" color="secondary">
              Refresh
            </Button>
          </Toolbar>
        </AppBar>

        <GridContainer>
          {tab === 0 && (
            <OrderLog
              onItemListChanged={setItemList}
              onItemSelected={setFocusedItemId}
              character={character}
            />
          )}

          {tab === 1 && (
            <InventoryLog
              character={character}
              onItemListChanged={setItemList}
              onItemSelected={setFocusedItemId}
            />
          )}
          {tab === 2 && (
            <WalletLog
              onItemSelected={setFocusedItemId}
              character={character}
            />
          )}
          {tab === 3 && (
            <OrderHistoryLog
              onItemListChanged={setItemList}
              onItemSelected={setFocusedItemId}
              character={character}
            />
          )}
        </GridContainer>
      </Paper>

      <Drawer
        anchor="bottom"
        open={!!focusedItemId}
        onClose={() => setFocusedItemId(null)}
      >
        <ItemDetails
          itemId={focusedItemId}
          onNext={nextItem}
          showNext={tab !== 2}
        />
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
