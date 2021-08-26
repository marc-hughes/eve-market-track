import React from 'react';
import { Route, Switch, useHistory, useLocation } from 'react-router-dom';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import InboxIcon from '@material-ui/icons/MoveToInbox';

const drawerWidth = 240;
import { Characters } from '../character/Characters';
import { Intro } from '../Intro';
import { AddCharacter } from '../character/AddCharacter';
import { Character } from '../character/Character';
import { TradeConfig } from '../config/TradeConfig';
import { AuthContext } from '../auth';
import { db } from '../data/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { AuthTokenInfo } from '../esi';

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

  const auth: AuthTokenInfo = firstCharacter
    ? {
        accessToken: firstCharacter.accessToken,
        refreshToken: firstCharacter.refreshToken,
        expiresIn: firstCharacter.expires
      }
    : null;

  const goToRoute = (path: string) => () => {
    console.info('Going to', path);
    history.push(path);
  };

  return (
    <AuthContext.Provider value={auth}>
      <div className={classes.root}>
        <AppBar position="fixed" className={classes.appBar}>
          <Toolbar>
            <Typography variant="h6" noWrap>
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
            <List>
              <ListItem button>
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText>Importing</ListItemText>
              </ListItem>

              <ListItem button>
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText>Inventory</ListItemText>
              </ListItem>

              <ListItem button>
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText>Sales</ListItemText>
              </ListItem>
              <ListItem
                button
                selected={location.pathname === '/watchlist'}
                onClick={goToRoute('/watchlist')}
              >
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText>Watchlist</ListItemText>
              </ListItem>

              <ListItem
                button
                selected={location.pathname === '/config'}
                onClick={goToRoute('/config')}
              >
                <ListItemIcon>
                  <InboxIcon />
                </ListItemIcon>
                <ListItemText>Trading Config</ListItemText>
              </ListItem>
            </List>

            <Divider />
            <Characters />
          </div>
        </Drawer>
        <main className={classes.content}>
          <Toolbar />
          <Switch>
            <Route path="/config" component={TradeConfig} />
            <Route path="/callback" component={AddCharacter} />
            <Route path="/character/:characterId" component={Character} />
            <Route component={Intro} />
          </Switch>
        </main>
      </div>
    </AuthContext.Provider>
  );
};
