import { Avatar } from '@material-ui/core';
import React from 'react';
import styled from '@emotion/styled';

const Img = styled.img(({ size }: { size: number }) => ({
  width: size,
  height: size,
  padding: 3
}));

export const ItemImage: React.FC<{ typeId: string; size?: number }> = ({
  typeId,
  size = 32
}) => (
  <Img size={size} src={`https://images.evetech.net/types/${typeId}/icon`} />
);
