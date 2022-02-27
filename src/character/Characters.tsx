import {
  Avatar,
  Button,
  List,
  ListItem,
  createStyles,
  ListItemIcon,
  ListItemText,
  makeStyles
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import WarningIcon from '@material-ui/icons/Warning';
import { IChar } from './IChar';
import { useHistory } from 'react-router-dom';
import { useCharacters } from './character-service';
import { redirectAuth } from './oauth';

import millify from 'millify';

const useStyles = makeStyles(() =>
  createStyles({
    wallet: {
      color: '#666',
      fontSize: 12
    }
  })
);

export const Characters: React.FC = () => {
  const history = useHistory();
  const characters: IChar[] = useCharacters();
  const classes = useStyles();

  if (!characters) {
    return <span>'Loading...'</span>;
  }

  return (
    <List>
      {characters.length === 0 && (
        <ListItem>
          <ListItemIcon>
            <WarningIcon />
          </ListItemIcon>
          <ListItemText>No Characters Found, please add one!</ListItemText>
        </ListItem>
      )}

      {characters.map((char: IChar, index) => (
        <ListItem
          button
          key={index}
          onClick={() => history.push(`/character/${char.id}`)}
        >
          <ListItemIcon>
            <Avatar
              aria-label="recipe"
              alt={char.name}
              src={`https://image.eveonline.com/Character/${char.id}_64.jpg`}
            />
          </ListItemIcon>

          <ListItemText>
            {char.name} <br />
            <span className={classes.wallet}>
              {char.wallet && char.wallet > 0 && millify(char.wallet)}
            </span>
          </ListItemText>
        </ListItem>
      ))}

      <ListItem>
        <Button color="primary" onClick={redirectAuth}>
          Add Character
        </Button>
      </ListItem>
    </List>
  );
};
