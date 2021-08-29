import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { IStation } from './IStation';
import { TextField } from '@material-ui/core';

export const StationInput: React.FC<{
  stations: IStation[];
  label: string;
  value: IStation;
  onChange: any;
  className?: string;
}> = ({ stations, label, value, onChange, className = undefined }) => (
  <Autocomplete
    id="combo-box-demo"
    options={stations}
    className={className}
    value={value}
    onChange={onChange}
    getOptionLabel={(option) => option.name}
    style={{ width: 300 }}
    renderInput={(params) => (
      <TextField {...params} label={label} variant="outlined" />
    )}
  />
);
