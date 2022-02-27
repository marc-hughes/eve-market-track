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
import styled from '@emotion/styled';
import { WalletLog } from './WalletLog';
import { Alert } from '@material-ui/lab';
import { OrderLog } from '../orders/OrderLog';
import { ItemDetails } from '../items/ItemDetails';
import { InventoryLog } from '../inventory/InventoryLog';
import { OrderHistoryLog } from '../orders/OrderHistoryLog';
import { refreshCharacter } from '../sync-service';
import { FullDrawer } from '../FullDrawer';
import { IOrders, IOwnOrder, IOwnOrderHistory } from '../orders/orders';
import { IInventory } from '../inventory/inventory';
import { usePagination } from '../pagination';
import { IWalletEntry } from './IWalletEntry';

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
  const {
    currentIndex,
    setList,
    setCurrentItem,
    onSortModelChange,
    count,
    currentItem,
    next,
    previous
  } = usePagination<IOwnOrder | IInventory | IWalletEntry | IOwnOrderHistory>(
    []
  );

  const classes = useStyles();

  const handleRefreshedClose = () => {
    setRefreshedOpen(false);
  };

  const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
    setTab(newValue);
    onSortModelChange(null);
  };

  const refresh = () => {
    refreshCharacter(character).then(() => {
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
              onItemListChanged={setList}
              onItemSelected={setCurrentItem}
              character={character}
              onSortModelChange={onSortModelChange}
            />
          )}

          {tab === 1 && (
            <InventoryLog
              character={character}
              onItemListChanged={setList}
              onItemSelected={setCurrentItem}
              onSortModelChange={onSortModelChange}
            />
          )}
          {tab === 2 && (
            <WalletLog
              onItemListChanged={setList}
              onItemSelected={setCurrentItem}
              character={character}
              onSortModelChange={onSortModelChange}
            />
          )}
          {tab === 3 && (
            <OrderHistoryLog
              onItemListChanged={setList}
              onItemSelected={setCurrentItem}
              character={character}
              onSortModelChange={onSortModelChange}
            />
          )}
        </GridContainer>
      </Paper>

      <FullDrawer open={!!currentItem} onClose={() => setCurrentItem(null)}>
        <ItemDetails
          itemId={currentItem?.typeId}
          onNext={next}
          onPrevious={previous}
          currentPage={currentIndex + 1}
          showNext={true}
          maxPage={count}
        />
      </FullDrawer>

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
