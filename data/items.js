(function () {
  // アイテムのメタ情報と価格を一元管理
  const Game = (window.Game = window.Game || {});

  if (!Game.ITEM) {
    throw new Error("Game.ITEM が未定義のため、constants.js を先に読み込んでください。");
  }

  const ITEM_DATA = Object.freeze({
    FOOD10: {
      id: Game.ITEM.FOOD10,
      name: "Food 10",
      detail: "Food を 10 回復",
      price: 10,
    },
    POTION: {
      id: Game.ITEM.POTION,
      name: "Potion",
      detail: "HP を 20 回復",
      price: 15,
    },
    BRONZE_SWORD: {
      id: Game.ITEM.BRONZE_SWORD,
      name: "Bronze Sword",
      detail: "ATK +2",
      price: 40,
    },
    WOOD_SHIELD: {
      id: Game.ITEM.WOOD_SHIELD,
      name: "Wood Shield",
      detail: "DEF +2",
      price: 35,
    },
    ANCIENT_KEY: {
      id: Game.ITEM.ANCIENT_KEY,
      name: "Ancient Key",
      detail: "遺跡の扉を開く鍵",
      price: 0,
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

  Game.ITEM_DATA = ITEM_DATA;
  Game.PRICE = PRICE;
  Game.ITEM_META = ITEM_META;
})();
