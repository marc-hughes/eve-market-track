import { IChar } from '../character/IChar';
import { db } from '../data/db';
import { esiCharacterAssets, IESICharacterAssets } from '../esi';
import { validateStations } from '../station-service';

const hangarFilter = (a: IESICharacterAssets) => a.location_flag === 'Hangar';

export const updateInventory = async (character: IChar) => {
  // TODO: Error handling
  const first = await esiCharacterAssets(
    character,
    {},
    { characterId: String(character.id) }
  );
  const pages = first.headers['x-pages'];
  const assets = first.data.filter(hangarFilter);

  for (let i = 2; i <= pages; i++) {
    const page = await esiCharacterAssets(
      character,
      { page: String(i) },
      { characterId: String(character.id) }
    );
    assets.push(...page.data.filter(hangarFilter));
  }

  // This discovers any new station names that we just found out about.
  validateStations(
    {
      ...character,
      characterId: character.id
    },
    assets.map<number>((t: IESICharacterAssets) => t.location_id)
  );

  db.inventory.where({ characterId: character.id }).delete();
  db.inventory.bulkAdd(
    assets.map((a) => ({
      characterId: character.id,
      itemId: a.item_id,
      locationId: a.location_id,
      locationType: a.location_type,
      quantity: a.quantity,
      typeId: a.type_id,
      locationFlag: a.location_flag
    }))
  );
};
