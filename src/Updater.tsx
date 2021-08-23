interface CharacterQueueItem {
  type: 'character';
  characterId: string;
}

interface MarketQueueItem {
  type: 'market';
  stationId: string;
}

type QueueItem = CharacterQueueItem | MarketQueueItem;

const updateQueue: QueueItem[] = [
  { type: 'market', stationId: '1' },
  { type: 'character', characterId: '1' }
];
