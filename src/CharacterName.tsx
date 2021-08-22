import {
  Avatar,
  Card,
  CardHeader,
  createStyles,
  IconButton,
  makeStyles,
  Theme
} from '@material-ui/core';
import React, { ReactElement } from 'react';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { red } from '@material-ui/core/colors';

interface CharacterNameProps {
  name: string;
  id: number;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      maxWidth: 345
    },
    media: {
      height: 0,
      paddingTop: '56.25%' // 16:9
    },
    expand: {
      transform: 'rotate(0deg)',
      marginLeft: 'auto',
      transition: theme.transitions.create('transform', {
        duration: theme.transitions.duration.shortest
      })
    },
    expandOpen: {
      transform: 'rotate(180deg)'
    },
    avatar: {
      backgroundColor: red[500]
    }
  })
);

export const CharacterName = ({
  name,
  id
}: CharacterNameProps): ReactElement => {
  const classes = useStyles();
  return (
    <Card className={classes.root}>
      <CardHeader
        avatar={
          <Avatar
            aria-label="recipe"
            className={classes.avatar}
            alt={name}
            src={`https://image.eveonline.com/Character/${id}_64.jpg`}
          />
        }
        action={
          <IconButton aria-label="settings">
            <MoreVertIcon />
          </IconButton>
        }
        title={name}
        subheader="0isk"
      />
    </Card>
  );
};
