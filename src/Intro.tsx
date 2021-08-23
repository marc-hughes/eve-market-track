import React from 'react';
import { useStatic } from './items/esi-static';
import { ItemImage } from './items/ItemImage';

export const Intro = () => {
  const item = useStatic(21551);
  if (item) {
    return (
      <div>
        <ItemImage typeId="21551" />
        {JSON.stringify(item)}
      </div>
    );
  }
  return <div>Hi there!</div>;
};
