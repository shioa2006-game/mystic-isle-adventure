(function () {
  // セーブ/ロード処理と神父の祈りによる記録を管轄
  const Game = (window.Game = window.Game || {});

  const STORAGE_KEY = "mia_save_v1";

  const saveState = {
    available: false,
  };

  function getStorage() {
    try {
      return window.localStorage || null;
    } catch (error) {
      console.warn("localStorage を利用できませんでした", error);
      return null;
    }
  }

  function refreshAvailability() {
    const storage = getStorage();
    if (!storage) {
      saveState.available = false;
      return false;
    }
    saveState.available = !!storage.getItem(STORAGE_KEY);
    return saveState.available;
  }

  function hasSaveData() {
    return saveState.available;
  }

  function requestSave() {
    if (!getStorage()) {
      Game.pushMessage({ text: "この環境では記録を残せません。" });
      return;
    }
    if (!Game.ui || !Game.ui.state || !Game.ui.OVERLAY) return;
    Game.ui.state.saveConfirm.selection = 0;
    Game.ui.open(Game.ui.OVERLAY.SAVE_CONFIRM);
  }

  function executeSave() {
    const success = performSave();
    if (success && Game.ui && Game.ui.state.overlay === Game.ui.OVERLAY.SAVE_CONFIRM) {
      Game.ui.close();
    }
    return success;
  }

  function cancelSave() {
    if (Game.ui && Game.ui.state.overlay === Game.ui.OVERLAY.SAVE_CONFIRM) {
      Game.ui.close();
    }
    Game.pushMessage({ text: "また必要なときに祈りを捧げてください。" });
  }

  function continueFromLatest() {
    Game.startGame();
    const loaded = loadLatestSnapshot();
    if (loaded) {
      Game.pushMessage({ text: "記録された場所から冒険を再開した。" });
    } else {
      Game.pushMessage({ text: "セーブデータが見つからなかったため、新しい冒険を始めた。" });
    }
  }

  function performSave() {
    const storage = getStorage();
    if (!storage) {
      Game.pushMessage({ text: "この環境では記録を残せません。" });
      return false;
    }
    const snapshot = collectSnapshot();
    if (!snapshot) {
      Game.pushMessage({ text: "セーブに必要な情報を取得できませんでした。" });
      return false;
    }
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      saveState.available = true;
      Game.pushMessage({ text: "祈りの力で記録を残した。" });
      return true;
    } catch (error) {
      console.error("セーブに失敗しました", error);
      Game.pushMessage({ text: "記録に失敗しました…" });
      return false;
    }
  }

  function loadLatestSnapshot() {
    const storage = getStorage();
    if (!storage) {
      saveState.available = false;
      return false;
    }
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) {
      saveState.available = false;
      return false;
    }
    try {
      const data = JSON.parse(raw);
      const applied = applySnapshot(data);
      if (!applied) {
        console.warn("セーブデータの適用に失敗しました");
        return false;
      }
      saveState.available = true;
      return true;
    } catch (error) {
      console.error("セーブデータの読み込みに失敗しました", error);
      return false;
    }
  }

  function collectSnapshot() {
    if (!Game.state || !Game.playerState || !Game.flags) return null;
    const player = Game.state.player || Game.playerState.createDefaultPlayer();
    const inventory = Array.isArray(player.inventory) ? [...player.inventory] : [];
    const equip = player.equip || {};
    const snapshot = {
      version: 1,
      timestamp: Date.now(),
      scene: Game.state.scene,
      playerPos: { x: Game.state.playerPos.x, y: Game.state.playerPos.y },
      player: {
        hp: player.hp,
        maxHp: player.maxHp,
        atk: player.atk,
        def: player.def,
        lv: player.lv,
        exp: player.exp,
        food: player.food,
        gold: player.gold,
        inventory,
        equip: {
          weapon: equip.weapon,
          shield: equip.shield,
        },
      },
      flags: {
        dragonDefeated: !!Game.state.flags.dragonDefeated,
      },
      progressFlags: serializeProgressFlags(Game.flags),
    };
    return snapshot;
  }

  function serializeProgressFlags(flags) {
    if (!flags) {
      return {
        questTalked: false,
        questGiven: false,
        hasKey: false,
        cleared: false,
        openedChests: [],
      };
    }
    return {
      questTalked: !!flags.questTalked,
      questGiven: !!flags.questGiven,
      hasKey: !!flags.hasKey,
      cleared: !!flags.cleared,
      openedChests: Array.isArray(flags.openedChests)
        ? flags.openedChests.slice()
        : Array.from(flags.openedChests || []),
    };
  }

  function applySnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object") return false;
    if (!Game.state || !Game.playerState) return false;
    const PlayerState = Game.playerState;
    const defaults = PlayerState.createDefaultPlayer();
    const rawPlayer = snapshot.player || {};
    const inventoryLimit = Game.INVENTORY_MAX || rawPlayer.inventory?.length || 0;
    const inventorySource = Array.isArray(rawPlayer.inventory) ? rawPlayer.inventory : [];
    const inventory = inventorySource.slice(0, inventoryLimit || inventorySource.length);
    const equip = rawPlayer.equip || {};
    const sanitizedPlayer = {
      ...defaults,
      ...rawPlayer,
      inventory,
      equip: {
        weapon: sanitizeEquipIndex(equip.weapon, inventory.length),
        shield: sanitizeEquipIndex(equip.shield, inventory.length),
      },
    };
    sanitizedPlayer.hp = Math.min(Math.max(1, sanitizedPlayer.hp), sanitizedPlayer.maxHp);
    const foodCap = Game.FOOD_CAP != null ? Game.FOOD_CAP : 999;
    sanitizedPlayer.food = Math.min(Math.max(0, sanitizedPlayer.food), foodCap);
    sanitizedPlayer.gold = Math.max(0, sanitizedPlayer.gold);

    Game.state.player = sanitizedPlayer;

    const validScene = validateScene(snapshot.scene);
    Game.state.scene = validScene;
    const pos = clampPosition(snapshot.playerPos, validScene);
    Game.setPlayerPosition(pos);

    PlayerState.resetProgressFlags(Game.flags);
    applyProgressFlags(snapshot.progressFlags);

    Game.state.flags.dragonDefeated = snapshot.flags ? !!snapshot.flags.dragonDefeated : false;
    Game.state.flags.starvingNotified = false;
    Game.state.walkCounter = 0;

    Game.state.messages = [];
    if (Game.battle) {
      Game.battle.active = false;
      Game.battle.enemy = null;
      Game.battle.turn = "PLAYER";
      Game.battle.playerDefending = false;
    }

    ensureSceneEnemies();

    if (Game.occupancy && typeof Game.occupancy.markDirty === "function") {
      Game.occupancy.markDirty();
      Game.occupancy.ensure();
    }
    return true;
  }

  function sanitizeEquipIndex(index, length) {
    if (typeof index !== "number") return null;
    if (index < 0 || index >= length) return null;
    return index;
  }

  function clampPosition(pos) {
    const width = Game.config ? Game.config.gridWidth : 0;
    const height = Game.config ? Game.config.gridHeight : 0;
    const x = pos && typeof pos.x === "number" ? clampValue(pos.x, 0, width - 1) : 0;
    const y = pos && typeof pos.y === "number" ? clampValue(pos.y, 0, height - 1) : 0;
    return { x, y };
  }

  function validateScene(scene) {
    const scenes = Game.SCENE || {};
    const values = Object.values(scenes);
    if (values.includes(scene)) return scene;
    return scenes.FIELD || scene;
  }

  function applyProgressFlags(raw) {
    const flags = Game.flags;
    if (!flags) return;
    if (!raw) return;
    flags.questTalked = !!raw.questTalked;
    flags.questGiven = !!raw.questGiven;
    flags.hasKey = !!raw.hasKey;
    flags.cleared = !!raw.cleared;
    if (!flags.openedChests) {
      flags.openedChests = new Set();
    } else {
      flags.openedChests.clear();
    }
    if (Array.isArray(raw.openedChests)) {
      raw.openedChests.forEach((key) => {
        flags.openedChests.add(key);
      });
    }
  }

  function ensureSceneEnemies() {
    if (!Game.entities) return;
    const scene = Game.state.scene;
    if (scene === Game.SCENE.FIELD && typeof Game.entities.ensureFieldEnemies === "function") {
      Game.entities.ensureFieldEnemies();
      return;
    }
    if (
      (scene === Game.SCENE.CAVE || scene === Game.SCENE.CAVE_B2) &&
      typeof Game.entities.ensureCaveEnemies === "function"
    ) {
      Game.entities.ensureCaveEnemies();
    }
  }

  function clampValue(value, min, max) {
    if (Game.utils && typeof Game.utils.clamp === "function") {
      return Game.utils.clamp(value, min, max);
    }
    return Math.min(Math.max(value, min), max);
  }

  refreshAvailability();

  Game.saveSystem = {
    hasSaveData,
    refreshAvailability,
    requestSave,
    executeSave,
    cancelSave,
    continueFromLatest,
  };
})();
