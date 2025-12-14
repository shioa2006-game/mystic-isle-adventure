(function () {
  // マップデータとイベント位置を定義
  const Game = (window.Game = window.Game || {});

  const F = Game.TILE;
  const scenes = Game.SCENE;
  const mapSources = Game.mapSources || {};

  const palette = {
    ".": F.GRASS,
    r: F.ROAD,
    "~": F.WATER,
    "#": F.MOUNTAIN,
    s: F.ROCK,
    t: F.TREE,
    w: F.WALL,
    d: F.DOOR,
    c: F.FLOOR_CAVE,
    f: F.FLOOR_BUILD,
    v: F.ENTRANCE_TOWN,
    h: F.ENTRANCE_CAVE,
    x: F.STAIRS_UP,
    y: F.STAIRS_DOWN,
    u: F.RUINS,
  };

  const reservedChars = new Set(["d", "v", "h", "x", "y", "u"]);

  function normalizeRows(rows) {
    return rows.map((row) => row.replace(/\s+/g, ""));
  }

  function createTiles(rows) {
    if (rows.length !== Game.config.gridHeight) {
      throw new Error("マップの高さが設定と一致しません");
    }
    return rows.map((row, y) => {
      if (row.length !== Game.config.gridWidth) {
        throw new Error(`行 ${y} の幅が設定と一致しません`);
      }
      return row.split("").map((ch) => palette[ch] || F.GRASS);
    });
  }

  function findPositions(rows, charCode) {
    const list = [];
    rows.forEach((row, y) => {
      row.split("").forEach((ch, x) => {
        if (ch === charCode) list.push({ x, y });
      });
    });
    return list;
  }

  function collectReservedPositions(rows) {
    const list = [];
    rows.forEach((row, y) => {
      row.split("").forEach((ch, x) => {
        if (reservedChars.has(ch)) {
          list.push({ x, y });
        }
      });
    });
    return list;
  }

  function ensureRawRows(key, fileLabel) {
    const rows = mapSources[key];
    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      throw new Error(
        `${fileLabel} のマップデータが見つかりません。data/maps/${fileLabel}.js を読み込んでください`
      );
    }
    return normalizeRows(rows);
  }

  function pick(list, index, fallback) {
    if (Array.isArray(list) && list[index]) return list[index];
    return fallback;
  }

  const FIELD_RAW = ensureRawRows("FIELD", "field");
  const TOWN_RAW = ensureRawRows("TOWN", "town");
  const CAVE_B1_RAW = ensureRawRows("CAVE", "cave_b1");
  const CAVE_B2_RAW = ensureRawRows("CAVE_B2", "cave_b2");
  const CAVE2_RAW = ensureRawRows("CAVE2", "cave2_b1");
  const CAVE2_B2_RAW = ensureRawRows("CAVE2_B2", "cave2_b2");
  const RUINS_RAW = ensureRawRows("RUINS", "ruins_1f");
  const RUINS_B2_RAW = ensureRawRows("RUINS_2F", "ruins_2f");
  const RUINS_B3_RAW = ensureRawRows("RUINS_3F", "ruins_3f");

  const fieldTiles = createTiles(FIELD_RAW);
  const townTiles = createTiles(TOWN_RAW);
  const caveB1Tiles = createTiles(CAVE_B1_RAW);
  const caveB2Tiles = createTiles(CAVE_B2_RAW);
  const cave2Tiles = createTiles(CAVE2_RAW);
  const cave2B2Tiles = createTiles(CAVE2_B2_RAW);
  const ruinsTiles = createTiles(RUINS_RAW);
  const ruinsB2Tiles = createTiles(RUINS_B2_RAW);
  const ruinsB3Tiles = createTiles(RUINS_B3_RAW);

  const fieldTownEntrances = findPositions(FIELD_RAW, "v");
  const fieldCaveEntrances = findPositions(FIELD_RAW, "h");
  const fieldRuinsEntrances = findPositions(FIELD_RAW, "u");
  const townDoors = findPositions(TOWN_RAW, "d");
  const caveUpStairs = findPositions(CAVE_B1_RAW, "x");
  const caveDownStairs = findPositions(CAVE_B1_RAW, "y");
  const caveB2UpStairs = findPositions(CAVE_B2_RAW, "x");

  const cave2UpStairs = findPositions(CAVE2_RAW, "x");
  const cave2DownStairs = findPositions(CAVE2_RAW, "y");
  const cave2B2UpStairs = findPositions(CAVE2_B2_RAW, "x");

  const ruinsUpStairs = findPositions(RUINS_RAW, "x");
  const ruinsDownStairs = findPositions(RUINS_RAW, "y");
  const ruinsB2UpStairs = findPositions(RUINS_B2_RAW, "x");
  const ruinsB2DownStairs = findPositions(RUINS_B2_RAW, "y");
  const ruinsB3UpStairs = findPositions(RUINS_B3_RAW, "x");
  const ruinsB3DownStairs = findPositions(RUINS_B3_RAW, "y");

  const fieldTownEntry = pick(fieldTownEntrances, 0, { x: 10, y: 8 });
  const fieldCaveEntry = pick(fieldCaveEntrances, 0, { x: 18, y: 3 });
  const fieldCave2Entry = pick(fieldCaveEntrances, 1, { x: 21, y: 15 });
  const fieldRuinsEntry = pick(fieldRuinsEntrances, 0, { x: 5, y: 5 });
  const caveExit = pick(caveUpStairs, 0, { x: 10, y: 1 });
  const caveDown = pick(caveDownStairs, 0, { x: caveExit.x, y: Math.min(caveExit.y + 2, Game.config.gridHeight - 2) });
  const caveB2Entry = pick(caveB2UpStairs, 0, {
    x: caveDown.x,
    y: Math.max(caveDown.y - 1, 0),
  });

  const cave2Exit = pick(cave2UpStairs, 0, { x: 10, y: 1 });
  const cave2Down = pick(cave2DownStairs, 0, {
    x: cave2Exit.x,
    y: Math.min(cave2Exit.y + 2, Game.config.gridHeight - 2),
  });
  const cave2B2Entry = pick(cave2B2UpStairs, 0, {
    x: cave2Down.x,
    y: Math.max(cave2Down.y - 1, 0),
  });

  const ruinsEntryUp = pick(ruinsUpStairs, 0, { x: 12, y: 1 });
  const ruinsDown = pick(
    ruinsDownStairs,
    0,
    { x: ruinsEntryUp.x, y: ruinsEntryUp.y }
  );
  const ruinsB2Entry = pick(ruinsB2UpStairs, 0, { x: 12, y: 16 });
  const ruinsB2Down = pick(
    ruinsB2DownStairs,
    0,
    { x: 12, y: 1 }
  );
  const ruinsB3Entry = pick(ruinsB3UpStairs, 0, { x: 12, y: 16 });
  const ruinsB3Down = pick(
    ruinsB3DownStairs,
    0,
    { x: 12, y: 16 }
  );
  const ruinsFieldEntrances = [
    { x: 11, y: 17 },
    { x: 12, y: 17 },
  ];

  const defaultTownDoor = { x: 11, y: 17 };
  const townDoorSouth =
    townDoors.reduce((result, pos) => {
      if (!result || pos.y > result.y) {
        return { x: pos.x, y: pos.y };
      }
      return result;
    }, null) || defaultTownDoor;
  const townDoorNorth =
    townDoors.reduce((result, pos) => {
      if (!result || pos.y < result.y) {
        return { x: pos.x, y: pos.y };
      }
      return result;
    }, null) || { x: townDoorSouth.x, y: townDoorSouth.y };

  const fieldSpawnFromTownSouth = {
    x: fieldTownEntry.x,
    y: Math.min(fieldTownEntry.y + 1, Game.config.gridHeight - 1),
  };
  const fieldSpawnFromTownNorth = {
    x: fieldTownEntry.x,
    y: Math.max(fieldTownEntry.y - 1, 0),
  };
  const caveSpawnFromField = {
    x: caveExit.x,
    y: caveExit.y,
  };
  const caveSpawnFromLower = {
    x: caveDown.x,
    y: caveDown.y,
  };
  const caveB2SpawnFromUpper = {
    x: caveB2Entry.x,
    y: caveB2Entry.y,
  };

  const cave2SpawnFromField = {
    x: cave2Exit.x,
    y: cave2Exit.y,
  };
  const cave2SpawnFromLower = {
    x: cave2Down.x,
    y: cave2Down.y,
  };
  const cave2B2SpawnFromUpper = {
    x: cave2B2Entry.x,
    y: cave2B2Entry.y,
  };

  // RUINS spawn positions fixed
  const ruinsSpawnFromField = { x: 12, y: 16 };
  const ruinsSpawnFromLower = { x: ruinsDown.x, y: ruinsDown.y };
  const ruinsB2SpawnFromUpper = { x: ruinsB2Down.x, y: ruinsB2Down.y };
  const ruinsB2SpawnFromLower = { x: ruinsB2Entry.x, y: ruinsB2Entry.y };
  const ruinsB3SpawnFromUpper = { x: ruinsB3Down.x, y: ruinsB3Down.y };

  const townEntrances = [
    {
      tile: F.DOOR,
      position: { x: townDoorSouth.x, y: townDoorSouth.y },
      targetScene: scenes.FIELD,
      targetSpawn: "fromTownSouth",
    },
  ];
  if (townDoorNorth.x !== townDoorSouth.x || townDoorNorth.y !== townDoorSouth.y) {
    townEntrances.push({
      tile: F.DOOR,
      position: { x: townDoorNorth.x, y: townDoorNorth.y },
      targetScene: scenes.FIELD,
      targetSpawn: "fromTownNorth",
    });
  }

  const fieldReservedTiles = collectReservedPositions(FIELD_RAW);
  const townReservedTiles = collectReservedPositions(TOWN_RAW);
  const caveB1ReservedTiles = collectReservedPositions(CAVE_B1_RAW);
  const caveB2ReservedTiles = collectReservedPositions(CAVE_B2_RAW);
  const cave2ReservedTiles = collectReservedPositions(CAVE2_RAW);
  const cave2B2ReservedTiles = collectReservedPositions(CAVE2_B2_RAW);
  const ruinsReservedTiles = collectReservedPositions(RUINS_RAW);
  const ruinsB2ReservedTiles = collectReservedPositions(RUINS_B2_RAW);
  const ruinsB3ReservedTiles = collectReservedPositions(RUINS_B3_RAW);

  Game.mapData = {
    [scenes.FIELD]: {
      tiles: fieldTiles,
      reservedTiles: fieldReservedTiles,
      spawnPoints: {
        default: { x: 2, y: 2 },
        fromTown: { x: fieldSpawnFromTownSouth.x, y: fieldSpawnFromTownSouth.y },
        fromTownSouth: { x: fieldSpawnFromTownSouth.x, y: fieldSpawnFromTownSouth.y },
        fromTownNorth: { x: fieldSpawnFromTownNorth.x, y: fieldSpawnFromTownNorth.y },
        fromCave: { x: fieldCaveEntry.x, y: fieldCaveEntry.y },
        fromCave2: { x: fieldCave2Entry.x, y: fieldCave2Entry.y },
        fromRuins: { x: fieldRuinsEntry.x, y: fieldRuinsEntry.y },
      },
      entrances: [
        {
          tile: F.ENTRANCE_TOWN,
          position: fieldTownEntry,
          targetScene: scenes.TOWN,
          targetSpawn: "fromField",
        },
        {
          tile: F.ENTRANCE_CAVE,
          position: fieldCaveEntry,
          targetScene: scenes.CAVE,
          targetSpawn: "fromField",
        },
      ],
    },
    [scenes.TOWN]: {
      tiles: townTiles,
      reservedTiles: townReservedTiles,
      spawnPoints: {
        default: {
          x: townDoorSouth.x,
          y: Math.max(townDoorSouth.y - 1, 0),
        },
        fromField: {
          x: townDoorSouth.x,
          y: Math.max(townDoorSouth.y - 1, 0),
        },
      },
      entrances: townEntrances,
    },
    [scenes.CAVE]: {
      tiles: caveB1Tiles,
      reservedTiles: caveB1ReservedTiles,
      spawnPoints: {
        default: { x: caveSpawnFromField.x, y: caveSpawnFromField.y },
        fromField: { x: caveSpawnFromField.x, y: caveSpawnFromField.y },
        fromLower: { x: caveSpawnFromLower.x, y: caveSpawnFromLower.y },
      },
      entrances: [
        {
          tile: F.STAIRS_UP,
          position: caveExit,
          targetScene: scenes.FIELD,
          targetSpawn: "fromCave",
        },
        {
          tile: F.STAIRS_DOWN,
          position: caveDown,
          targetScene: scenes.CAVE_B2,
          targetSpawn: "fromUpper",
        },
      ],
    },
    [scenes.CAVE_B2]: {
      tiles: caveB2Tiles,
      reservedTiles: caveB2ReservedTiles,
      spawnPoints: {
        default: { x: caveB2SpawnFromUpper.x, y: caveB2SpawnFromUpper.y },
        fromUpper: { x: caveB2SpawnFromUpper.x, y: caveB2SpawnFromUpper.y },
      },
      entrances: [
        {
          tile: F.STAIRS_UP,
          position: caveB2Entry,
          targetScene: scenes.CAVE,
          targetSpawn: "fromLower",
        },
      ],
    },
    [scenes.CAVE2]: {
      tiles: cave2Tiles,
      reservedTiles: cave2ReservedTiles,
      spawnPoints: {
        default: { x: cave2SpawnFromField.x, y: cave2SpawnFromField.y },
        fromField: { x: cave2SpawnFromField.x, y: cave2SpawnFromField.y },
        fromLower: { x: cave2SpawnFromLower.x, y: cave2SpawnFromLower.y },
      },
      entrances: [
        {
          tile: F.STAIRS_UP,
          position: cave2Exit,
          targetScene: scenes.FIELD,
          targetSpawn: "fromCave2",
        },
        {
          tile: F.STAIRS_DOWN,
          position: cave2Down,
          targetScene: scenes.CAVE2_B2,
          targetSpawn: "fromUpper",
        },
      ],
    },
    [scenes.CAVE2_B2]: {
      tiles: cave2B2Tiles,
      reservedTiles: cave2B2ReservedTiles,
      spawnPoints: {
        default: { x: cave2B2SpawnFromUpper.x, y: cave2B2SpawnFromUpper.y },
        fromUpper: { x: cave2B2SpawnFromUpper.x, y: cave2B2SpawnFromUpper.y },
      },
      entrances: [
        {
          tile: F.STAIRS_UP,
          position: cave2B2Entry,
          targetScene: scenes.CAVE2,
          targetSpawn: "fromLower",
        },
      ],
    },
    [scenes.RUINS]: {
      tiles: ruinsTiles,
      reservedTiles: ruinsReservedTiles,
      spawnPoints: {
        default: { x: ruinsSpawnFromField.x, y: ruinsSpawnFromField.y },
        fromField: { x: ruinsSpawnFromField.x, y: ruinsSpawnFromField.y },
        fromLower: { x: ruinsSpawnFromLower.x, y: ruinsSpawnFromLower.y },
      },
      entrances: [
        {
          tile: F.STAIRS_UP,
          position: ruinsEntryUp,
          targetScene: scenes.RUINS_B2,
          targetSpawn: "fromUpper",
        },
        {
          tile: F.FLOOR_CAVE,
          position: ruinsFieldEntrances[0],
          targetScene: scenes.FIELD,
          targetSpawn: "fromRuins",
        },
        {
          tile: F.FLOOR_CAVE,
          position: ruinsFieldEntrances[1],
          targetScene: scenes.FIELD,
          targetSpawn: "fromRuins",
        },
      ],
    },
    [scenes.RUINS_B2]: {
      tiles: ruinsB2Tiles,
      reservedTiles: ruinsB2ReservedTiles,
      spawnPoints: {
        default: { x: ruinsB2SpawnFromUpper.x, y: ruinsB2SpawnFromUpper.y },
        fromUpper: { x: ruinsB2SpawnFromUpper.x, y: ruinsB2SpawnFromUpper.y },
        fromLower: { x: ruinsB2SpawnFromLower.x, y: ruinsB2SpawnFromLower.y },
      },
      entrances: [
        {
          tile: F.STAIRS_DOWN,
          position: ruinsB2Down,
          targetScene: scenes.RUINS,
          targetSpawn: "fromLower",
        },
        {
          tile: F.STAIRS_UP,
          position: ruinsB2Entry,
          targetScene: scenes.RUINS_B3,
          targetSpawn: "fromUpper",
        },
      ],
    },
    [scenes.RUINS_B3]: {
      tiles: ruinsB3Tiles,
      reservedTiles: ruinsB3ReservedTiles,
      spawnPoints: {
        default: { x: ruinsB3SpawnFromUpper.x, y: ruinsB3SpawnFromUpper.y },
        fromUpper: { x: ruinsB3SpawnFromUpper.x, y: ruinsB3SpawnFromUpper.y },
      },
      entrances: [
        {
          tile: F.STAIRS_DOWN,
          position: ruinsB3Down,
          targetScene: scenes.RUINS_B2,
          targetSpawn: "fromLower",
        },
      ],
    },
  };

  Game.EVENTS = {
    [scenes.FIELD]: {
      ruins: { x: fieldRuinsEntry.x, y: fieldRuinsEntry.y, targetScene: scenes.RUINS, targetSpawn: "fromField" },
      cave2Entrance: { x: fieldCave2Entry.x, y: fieldCave2Entry.y, targetScene: scenes.CAVE2, targetSpawn: "fromField" },
    },
    [scenes.CAVE2_B2]: {
      chests: [{ x: 1, y: 1, item: Game.ITEM ? Game.ITEM.HOLY_ORE : "HOLY_ORE" }],
    },
    [scenes.RUINS_B2]: {
      chests: [{ x: 11, y: 10, item: Game.ITEM ? Game.ITEM.ANCIENT_SWORD : "ANCIENT_SWORD" }],
      keyDoor: { x: 13, y: 10, event: "RUINS_KEY_DOOR" },
    },
    [scenes.RUINS_B3]: {
      dragon: { x: 12, y: 2 },
    },
  };
})();
