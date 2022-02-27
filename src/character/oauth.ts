import { uuid4 } from '@sentry/utils';
import pkceChallenge from 'pkce-challenge';

// None of these credential values are secret when using app-based authentication.
const credentials = {
  app: {
    clientId: '6d9027a5346d42e1babfda3a8b34a1f1',
    scopes: encodeURIComponent(
      'publicData esi-wallet.read_character_wallet.v1 esi-search.search_structures.v1 esi-universe.read_structures.v1 esi-assets.read_assets.v1 esi-ui.open_window.v1 esi-markets.structure_markets.v1 esi-corporations.read_structures.v1 esi-markets.read_character_orders.v1 esi-contracts.read_character_contracts.v1'
    ),
    uri: 'eveauth-local%3A%2F%2Fcallback%2F'
  },
  localhost: {
    clientId: '7748ac48d7d44d60a019b78cf60468db',
    scopes: encodeURIComponent(
      'publicData esi-wallet.read_character_wallet.v1 esi-search.search_structures.v1 esi-universe.read_structures.v1 esi-assets.read_assets.v1 esi-ui.open_window.v1 esi-markets.structure_markets.v1 esi-corporations.read_structures.v1 esi-markets.read_character_orders.v1 esi-contracts.read_character_contracts.v1'
    ),
    uri: 'http%3A%2F%2Flocalhost%3A8080%2F'
  },
  web: {
    clientId: 'f8a263d0a08d435daff4ffaa081d7223',
    scopes: encodeURIComponent(
      'publicData esi-wallet.read_character_wallet.v1 esi-search.search_structures.v1 esi-universe.read_structures.v1 esi-assets.read_assets.v1 esi-ui.open_window.v1 esi-markets.structure_markets.v1 esi-corporations.read_structures.v1 esi-markets.read_character_orders.v1 esi-contracts.read_character_contracts.v1'
    ),
    uri: 'https%3A%2F%2Feve-market.shittywebapp.com%2F'
  }
};

export const getOuthCreds = () => {
  if ((window as any).openUrl) return credentials.app;
  if (window.location.hostname === 'localhost') return credentials.localhost;
  return credentials.web;
};

export const resetChallenge = () => window.localStorage.removeItem('challenge');

export const getChallenge = () => {
  if (window.localStorage.getItem('challenge')) {
    return JSON.parse(window.localStorage.getItem('challenge'));
  }

  const { code_challenge: codeChallenge, code_verifier: codeVerifier } =
    pkceChallenge();

  const challenge = {
    codeChallenge,
    codeVerifier
  };
  window.localStorage.setItem('challenge', JSON.stringify(challenge));
  return challenge;
};

export const redirectAuth = () => {
  const { clientId, scopes, uri } = getOuthCreds();

  const { codeChallenge } = getChallenge();
  const url = `https://login.eveonline.com/v2/oauth/authorize/?response_type=code&redirect_uri=${uri}&client_id=${clientId}&scope=${scopes}&code_challenge=${codeChallenge}&code_challenge_method=S256&state=goonies`;
  console.info('Going to', url, { codeChallenge });
  window.location.href = url;
};
