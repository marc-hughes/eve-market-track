import { createStyles, Grid, makeStyles, Paper } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import React, { MouseEvent } from 'react';
import { useStatic } from './items/esi-static';
import { version } from './version';

const useStyles = makeStyles(() =>
  createStyles({
    alert: {
      margin: 5,
      paddingTop: 30
    },
    header: {
      marginTop: 0,
      paddingTop: 0,
      position: 'relative',
      top: -10
    },
    rootPaper: {
      height: '90%',
      overflow: 'auto',
      padding: 20
    }
  })
);

// TODO: Better intro screen
export const Intro = () => {
  const classes = useStyles();

  const openLink = (event: MouseEvent) => {
    const w: any = window;
    if (w.openUrl) {
      console.info('Opening url');
      // we're inside electron, want to open a real browser window instead
      event.preventDefault();
      const href = event.currentTarget.getAttribute('href');
      w.openUrl(href); // open native browser in electron environment
    }
  };

  return (
    <Paper className={classes.rootPaper}>
      <h1>Welcome to the Eve Market Tracker (name TBD)</h1>
      <Grid container>
        <Grid item md={6}>
          <Alert className={classes.alert} severity="info">
            <h1 className={classes.header}>Don't lose all your data!</h1>
            <p>
              Your market data is never saved on my servers. There's 2 versions
              of this app
            </p>
            <ul>
              <li>
                <b>Desktop Version</b> <br />
                <a
                  onClick={openLink}
                  href="https://github.com/TrenzaloreStrax/market-tool/releases"
                  target="_blank"
                >
                  download here
                </a>
                <br />
                Saves your data locally on your computer, but you have to trust
                me not to install malware and you have to manually download and
                update it every release.
              </li>

              <li>
                <b>Web Version</b> <br />
                <a
                  onClick={openLink}
                  href="https://eve-market.shittywebapp.com/"
                  target="_blank"
                >
                  https://eve-market.shittywebapp.com/
                </a>
                <br />
                Saves your data locally inside your web browser. You'll always
                have the latest version, but if you clear your browser data,
                it's gone.
              </li>
            </ul>
          </Alert>
        </Grid>

        <Grid item md={6}>
          <Alert className={classes.alert} severity="info">
            <h1 className={classes.header}>Getting Started</h1>
            <ul>
              <li>Add your market trading characters on the left</li>
              <li>Create a trade route in the trading config</li>
              <li>Refresh Data</li>
            </ul>
            <a
              onClick={openLink}
              href="https://github.com/TrenzaloreStrax/market-tool/wiki"
            >
              Read more docs here
            </a>
          </Alert>
        </Grid>
      </Grid>

      <Alert className={classes.alert} severity="success">
        <h1 className={classes.header}>Support This App</h1>
        <p>
          Are you making isk using this? Is it saving you time? Here's how to
          help:
        </p>
        <ul>
          <li>
            Report Bugs / Answer questions:&nbsp;
            <a
              onClick={openLink}
              target="_blank"
              href="https://github.com/TrenzaloreStrax/market-tool/issues"
            >
              https://github.com/TrenzaloreStrax/market-tool/issues
            </a>
          </li>
          <li>
            Send isk to Trenzalore Strax so I don't feel like time spent working
            on this is a big waste.
          </li>
        </ul>
      </Alert>

      <p>{version}</p>
    </Paper>
  );

  return <div>Hi there!</div>;
};
