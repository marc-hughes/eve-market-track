import {
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableRow
} from '@material-ui/core';
import React from 'react';
import { useCharacters } from '../character/character-service';
import { db } from '../data/db';

export const CharacterList = () => {
  const characters = useCharacters();

  const removeChar = (characterId: number) => () => {
    db.characters.where('id').equals(characterId).delete();
  };

  return (
    <React.Fragment>
      <h1>Characters</h1>

      <Paper>
        <Table>
          <TableBody>
            {characters?.map((character) => (
              <TableRow key={character.id}>
                <TableCell>{character.name}</TableCell>
                <TableCell>
                  <Button onClick={removeChar(character.id)}>
                    Remove Character
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </React.Fragment>
  );
};
