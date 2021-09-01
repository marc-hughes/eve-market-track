import React from 'react';
import { useStatic } from './items/esi-static';
import { ItemImage } from './items/ItemImage';

export const Intro = () => {
  const item = useStatic(21551);
  if (item) {
    return (
      <div>
        <h1>Welcome to the Eve Market Tracker (name TBD)</h1>
        <p>
          To get started:
          <ul>
            <li>Add your market trading characters on the left</li>
            <li>Create a trade route in the trading config</li>
            <li>Refresh Data</li>
          </ul>
        </p>
      </div>
    );
  }
  return <div>Hi there!</div>;
};
