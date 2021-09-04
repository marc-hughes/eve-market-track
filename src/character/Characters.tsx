import {
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import React from 'react';
import WarningIcon from '@material-ui/icons/Warning';
import { IChar } from './IChar';
import { useHistory } from 'react-router-dom';
import { useCharacters } from './character-service';

const redirectAuth = () => {
  const clientId = '6d9027a5346d42e1babfda3a8b34a1f1';
  const scopes = encodeURIComponent(
    'publicData esi-wallet.read_character_wallet.v1 esi-search.search_structures.v1 esi-universe.read_structures.v1 esi-assets.read_assets.v1 esi-ui.open_window.v1 esi-markets.structure_markets.v1 esi-corporations.read_structures.v1 esi-markets.read_character_orders.v1 esi-contracts.read_character_contracts.v1'
  );

  const uri = 'eveauth-local%3A%2F%2Fcallback%2F';

  const searchParams = new URLSearchParams(window.location.search);
  const codeChallenge = searchParams.get('codeChallenge');
  const url = `https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=${uri}&client_id=${clientId}&scope=${scopes}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=goonies`;
  console.info('Going to', url, { codeChallenge });
  window.location.href = url;
};

export const Characters: React.FC = () => {
  const history = useHistory();

  const characters: IChar[] = useCharacters();

  if (!characters) {
    return <span>'Loading...'</span>;
  }
  // TODO: Ability to remove a character
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
          <ListItemText>{char.name}</ListItemText>
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
