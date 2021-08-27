import { makeStyles, createStyles, Paper, Button } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const useStyles = makeStyles(() =>
  createStyles({
    closeButton: {
      position: 'fixed',
      right: 5,
      top: 0
    },
    root: {
      zIndex: 1000,
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 10,
      overflowY: 'auto'
    }
  })
);

export const FullDrawer: React.FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, onClose, children }) => {
  const classes = useStyles();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      event.key === 'Escape' && onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!open) return null;
  return createPortal(
    <Paper className={classes.root}>
      <Button className={classes.closeButton} onClick={onClose}>
        <CloseIcon />
      </Button>
      {children}
    </Paper>,
    document.querySelector('#drawer-container')
  );
};
