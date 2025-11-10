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
    BRONZE_SWORD: "BRONZE_SWORD",
    WOOD_SHIELD: "WOOD_SHIELD",
    ANCIENT_KEY: "ANCIENT_KEY",
  });

  const PRICE = Object.freeze({
    [ITEM.FOOD10]: 10,
    [ITEM.POTION]: 15,
    [ITEM.BRONZE_SWORD]: 40,
    [ITEM.WOOD_SHIELD]: 35,
  });

  const ITEM_META = Object.freeze({
    [ITEM.FOOD10]: { name: "Food 10", detail: "Food を 10 回復" },
    [ITEM.POTION]: { name: "Potion", detail: "HP を 20 回復" },
    [ITEM.BRONZE_SWORD]: { name: "Bronze Sword", detail: "ATK +2" },
    [ITEM.WOOD_SHIELD]: { name: "Wood Shield", detail: "DEF +2" },
    [ITEM.ANCIENT_KEY]: { name: "Ancient Key", detail: "遺跡の鍵" },
  });

  const INVENTORY_MAX = 6;
  const FOOD_CAP = 999;

  const EQUIP_BONUS = Object.freeze({
    weapon: 2,
    shield: 2,
  });

  const OVERLAY = Object.freeze({
    SHOP: "SHOP",
    INVENTORY: "INVENTORY",
    STATUS: "STATUS",
    INN: "INN",
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

  const LV_THRESH = Object.freeze([10, 30, 60, 100, 150, 210, 280, 360, 440]);

  Game.SCENE = SCENE;
  Game.TILE = TILE;
  Game.TILE_COLOR = TILE_COLOR;
  Game.TILE_BLOCKED = TILE_BLOCKED;
  Game.sceneLabels = sceneLabels;
  Game.ITEM = ITEM;
  Game.PRICE = PRICE;
  Game.ITEM_META = ITEM_META;
  Game.INVENTORY_MAX = INVENTORY_MAX;
  Game.FOOD_CAP = FOOD_CAP;
  Game.EQUIP_BONUS = EQUIP_BONUS;
  Game.OVERLAY = OVERLAY;
  Game.LAYER = LAYER;
  Game.RESERVED_TILES = RESERVED_TILES;
  Game.NO_ENEMY_RADIUS = NO_ENEMY_RADIUS;
  Game.MAX_MESSAGES = MAX_MESSAGES;
  Game.LV_THRESH = LV_THRESH;
})();
