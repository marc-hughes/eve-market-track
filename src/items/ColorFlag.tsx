import { Fab, Menu, MenuItem } from '@material-ui/core';
import React, { useState } from 'react';
import FlagIcon from '@material-ui/icons/Flag';

const flagColors = [
  '#dddddd',
  '#a05050',
  '#82488c',
  '#467eac',
  '#5a8b5c',
  '#fff176',
  '#ffb74d'
];
type ChangeFunc = (color: string) => void;

export const ColorFlag: React.FC<{ value: string; onChange: ChangeFunc }> = ({
  value,
  onChange
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const openMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const pickColor = (color: string) => () => {
    onChange(color);
    closeMenu();
  };

  const closeMenu = () => setAnchorEl(null);

  return (
    <React.Fragment>
      <Fab
        aria-label="add"
        size="small"
        onClick={openMenu}
        style={{
          backgroundColor: value || '#fff'
        }}
      >
        <FlagIcon />
      </Fab>
      <Menu
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={closeMenu}
      >
        <MenuItem onClick={pickColor(null)}>No Flag</MenuItem>
        {flagColors.map((color) => (
          <MenuItem
            key={color}
            onClick={pickColor(color)}
            style={{ backgroundColor: color }}
          >
            <FlagIcon />
          </MenuItem>
        ))}
      </Menu>
    </React.Fragment>
  );
};
