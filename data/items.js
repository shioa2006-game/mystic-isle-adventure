(function () {
  // アイテムのメタ情報と価格を一元管理
  const Game = (window.Game = window.Game || {});

  if (!Game.ITEM) {
    throw new Error("Game.ITEM が未定義のため、constants.js を先に読み込んでください。");
  }

  const ITEM_CATEGORY = Object.freeze({
    CONSUMABLE: "CONSUMABLE",
    WEAPON: "WEAPON",
    SHIELD: "SHIELD",
    STORY: "STORY",
  });

  const ITEM_DATA = Object.freeze({
    FOOD10: {
      id: Game.ITEM.FOOD10,
      name: "Food 10",
      detail: "Food を 10 回復",
      price: 10,
      category: ITEM_CATEGORY.CONSUMABLE,
      foodGain: 10,
    },
    POTION: {
      id: Game.ITEM.POTION,
      name: "Potion",
      detail: "HP を 20 回復",
      price: 15,
      category: ITEM_CATEGORY.CONSUMABLE,
      consumableEffect: { hp: 20 },
    },
    WOOD_SWORD: {
      id: Game.ITEM.WOOD_SWORD,
      name: "Wood Sword",
      detail: "ATK +2",
      price: 50,
      category: ITEM_CATEGORY.WEAPON,
      equip: { slot: "weapon", atk: 2 },
    },
    BRONZE_SWORD: {
      id: Game.ITEM.BRONZE_SWORD,
      name: "Bronze Sword",
      detail: "ATK +4",
      price: 90,
      category: ITEM_CATEGORY.WEAPON,
      equip: { slot: "weapon", atk: 4 },
    },
    IRON_SWORD: {
      id: Game.ITEM.IRON_SWORD,
      name: "Iron Sword",
      detail: "ATK +6",
      price: 150,
      category: ITEM_CATEGORY.WEAPON,
      equip: { slot: "weapon", atk: 6 },
    },
    ANCIENT_SWORD: {
      id: Game.ITEM.ANCIENT_SWORD,
      name: "Ancient Sword",
      detail: "ATK +8 / ??????",
      price: 0,
      category: ITEM_CATEGORY.WEAPON,
      equip: { slot: "weapon", atk: 8 },
      unsellable: true,
    },
    HOLY_SWORD: {
      id: Game.ITEM.HOLY_SWORD,
      name: "Holy Sword",
      detail: "ATK +10（鍛冶屋が錬成）",
      price: 0,
      category: ITEM_CATEGORY.WEAPON,
      equip: { slot: "weapon", atk: 10 },
    },
    WOOD_SHIELD: {
      id: Game.ITEM.WOOD_SHIELD,
      name: "Wood Shield",
      detail: "DEF +2",
      price: 45,
      category: ITEM_CATEGORY.SHIELD,
      equip: { slot: "shield", def: 2 },
    },
    BRONZE_SHIELD: {
      id: Game.ITEM.BRONZE_SHIELD,
      name: "Bronze Shield",
      detail: "DEF +4",
      price: 75,
      category: ITEM_CATEGORY.SHIELD,
      equip: { slot: "shield", def: 4 },
    },
    IRON_SHIELD: {
      id: Game.ITEM.IRON_SHIELD,
      name: "Iron Shield",
      detail: "DEF +6",
      price: 135,
      category: ITEM_CATEGORY.SHIELD,
      equip: { slot: "shield", def: 6 },
    },
    HOLY_SHIELD: {
      id: Game.ITEM.HOLY_SHIELD,
      name: "Holy Shield",
      detail: "DEF +10（王様から授与）",
      price: 0,
      category: ITEM_CATEGORY.SHIELD,
      equip: { slot: "shield", def: 10 },
    },
    POWER_HAMMER: {
      id: Game.ITEM.POWER_HAMMER,
      name: "Power Hammer",
      detail: "岩を砕ける特別なハンマー",
      price: 0,
      category: ITEM_CATEGORY.STORY,
    },
    HOLY_ORE: {
      id: Game.ITEM.HOLY_ORE,
      name: "Holy Ore",
      detail: "聖剣を鍛えるための素材",
      price: 0,
      category: ITEM_CATEGORY.STORY,
    },
    ANCIENT_KEY: {
      id: Game.ITEM.ANCIENT_KEY,
      name: "Ancient Key",
      detail: "遺跡の扉を開く鍵",
      price: 0,
      category: ITEM_CATEGORY.STORY,
    },
  });

  const PRICE = Object.freeze(
    Object.keys(ITEM_DATA).reduce((acc, key) => {
      acc[key] = ITEM_DATA[key].price || 0;
      return acc;
    }, {})
  );

  const ITEM_META = Object.freeze(
    Object.keys(ITEM_DATA).reduce((acc, key) => {
      acc[key] = {
        name: ITEM_DATA[key].name,
        detail: ITEM_DATA[key].detail,
      };
      return acc;
    }, {})
  );

  Game.ITEM_CATEGORY = ITEM_CATEGORY;
  Game.ITEM_DATA = ITEM_DATA;
  Game.PRICE = PRICE;
  Game.ITEM_META = ITEM_META;
})();
