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
  id: number | string;
  children?: ReactElement<any>;
}

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      flexGrow: 0
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
  id,
  children
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
        title={name}
        //        subheader="0isk"
      />
      {children}
    </Card>
  );
};
