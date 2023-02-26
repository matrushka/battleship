import { derived, writable } from "svelte/store";

const TYPES = [
  { type: "battleship", size: 5 },
  { type: "destroyer", size: 4 },
] as const;

type ShipSpec = { type: string; size: number };
type ShipType = (typeof TYPES)[number]["type"];
type ShipState = ShipSpec & { isDown: boolean; id: string };
type ShipRoster = Array<ShipType>;
type GameStage = "IN_PROGRESS" | "OVER";

export const SHIP_ROSTER: ShipType[] = ["battleship", "destroyer", "destroyer"];
export type BlockState = { shipId?: number; hit: boolean };

const positionShip = (
  map: BlockState[][],
  w: number,
  h: number,
  shipSpec: ShipSpec,
  id: number
) => {
  let isNotPlaced = true;
  let attempt = 0;
  while (isNotPlaced) {
    let x = 0,
      y = 0,
      canBePlaced = true;

    const isVertical = Math.random() < 0.5;

    if (isVertical) {
      x = Math.round(Math.random() * (w - 1));
      y = Math.round(Math.random() * (h - shipSpec.size - 1));
    } else {
      x = Math.round(Math.random() * (w - shipSpec.size - 1));
      y = Math.round(Math.random() * (h - 1));
    }

    for (let i = 0; i < shipSpec.size; i += 1) {
      const iX = isVertical ? x : x + i;
      const iY = isVertical ? y + i : y;
      const cursor = map[iX][iY];
      canBePlaced = !cursor.shipId && canBePlaced;
    }

    if (canBePlaced) {
      for (let i = 0; i < shipSpec.size; i += 1) {
        const iX = isVertical ? x : x + i;
        const iY = isVertical ? y + i : y;
        map[iX][iY].shipId = id;
      }
    }

    isNotPlaced = !canBePlaced;
    attempt += 1;
    if (attempt === 1_000) throw new Error("Couldn't place ship.");
  }
};

export const generateMap = (w: number, h: number, roster: ShipRoster) => {
  let shipCounter = 0;

  const map: BlockState[][] = [[]];
  for (let x = 0; x < w; x += 1) {
    map[x] = [];
    for (let y = 0; y < h; y += 1) {
      map[x][y] = { hit: false };
    }
  }

  const ships: { [id: string]: ShipSpec } = {};
  for (let shipType of roster) {
    const id = (shipCounter += 1);
    const spec = TYPES.find((spec) => spec.type === shipType);
    ships[id] = { ...spec };
    positionShip(map, w, h, spec, id);
  }

  return { map, ships, meta: { width: w, height: h, shipTypes: TYPES } };
};

const initializeGame = () => generateMap(10, 10, SHIP_ROSTER);

const gameStore = writable(initializeGame());

export const restart = () => gameStore.set(initializeGame());

export const mapState = derived(gameStore, (game) => game.map);
export const shipState = derived(gameStore, (game) => {
  // calculate hits for each ship
  const shipHits = game.map
    .flatMap((column) =>
      column
        .filter((block) => block.hit && block.shipId !== undefined) // list all the hit and non-empty blocks
        .map((block) => block.shipId)
    ) // collect the shipIds
    .reduce((acc, shipId) => {
      if (acc[shipId] === undefined) acc[shipId] = 0;
      acc[shipId] += 1;
      return acc;
    }, {});

  // deduce ship state from ship hits
  return Object.entries(game.ships).reduce((acc, [id, spec]) => {
    acc.push({ id, ...spec, isDown: shipHits[id] >= spec.size });
    return acc;
  }, [] as ShipState[]);
});

export const gameState = derived([gameStore, shipState], ([game, ships]) => {
  const isGameOver = ships.filter((ship) => ship.isDown).length === ships.length;
  const gameStage: GameStage = isGameOver ? "OVER" : "IN_PROGRESS";
  return { ...game.meta, stage: gameStage };
});

export const shoot = (x: number, y: number) => {
  gameStore.update((game) => {
    const block = game.map[x][y];
    block.hit = true;
    return game;
  });
};
