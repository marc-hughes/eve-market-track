import { Avatar } from '@material-ui/core';
import React from 'react';

export const ItemImage: React.FC<{ typeId: string }> = ({ typeId }) => (
  <Avatar src={`https://images.evetech.net/types/${typeId}/icon`} />
);
