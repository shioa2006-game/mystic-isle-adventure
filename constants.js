(function () {
  // ゲームで使用する列挙型や共有定数を定義
  const Game = (window.Game = window.Game || {});

  if (!Game.config) {
    throw new Error("Game.config が未定義です。config.js を先に読み込んでください。");
  }

  const SCENE = Object.freeze({
    FIELD: "FIELD",
    TOWN: "TOWN",
    CAVE: "CAVE",
    CAVE_B2: "CAVE_B2",
  });

  const TILE = Object.freeze({
    GRASS: "GRASS",
    ROAD: "ROAD",
    WATER: "WATER",
    FLOOR_CAVE: "FLOOR_CAVE",
    FLOOR_BUILD: "FLOOR_BUILD",
    MOUNTAIN: "MOUNTAIN",
    ROCK: "ROCK",
    TREE: "TREE",
    WALL: "WALL",
    DOOR: "DOOR",
    ENTRANCE_TOWN: "ENTRANCE_TOWN",
    ENTRANCE_CAVE: "ENTRANCE_CAVE",
    STAIRS_UP: "STAIRS_UP",
    STAIRS_DOWN: "STAIRS_DOWN",
    RUINS: "RUINS",
  });

  const TILE_COLOR = Object.freeze({
    [TILE.GRASS]: "#7CCB5B",
    [TILE.ROAD]: "#B57A43",
    [TILE.WATER]: "#2F6DD5",
    [TILE.FLOOR_CAVE]: "#444444",
    [TILE.FLOOR_BUILD]: "#5A3A2A",
    [TILE.MOUNTAIN]: "#5B4E3A",
    [TILE.ROCK]: "#555555",
    [TILE.TREE]: "#5DA147",
    [TILE.WALL]: "#703737",
    [TILE.DOOR]: "#B57A43",
    [TILE.ENTRANCE_TOWN]: "#7CCB5B",
    [TILE.ENTRANCE_CAVE]: "#444444",
    [TILE.STAIRS_UP]: "#444444",
    [TILE.STAIRS_DOWN]: "#444444",
    [TILE.RUINS]: "#6B4F4F",
  });

  const TILE_BLOCKED = Object.freeze({
    [TILE.WATER]: true,
    [TILE.MOUNTAIN]: true,
    [TILE.ROCK]: true,
    [TILE.WALL]: true,
  });

  const sceneLabels = Object.freeze({
    [SCENE.FIELD]: "フィールド",
    [SCENE.TOWN]: "街",
    [SCENE.CAVE]: "洞窟",
    [SCENE.CAVE_B2]: "洞窟 地下2階",
  });

  const ITEM = Object.freeze({
    FOOD10: "FOOD10",
    POTION: "POTION",
    WOOD_SWORD: "WOOD_SWORD",
    BRONZE_SWORD: "BRONZE_SWORD",
    IRON_SWORD: "IRON_SWORD",
    HOLY_SWORD: "HOLY_SWORD",
    WOOD_SHIELD: "WOOD_SHIELD",
    BRONZE_SHIELD: "BRONZE_SHIELD",
    IRON_SHIELD: "IRON_SHIELD",
    HOLY_SHIELD: "HOLY_SHIELD",
    POWER_HAMMER: "POWER_HAMMER",
    HOLY_ORE: "HOLY_ORE",
    ANCIENT_KEY: "ANCIENT_KEY",
  });

  const INVENTORY_MAX = 6;
  const FOOD_CAP = 999;

  const OVERLAY = Object.freeze({
    TITLE: "TITLE",
    SHOP: "SHOP",
    INVENTORY: "INVENTORY",
    STATUS: "STATUS",
    INN: "INN",
    SAVE_CONFIRM: "SAVE_CONFIRM",
  });

  const LAYER = Object.freeze({
    FLOOR: 0,
    DECOR: 1,
    STATIC: 2,
    NPC: 3,
    ENEMY: 4,
    PLAYER: 5,
  });

  const RESERVED_TILES = new Set([
    TILE.DOOR,
    TILE.ENTRANCE_TOWN,
    TILE.ENTRANCE_CAVE,
    TILE.STAIRS_UP,
    TILE.STAIRS_DOWN,
    TILE.RUINS,
  ]);

  const NO_ENEMY_RADIUS = 1;
  const MAX_MESSAGES = 4;

  // レベルnに到達するために必要な累積経験値を計算
  // 数式: 5 × n × (n - 1)
  // 例: LV2=10, LV3=30, LV4=60, LV5=100, ..., LV10=450, LV99=48,510
  function getExpForLevel(level) {
    if (level <= 1) return 0;
    return 5 * level * (level - 1);
  }

  Game.SCENE = SCENE;
  Game.TILE = TILE;
  Game.TILE_COLOR = TILE_COLOR;
  Game.TILE_BLOCKED = TILE_BLOCKED;
  Game.sceneLabels = sceneLabels;
  Game.ITEM = ITEM;
  Game.INVENTORY_MAX = INVENTORY_MAX;
  Game.FOOD_CAP = FOOD_CAP;
  Game.OVERLAY = OVERLAY;
  Game.LAYER = LAYER;
  Game.RESERVED_TILES = RESERVED_TILES;
  Game.NO_ENEMY_RADIUS = NO_ENEMY_RADIUS;
  Game.MAX_MESSAGES = MAX_MESSAGES;
  Game.getExpForLevel = getExpForLevel;
})();
