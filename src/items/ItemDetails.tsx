import { Avatar, createStyles, Grid, makeStyles } from '@material-ui/core';
import { useLiveQuery } from 'dexie-react-hooks';
import React from 'react';
import { IChar } from '../character/IChar';
import { db } from '../data/db';
import { getItem, IESIStatic } from './esi-static';

/*
    [img]
    Item Name
    Volume m3

    [Trade Route] to [Trade Route]
    Import cost: 101001 (1000 buy + 100 ship)
    Sell: 10101010 (10000 sell - tax - fee)
    Potential Profit: 1010101


    xxx right column:

    Active orders:
    xxxx
    Available Inventry:
    xxxx
    Recent purchases:
    xxxx
    Recent sales:
    xxxx



*/

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      padding: 15
    }
  })
);

export const ItemDetails: React.FC<{
  itemId: number;
}> = ({ itemId }) => {
  const classes = useStyles();
  const itemDef = getItem(itemId);
  const characters: IChar[] = useLiveQuery(() => db.characters.toArray());

  if (!itemDef) return null;
  return (
    <Grid container className={classes.root}>
      <Grid item md={6}>
        <LeftDetailCol itemDef={itemDef} itemId={itemId} />
      </Grid>
      <Grid item md={6}>
        <RightDetailCol itemDef={itemDef} itemId={itemId} />
      </Grid>

      {characters.map((char) => (
        <Grid item md={1}>
          <Avatar
            aria-label="recipe"
            alt={char.name}
            src={`https://image.eveonline.com/Character/${char.id}_64.jpg`}
          />
        </Grid>
      ))}
    </Grid>
  );
};

const LeftDetailCol: React.FC<{
  itemDef: IESIStatic;
  itemId: number;
}> = ({ itemDef, itemId }) => (
  <Grid container>
    <Grid item md={2}>
      <img src={`https://imageserver.eveonline.com/Type/${itemId}_64.png`} />
    </Grid>
    <Grid item md={10}>
      <h1>{itemDef.typeName}</h1>
      <ul>
        <li>Volume: {itemDef.volume} m3</li>
      </ul>
    </Grid>
  </Grid>
);

const RightDetailCol: React.FC<{
  itemDef: IESIStatic;
  itemId: number;
}> = ({ itemDef }) => (
  <div>
    <h2>Active orders: </h2>
    <h2>Available Inventory: </h2>
    <h2>Recent purchases: </h2>
    <h2>Recent sales:</h2>
  </div>
);
