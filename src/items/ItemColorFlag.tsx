import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { ColorFlag } from './ColorFlag';

export const ItemColorFlag: React.FC<{ itemId: number }> = ({ itemId }) => {
  const note = useLiveQuery(() => db.itemNotes.get(itemId), [itemId]);
  const pickColor = (color: string) => {
    console.info(`Setting color to ${color}`, itemId);
    if (!color) {
      db.itemNotes.delete(itemId);
      return;
    }
    db.itemNotes.put({ itemId: itemId, color, note: '' });
  };
  return <ColorFlag value={note?.color} onChange={pickColor} />;
};
