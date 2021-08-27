import React, { useEffect } from 'react';
import { Badge, Avatar, Tooltip, Button, Grid } from '@material-ui/core';

import { useLiveQuery } from 'dexie-react-hooks';
import { esiOpenMarket } from '../esi';
import { useCharacters } from '../character/character-service';
import { IChar } from '../character/IChar';
import { ItemColorFlag } from './ItemColorFlag';
import { IESIStatic } from './esi-static';
import { db } from '../data/db';
import { ItemTradeRoute } from './ItemTradeRoute';
import { useStrategies } from '../strategy/strategy-service';

export const ItemDetailLeftColumn: React.FC<{
  itemDef: IESIStatic;
  itemId: number;
}> = ({ itemDef, itemId }) => {
  const tradeRoutes = useLiveQuery(() => db.tradeRoute.toArray(), []);
  const characters = useCharacters();
  const [openMarketOn, setOpenMarketOn] = React.useState<IChar[]>([]);
  const strategies = useStrategies();

  const openItemWindow = (char: IChar) => {
    esiOpenMarket(char, { type_id: String(itemId) }, {});
  };

  const toggleChar = (char: IChar) => {
    if (openMarketOn.includes(char)) {
      setOpenMarketOn(openMarketOn.filter((c) => c.id !== char.id));
    } else {
      setOpenMarketOn([...openMarketOn, char]);
    }
  };

  useEffect(() => {
    openMarketOn.forEach(openItemWindow);
  }, [openMarketOn, itemId]);

  return (
    <Grid container>
      <Grid item md={2}>
        <img src={`https://imageserver.eveonline.com/Type/${itemId}_64.png`} />
      </Grid>
      <Grid item md={10}>
        <h2>
          <Button
            onClick={() => navigator.clipboard.writeText(itemDef.typeName)}
          >
            {itemDef.typeName}
          </Button>
          <Grid container>
            <Grid item md={1}>
              <ItemColorFlag itemId={itemId} />
            </Grid>

            {characters?.map((char) => (
              <Grid key={String(char.id)} item md={1}>
                <Tooltip title="Select to automatically open market window on this character">
                  <Badge
                    color="primary"
                    invisible={!openMarketOn.includes(char)}
                  >
                    <Avatar
                      onClick={() => toggleChar(char)}
                      aria-label="recipe"
                      alt={char.name}
                      src={`https://image.eveonline.com/Character/${char.id}_64.jpg`}
                    />
                  </Badge>
                </Tooltip>
              </Grid>
            ))}
          </Grid>
        </h2>
        <ul>
          <li>
            Volume: {itemDef.volume} m3 ({itemDef.packagedVolume} m3 packaged)
          </li>
        </ul>
      </Grid>
      {tradeRoutes?.map((route, i) => (
        <ItemTradeRoute
          key={i}
          route={route}
          itemId={itemId}
          itemDef={itemDef}
        />
      ))}
    </Grid>
  );
};
