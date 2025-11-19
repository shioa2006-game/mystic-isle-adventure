(function () {
  // プレイヤーと進行フラグ、所持品操作をまとめて管理
  const Game = (window.Game = window.Game || {});

  if (!Game.ITEM || !Game.ITEM_META) {
    throw new Error("Game.ITEM / Game.ITEM_META が未定義です。constants.js の読み込み順序を確認してください。");
  }

  const ITEM = Game.ITEM;
  const ITEM_META = Game.ITEM_META;
  const PRICE = Game.PRICE || {};
  const ITEM_DATA = Game.ITEM_DATA || {};
  const ITEM_CATEGORY = Game.ITEM_CATEGORY || {};

  function getItemData(itemId) {
    if (!itemId) return null;
    return ITEM_DATA[itemId] || null;
  }

  function getItemName(itemId) {
    const meta = ITEM_META[itemId];
    return meta ? meta.name : itemId || "？？？";
  }

  function createDefaultPlayer() {
    return {
      hp: 30,
      maxHp: 30,
      atk: 5,
      def: 3,
      lv: 1,
      exp: 0,
      food: 50,
      gold: 50,
      inventory: [],
      equip: {
        weapon: null,
        shield: null,
      },
    };
  }

  function createProgressFlags() {
    return {
      questTalked: false,
      questGiven: false,
      hasKey: false,
      openedChests: new Set(),
      cleared: false,
    };
  }

  function resetProgressFlags(flags) {
    flags.questTalked = false;
    flags.questGiven = false;
    flags.hasKey = false;
    flags.cleared = false;
    if (!flags.openedChests) {
      flags.openedChests = new Set();
    } else {
      flags.openedChests.clear();
    }
  }

  function makePosKey(scene, x, y) {
    if (Game.utils && typeof Game.utils.makePosKey === "function") {
      return Game.utils.makePosKey(scene, x, y);
    }
    return `${scene}:${x},${y}`;
  }

  function hasOpenedChest(flags, scene, x, y) {
    if (!flags || !flags.openedChests) return false;
    return flags.openedChests.has(makePosKey(scene, x, y));
  }

  function markChestOpened(flags, scene, x, y) {
    if (!flags.openedChests) {
      flags.openedChests = new Set();
    }
    flags.openedChests.add(makePosKey(scene, x, y));
  }

  function isInventoryFull(player) {
    return player.inventory.length >= (Game.INVENTORY_MAX || 0);
  }

  function addItem(player, itemId) {
    if (isInventoryFull(player)) return false;
    player.inventory.push(itemId);
    return true;
  }

  function adjustEquipIndex(equipIndex, removedIndex) {
    if (equipIndex === null) return null;
    if (equipIndex === removedIndex) return null;
    if (equipIndex > removedIndex) return equipIndex - 1;
    return equipIndex;
  }

  function removeItemByIndex(player, index) {
    if (index < 0 || index >= player.inventory.length) return null;
    const [removed] = player.inventory.splice(index, 1);
    player.equip.weapon = adjustEquipIndex(player.equip.weapon, index);
    player.equip.shield = adjustEquipIndex(player.equip.shield, index);
    return removed || null;
  }

  function describeItem(itemId) {
    const meta = ITEM_META[itemId];
    if (!meta) return "詳細は未登録です。";
    return `${meta.name} : ${meta.detail}`;
  }

  function addFood(player, amount) {
    const maxFood = Game.FOOD_CAP != null ? Game.FOOD_CAP : 999;
    const clamp =
      Game.utils && typeof Game.utils.clamp === "function"
        ? Game.utils.clamp
        : (v, min, max) => Math.min(Math.max(v, min), max);
    player.food = clamp(player.food + amount, 0, maxFood);
  }

  function canBuy(player, itemId) {
    const price = PRICE[itemId];
    if (price == null) return false;
    if (player.gold < price) return false;
    if (itemId === ITEM.FOOD10) return true;
    return !isInventoryFull(player);
  }

  function buyItem(player, itemId) {
    const price = PRICE[itemId];
    if (price == null) {
      return {
        success: false,
        reason: "UNAVAILABLE",
        message: "この品はまだ扱っていません。",
      };
    }
    if (player.gold < price) {
      return { success: false, reason: "GOLD", message: "Gold が足りません。" };
    }
    const itemInfo = getItemData(itemId);
    if (itemId === ITEM.FOOD10) {
      player.gold -= price;
      const gain = (itemInfo && itemInfo.foodGain) || 10;
      addFood(player, gain);
      return { success: true, itemId, message: `Food が ${gain} 増えた。` };
    }
    if (isInventoryFull(player)) {
      return { success: false, reason: "FULL", message: "インベントリに空きがありません。" };
    }
    addItem(player, itemId);
    player.gold -= price;
    const meta = ITEM_META[itemId];
    return {
      success: true,
      itemId,
      message: `${meta ? meta.name : itemId} を購入した。`,
    };
  }

  function getSellPrice(itemId) {
    const price = PRICE[itemId];
    if (!price) return 0;
    return Math.floor(price / 2);
  }

  function isItemEquipped(player, index) {
    return player.equip.weapon === index || player.equip.shield === index;
  }

  function sellItem(player, index) {
    if (index < 0 || index >= player.inventory.length) {
      return {
        success: false,
        reason: "EMPTY",
        message: "その位置にはアイテムがない。",
      };
    }
    if (isItemEquipped(player, index)) {
      return {
        success: false,
        reason: "EQUIPPED",
        message: "装備中のアイテムは売却できない。",
      };
    }
    const itemId = player.inventory[index];
    const price = getSellPrice(itemId);
    if (price === 0) {
      return {
        success: false,
        reason: "VALUE",
        message: "このアイテムは売却できない。",
      };
    }
    removeItemByIndex(player, index);
    player.gold += price;
    const meta = ITEM_META[itemId];
    return {
      success: true,
      itemId,
      message: `${meta ? meta.name : itemId} を売却し ${price}G を得た。`,
    };
  }

  function useItemByIndex(player, index) {
    if (index < 0 || index >= player.inventory.length) {
      return {
        success: false,
        reason: "EMPTY",
        message: "アイテムが選択されていない。",
        consumed: false,
      };
    }
    const itemId = player.inventory[index];
    const itemData = getItemData(itemId);
    if (!itemData) {
      return {
        success: false,
        reason: "UNKNOWN",
        message: "よく分からないアイテムだ。",
        consumed: false,
      };
    }
    if (itemData.category === ITEM_CATEGORY.CONSUMABLE) {
      if (itemId === ITEM.FOOD10) {
        return {
          success: false,
          reason: "DIRECT",
          message: "Food は購入すると直接補充される。",
          consumed: false,
        };
      }
      return consumeInventoryItem(player, index, itemId, itemData);
    }
    if (itemData.category === ITEM_CATEGORY.WEAPON) {
      return toggleEquipmentSlot(player, index, "weapon", itemId);
    }
    if (itemData.category === ITEM_CATEGORY.SHIELD) {
      return toggleEquipmentSlot(player, index, "shield", itemId);
    }
    return {
      success: false,
      reason: "UNUSABLE",
      message: "ここでは使えない。",
      consumed: false,
    };
  }

  function consumeInventoryItem(player, index, itemId, itemData) {
    const effect = itemData.consumableEffect || {};
    if (effect.hp) {
      if (player.hp >= player.maxHp) {
        return {
          success: false,
          reason: "FULL_HP",
          message: "HP はすでに最大だ。",
          consumed: false,
        };
      }
      const before = player.hp;
      player.hp = Math.min(player.maxHp, player.hp + effect.hp);
      const healed = player.hp - before;
      removeItemByIndex(player, index);
      return {
        success: true,
        itemId,
        message: `${getItemName(itemId)} を使った。HP が ${healed} 回復した。`,
        consumed: true,
      };
    }
    return {
      success: false,
      reason: "NO_EFFECT",
      message: "効果を発揮できなかった。",
      consumed: false,
    };
  }

  function toggleEquipmentSlot(player, index, slot, itemId) {
    const currentIndex = player.equip[slot];
    const itemName = getItemName(itemId);
    if (currentIndex === index) {
      player.equip[slot] = null;
      return {
        success: true,
        itemId,
        message: `${itemName} を外した。`,
        consumed: false,
      };
    }
    if (currentIndex !== null) {
      return {
        success: false,
        reason: "SLOT_OCCUPIED",
        message: slot === "weapon" ? "他の武器を装備中だ。" : "他の盾を装備中だ。",
        consumed: false,
      };
    }
    player.equip[slot] = index;
    return {
      success: true,
      itemId,
      message: `${itemName} を装備した。`,
      consumed: false,
    };
  }

  function getEffectiveStats(player) {
    const atkBonus = getEquipStatBonus(player, "weapon", "atk");
    const defBonus = getEquipStatBonus(player, "shield", "def");
    return {
      atk: player.atk + atkBonus,
      def: player.def + defBonus,
    };
  }

  function getEquipStatBonus(player, slot, statKey) {
    const equipIndex = player.equip[slot];
    if (equipIndex === null) return 0;
    if (equipIndex < 0 || equipIndex >= player.inventory.length) return 0;
    const itemId = player.inventory[equipIndex];
    const data = getItemData(itemId);
    if (!data || !data.equip) return 0;
    return data.equip[statKey] || 0;
  }

  function grantExp(player, amount, pushMessage) {
    player.exp += amount;
    let leveled = false;
    const thresholds = Game.LV_THRESH || [];
    while (true) {
      const target = thresholds[player.lv - 1];
      if (target == null) break;
      if (player.exp < target) break;
      player.lv += 1;
      player.maxHp += 5;
      if (player.lv % 2 === 0) {
        player.atk += 1;
      } else {
        player.def += 1;
      }
      leveled = true;
      if (typeof pushMessage === "function") {
        pushMessage({ text: `レベル ${player.lv} に上がった！` });
      }
    }
    return leveled;
  }

  Game.playerState = {
    createDefaultPlayer,
    createProgressFlags,
    resetProgressFlags,
    makePosKey,
    hasOpenedChest,
    markChestOpened,
    isInventoryFull,
    addItem,
    removeItemByIndex,
    describeItem,
    addFood,
    canBuy,
    buyItem,
    sellItem,
    useItemByIndex,
    getEffectiveStats,
    isItemEquipped,
    grantExp,
  };
})();
