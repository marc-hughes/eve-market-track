import React, { useEffect, useState } from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import EmojiObjectsIcon from '@material-ui/icons/EmojiObjects';
import SettingsIcon from '@material-ui/icons/Settings';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import RefreshIcon from '@material-ui/icons/Refresh';
import InboxIcon from '@material-ui/icons/MoveToInbox';
import FlagIcon from '@material-ui/icons/Flag';

const drawerWidth = 240;
import { Characters } from '../character/Characters';
import { Intro } from '../Intro';
import { AddCharacter } from '../character/AddCharacter';
import { Character } from '../character/Character';
import { TradeConfig } from '../config/TradeConfig';
import { AuthContext } from '../auth';
import { db } from '../data/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { AuthTokenInfo, esiServerStatus } from '../esi';
import { DataSync } from '../DataSync';
import { Import } from '../import/Import';
import { FlaggedLog } from '../items/FlaggedLog';
import { Suggestions } from './Suggestions';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      height: 'calc(100% - 50px)'
    },
    appBar: {
      zIndex: theme.zIndex.drawer + 1
    },
    drawer: {
      width: drawerWidth,
      flexShrink: 0
    },
    title: {
      flexGrow: 1
    },
    drawerPaper: {
      width: drawerWidth
    },
    drawerContainer: {
      overflow: 'auto'
    },
    content: {
      height: '100%',
      flexGrow: 1,
      padding: theme.spacing(3)
    }
  })
);

export const Dashboard = (props: any) => {
  const firstCharacter = useLiveQuery(() => db.characters.limit(1).first());
  const classes = useStyles();
  const location = useLocation();
  const history = useHistory();
  const [expired, setExpired] = useState(false);
  const params = new URLSearchParams(window.location.search);

  console.info('CODE:', location.search, params.get('code'));
  useEffect(() => {
    if (params.get('code')) {
      console.info('Got code!');
      history.push('/callback');
    }
  }, []);

  const auth: AuthTokenInfo = firstCharacter
    ? {
        characterId: firstCharacter.id,
        accessToken: firstCharacter.accessToken,
        refreshToken: firstCharacter.refreshToken,
        expiresIn: firstCharacter.expires
      }
    : null;

  useEffect(() => {
    auth &&
      esiServerStatus(auth).then((res) => {
        setExpired(
          new Date(res.data.start_time).getTime() >
            new Date('2021-10-30').getTime()
        );
      });
  }, [auth]);

  const goToRoute = (path: string) => () => {
    console.info('Going to', path);
    history.push(path);
  };

  if (expired) return <div>App Expired, get a new version</div>;

  return (
    <AuthContext.Provider value={auth}>
      <div className={classes.root}>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" noWrap className={classes.title}>
              Market Tracker
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          className={classes.drawer}
          variant="permanent"
          classes={{
            paper: classes.drawerPaper
          }}
        >
          <Toolbar />
          <div className={classes.drawerContainer}>
            <Characters />
            <Divider />
            <List>
              <ListItem
                button
                selected={location.pathname === '/flagged'}
                onClick={goToRoute('/flagged')}
              >
                <ListItemIcon>
                  <FlagIcon />
                </ListItemIcon>
                <ListItemText>Flagged Items</ListItemText>
              </ListItem>

              <ListItem
                button
                selected={location.pathname === '/import'}
                onClick={goToRoute('/import')}
              >
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText>Importing</ListItemText>
              </ListItem>

              <ListItem
                button
                selected={location.pathname === '/suggestions'}
                onClick={goToRoute('/suggestions')}
              >
                <ListItemIcon>
                  <EmojiObjectsIcon />
                </ListItemIcon>
                <ListItemText>Suggestions</ListItemText>
              </ListItem>

              <ListItem
                button
                selected={location.pathname === '/sync'}
                onClick={goToRoute('/sync')}
              >
                <ListItemIcon>
                  <RefreshIcon />
                </ListItemIcon>
                <ListItemText>Refresh Data</ListItemText>
              </ListItem>

              <ListItem
                button
                selected={location.pathname === '/config'}
                onClick={goToRoute('/config')}
              >
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText>Trading Config</ListItemText>
              </ListItem>
            </List>
          </div>
        </Drawer>
        <main className={classes.content}>
          <Toolbar />
          <Switch>
            <Route path="/sync" component={DataSync} />
            <Route path="/import" component={Import} />
            <Route path="/config" component={TradeConfig} />
            <Route path="/flagged" component={FlaggedLog} />
            <Route path="/callback" component={AddCharacter} />
            <Route path="/suggestions" component={Suggestions} />
            <Route path="/character/:characterId" component={Character} />
            <Route component={Intro} />
          </Switch>
        </main>
      </div>
    </AuthContext.Provider>
  );
};
