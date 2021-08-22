import {
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@material-ui/core';
import React from 'react';
import WarningIcon from '@material-ui/icons/Warning';
export const Characters = () => {
  const redirectAuth = () => {
    const clientId = '6d9027a5346d42e1babfda3a8b34a1f1';
    const scopes =
      'publicData%20esi-wallet.read_character_wallet.v1%20esi-assets.read_assets.v1%20esi-ui.open_window.v1%20esi-markets.structure_markets.v1%20esi-markets.read_character_orders.v1%20esi-contracts.read_character_contracts.v1';
    const uri = 'eveauth-local%3A%2F%2Fcallback%2F';

    const searchParams = new URLSearchParams(window.location.search);
    const codeChallenge = searchParams.get('codeChallenge');
    const url = `https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=${uri}&client_id=${clientId}&scope=${scopes}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=goonies`;
    console.info('Going to', url);
    window.location.href = url;
  };

  const characters: { name: string }[] = []; //{ name: 'Marc' }];

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
      {characters.map((char, index) => (
        <ListItem button>
          <ListItemIcon></ListItemIcon>
          <ListItemText primary={char.name} />
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
