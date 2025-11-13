(function () {
  // プレイヤーと進行フラグ、所持品操作をまとめて管理
  const Game = (window.Game = window.Game || {});

  if (!Game.ITEM || !Game.ITEM_META) {
    throw new Error("Game.ITEM / Game.ITEM_META が未定義です。constants.js の読み込み順序を確認してください。");
  }

  const ITEM = Game.ITEM;
  const ITEM_META = Game.ITEM_META;
  const PRICE = Game.PRICE || {};

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
    const clamp = Game.utils && typeof Game.utils.clamp === "function" ? Game.utils.clamp : (v, min, max) => Math.min(Math.max(v, min), max);
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
    if (itemId === ITEM.FOOD10) {
      player.gold -= price;
      addFood(player, 10);
      return { success: true, itemId, message: "Food を 10 回復した。" };
    }
    if (isInventoryFull(player)) {
      return { success: false, reason: "FULL", message: "インベントリがいっぱいです。" };
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
        message: "そこにアイテムはない。",
      };
    }
    if (isItemEquipped(player, index)) {
      return {
        success: false,
        reason: "EQUIPPED",
        message: "装備中の物は売れない。",
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
        message: "アイテムを選択していない。",
        consumed: false,
      };
    }
    const itemId = player.inventory[index];
    switch (itemId) {
      case ITEM.POTION: {
        if (player.hp >= player.maxHp) {
          return {
            success: false,
            reason: "FULL_HP",
            message: "HP は満タンだ。",
            consumed: false,
          };
        }
        removeItemByIndex(player, index);
        player.hp = Math.min(player.maxHp, player.hp + 20);
        return {
          success: true,
          itemId,
          message: "Potion で HP が回復した。",
          consumed: true,
        };
      }
      case ITEM.FOOD10:
        addFood(player, 10);
        return {
          success: true,
          itemId,
          message: "Food を補給した。",
          consumed: false,
        };
      case ITEM.BRONZE_SWORD: {
        if (player.equip.weapon === index) {
          player.equip.weapon = null;
          return {
            success: true,
            itemId,
            message: "Bronze Sword を外した。",
            consumed: false,
          };
        }
        if (player.equip.weapon !== null) {
          return {
            success: false,
            reason: "SLOT_OCCUPIED",
            message: "他の武器を装備中だ。",
            consumed: false,
          };
        }
        player.equip.weapon = index;
        return {
          success: true,
          itemId,
          message: "Bronze Sword を装備した。",
          consumed: false,
        };
      }
      case ITEM.WOOD_SHIELD: {
        if (player.equip.shield === index) {
          player.equip.shield = null;
          return {
            success: true,
            itemId,
            message: "Wood Shield を外した。",
            consumed: false,
          };
        }
        if (player.equip.shield !== null) {
          return {
            success: false,
            reason: "SLOT_OCCUPIED",
            message: "他の盾を装備中だ。",
            consumed: false,
          };
        }
        player.equip.shield = index;
        return {
          success: true,
          itemId,
          message: "Wood Shield を装備した。",
          consumed: false,
        };
      }
      case ITEM.ANCIENT_KEY:
        return {
          success: false,
          reason: "LOCKED",
          message: "ここでは使えない。",
          consumed: false,
        };
      default:
        return {
          success: false,
          reason: "UNKNOWN",
          message: "よく分からないアイテムだ。",
          consumed: false,
        };
    }
  }

  function getEffectiveStats(player) {
    let atkBonus = 0;
    let defBonus = 0;

    if (player.equip.weapon !== null && player.equip.weapon < player.inventory.length) {
      const weaponItem = player.inventory[player.equip.weapon];
      if (weaponItem === ITEM.BRONZE_SWORD) {
        atkBonus = (Game.EQUIP_BONUS && Game.EQUIP_BONUS.weapon) || 0;
      }
    }

    if (player.equip.shield !== null && player.equip.shield < player.inventory.length) {
      const shieldItem = player.inventory[player.equip.shield];
      if (shieldItem === ITEM.WOOD_SHIELD) {
        defBonus = (Game.EQUIP_BONUS && Game.EQUIP_BONUS.shield) || 0;
      }
    }

    return {
      atk: player.atk + atkBonus,
      def: player.def + defBonus,
    };
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
