 (function () {
   // ゲーム全体の状態を統括し、各モジュールと共有する
   const Game = (window.Game = window.Game || {});

   if (!Game.config) {
     throw new Error("Game.config が未定義です。config.js の読み込み順序を確認してください。");
   }
   if (!Game.SCENE || !Game.TILE) {
     throw new Error("Game 定数が未定義です。constants.js の読み込み順序を確認してください。");
   }
   if (!Game.ui) {
     throw new Error("Game.ui が未定義です。state/ui_state.js の読み込み順序を確認してください。");
   }

  if (!Game.playerState) {
    throw new Error("Game.playerState が未定義です。state/player_state.js の読み込みを確認してください。");
  }
  if (!Game.occupancy) {
    throw new Error("Game.occupancy が未定義です。state/occupancy.js の読み込みを確認してください。");
  }

   const config = Game.config;
   const SCENE = Game.SCENE;
   const TILE = Game.TILE;
   const TILE_COLOR = Game.TILE_COLOR;
   const TILE_BLOCKED = Game.TILE_BLOCKED;
   const sceneLabels = Game.sceneLabels;
   const ITEM = Game.ITEM;
   const PRICE = Game.PRICE;
   const ITEM_META = Game.ITEM_META;
   const INVENTORY_MAX = Game.INVENTORY_MAX;
   const FOOD_CAP = Game.FOOD_CAP;
   const OVERLAY = Game.OVERLAY;
   const LAYER = Game.LAYER;
   const RESERVED_TILES = Game.RESERVED_TILES;
   const NO_ENEMY_RADIUS = Game.NO_ENEMY_RADIUS;
   const MAX_MESSAGES = Game.MAX_MESSAGES;
   const PlayerState = Game.playerState;
   const {
     clear: clearOccupancy,
     occupy: occupyCell,
     rebuild: rebuildOccupancy,
     ensure: ensureOccupancy,
     markDirty: markOccupancyDirty,
     get: getOccupancy,
     markEnemyRestrictedArea,
     isFreeForPlayer,
     isFreeForEnemy,
   } = Game.occupancy;

   if (!sceneLabels || !OVERLAY) {
     throw new Error("ゲーム定数の一部が未定義です。constants.js の初期化を確認してください。");
   }

  if (!Game.ENEMY_DATA) {
    throw new Error("敵データが未定義です。data/enemies.js の読み込みを確認してください。");
  }
  const ENEMY_DATA = Game.ENEMY_DATA;

  function getEnemyKindValue(key) {
    const kinds = (Game.entityTypes && Game.entityTypes.ENEMY_KIND) || {};
    return kinds[key] || key;
  }

  const BLACKSMITH_CAVE_POS = Object.freeze({ x: 1, y: 1 });
  const BLACKSMITH_TOWN_POS = Object.freeze({ x: 21, y: 2 });
  const BLACKSMITH_GUARD_POSITIONS = [
    { x: 2, y: 1 },
    { x: 1, y: 2 },
  ];
  const ANCIENT_GUARD_POSITIONS = [
    { x: 10, y: 10 },
    { x: 12, y: 10 },
  ];

  const progressFlags = PlayerState.createProgressFlags();

   const battleState = {
     active: false,
     enemy: null,
     turn: "PLAYER",
     playerDefending: false,
     returnScene: null,
     returnPos: null,
   };

   const state = {
     scene: SCENE.FIELD,
     playerPos: { x: 0, y: 0 },
     walkCounter: 0,
     enemyRespawnSteps: 0,
     enemyIdSeq: 0,
     enemies: [],
     messages: [],
    player: PlayerState.createDefaultPlayer(),
     merchant: {
       scene: SCENE.TOWN,
       pos: { x: 13, y: 11 },
     },
     innkeeper: {
       scene: SCENE.TOWN,
       pos: { x: 9, y: 5 },
     },
     king: {
       scene: SCENE.TOWN,
       pos: { x: 18, y: 2 },
     },
     priest: {
       scene: SCENE.TOWN,
       pos: { x: 15, y: 2 },
     },
     blacksmith: {
       scene: SCENE.CAVE_B2,
       pos: { x: BLACKSMITH_CAVE_POS.x, y: BLACKSMITH_CAVE_POS.y },
     },
     flags: {
       starvingNotified: false,
       dragonDefeated: false,
     },
     battle: battleState,
   };

  function clonePos(pos) {
    return { x: pos.x, y: pos.y };
  }

  function syncWorldStateFromFlags() {
    if (progressFlags.blacksmithRescued) {
      moveBlacksmithToTown();
    } else {
      state.blacksmith.scene = SCENE.CAVE_B2;
      state.blacksmith.pos = clonePos(BLACKSMITH_CAVE_POS);
    }
    ensureStoryEnemies();
  }

  function ensureStoryEnemies() {
    spawnBlacksmithGuardians();
    spawnAncientGuardians();
  }

  function spawnBlacksmithGuardians() {
    if (progressFlags.blacksmithRescued || progressFlags.blacksmithFreed) return;
    if (!Game.entities || typeof Game.entities.spawnFixedEnemy !== "function") return;
    const guardianKind = getEnemyKindValue("SKELETON");
    BLACKSMITH_GUARD_POSITIONS.forEach((pos) => {
      const exists = state.enemies.some(
        (enemy) =>
          enemy.scene === SCENE.CAVE_B2 &&
          enemy.kind === guardianKind &&
          enemy.pos.x === pos.x &&
          enemy.pos.y === pos.y
      );
      if (!exists) {
        Game.entities.spawnFixedEnemy(guardianKind, SCENE.CAVE_B2, pos, {
          persistent: true,
          guardianKey: guardianKey(pos),
        });
      }
    });
  }

  function spawnAncientGuardians() {
    if (!Game.entities || typeof Game.entities.spawnFixedEnemy !== "function") return;
    const guardianKind = getEnemyKindValue("DARK_KNIGHT");
    ANCIENT_GUARD_POSITIONS.forEach((pos) => {
      const key = guardianKey(pos);
      if (progressFlags.ancientGuardians && progressFlags.ancientGuardians.has(key)) return;
      const exists = state.enemies.some(
        (enemy) =>
          enemy.scene === SCENE.RUINS_B2 &&
          enemy.kind === guardianKind &&
          enemy.pos.x === pos.x &&
          enemy.pos.y === pos.y
      );
      if (!exists) {
        Game.entities.spawnFixedEnemy(guardianKind, SCENE.RUINS_B2, pos, {
          persistent: true,
          guardianKey: key,
        });
      }
    });
  }

  function guardianKey(pos) {
    return `${pos.x},${pos.y}`;
  }

  function handleBlacksmithGuardianDefeat(enemy) {
    const pos = enemy && enemy.pos ? enemy.pos : { x: 0, y: 0 };
    if (!progressFlags.blacksmithGuardians) {
      progressFlags.blacksmithGuardians = new Set();
    }
    const key = enemy && enemy.guardianKey ? enemy.guardianKey : guardianKey(pos);
    progressFlags.blacksmithGuardians.add(key);
    const needed = BLACKSMITH_GUARD_POSITIONS.length;
    if (progressFlags.blacksmithGuardians.size >= needed && !progressFlags.blacksmithFreed) {
      progressFlags.blacksmithFreed = true;
      pushMessage({ text: "鍛冶屋を囲んでいた魔物を倒した！" });
      pushMessage({ text: "Tキーで話しかけて救出しよう。" });
    }
  }

  function finalizeBlacksmithRescue() {
    if (!progressFlags.blacksmithFreed || progressFlags.blacksmithRescued) return;
    progressFlags.blacksmithRescued = true;
    progressFlags.blacksmithFreed = false;
    moveBlacksmithToTown();
    pushMessage({ text: "鍛冶屋は無事に街へ戻っていった。" });
    markOccupancyDirty();
    ensureOccupancy();
  }

  function moveBlacksmithToTown() {
    state.blacksmith.scene = SCENE.TOWN;
    state.blacksmith.pos = clonePos(BLACKSMITH_TOWN_POS);
  }

  function canTalkToBlacksmith() {
    return progressFlags.blacksmithFreed || progressFlags.blacksmithRescued;
  }

  function tryGivePowerHammer() {
    if (!progressFlags.blacksmithRescued || progressFlags.hasHammer) return;
    const result = forceAddStoryItem(ITEM.POWER_HAMMER);
    if (!result.success) {
      pushMessage({ text: "インベントリの空きが必要だ。" });
      return;
    }
    progressFlags.hasHammer = true;
    if (result.replaced) {
      pushMessage({ text: `${result.replaced}と交換でPower Hammerを受け取った。` });
    } else {
      pushMessage({ text: "Power Hammerを受け取った。" });
    }
  }

  function tryGiveAncientKey() {
    if (!progressFlags.hasOre || progressFlags.hasAncientKey) return;
    const result = forceAddStoryItem(ITEM.ANCIENT_KEY);
    if (!result.success) {
      pushMessage({ text: "インベントリの空きが必要だ。" });
      return;
    }
    progressFlags.hasAncientKey = true;
    pushMessage({ text: "古代の鍵を授かった！" });
    if (result.replaced) {
      pushMessage({ text: `${result.replaced}と交換で古代の鍵を受け取った。` });
    }
  }

  function tryForgeHolySword() {
    if (!progressFlags.hasOre || progressFlags.holySwordCreated) return;
    const player = state.player;
    if (!PlayerState.hasItem(player, ITEM.ANCIENT_SWORD)) {
      pushMessage({ text: "古代の剣を持っていない。" });
      return;
    }
    if (!PlayerState.hasItem(player, ITEM.HOLY_ORE)) {
      pushMessage({ text: "聖鉱石を持っていない。" });
      return;
    }
    PlayerState.removeItemById(player, ITEM.ANCIENT_SWORD);
    PlayerState.removeItemById(player, ITEM.HOLY_ORE);
    const result = forceAddStoryItem(ITEM.HOLY_SWORD);
    if (!result.success) {
      PlayerState.addItem(player, ITEM.ANCIENT_SWORD);
      PlayerState.addItem(player, ITEM.HOLY_ORE);
      pushMessage({ text: "インベントリの空きが必要だ。" });
      return;
    }
    progressFlags.hasOre = false;
    progressFlags.hasAncientSword = false;
    progressFlags.holySwordCreated = true;
    pushMessage({ text: "聖剣が完成した！" });
    if (result.replaced) {
      pushMessage({ text: `${result.replaced}と交換で聖剣を受け取った。` });
    }
  }

function tryGrantHolyShield() {
    if (!progressFlags.holySwordCreated || progressFlags.hasHolyShield) return;
    const result = forceAddStoryItem(ITEM.HOLY_SHIELD);
    if (!result.success) {
      pushMessage({ text: "インベントリの整理が必要だ。" });
      return;
    }
    progressFlags.hasHolyShield = true;
    if (result.replaced) {
      pushMessage({ text: `${result.replaced}と入れ替えて聖盾を授かった。` });
    } else {
      pushMessage({ text: "聖盾を授かった！" });
    }
  }

  function consumePowerHammer() {
    if (!progressFlags.hasHammer) return false;
    progressFlags.hasHammer = false;
    progressFlags.cave2Unlocked = true;
    PlayerState.removeItemById(state.player, ITEM.POWER_HAMMER);
    return true;
  }

  function forceAddStoryItem(itemId) {
    if (PlayerState.addItem(state.player, itemId)) {
      return { success: true };
    }
    const index = selectReplacementIndex();
    if (index === -1) {
      return { success: false };
    }
    const removedId = state.player.inventory[index];
    const removedName = PlayerState.getItemName(removedId);
    PlayerState.removeItemByIndex(state.player, index);
    PlayerState.addItem(state.player, itemId);
    return { success: true, replaced: removedName };
  }

  function selectReplacementIndex() {
    const player = state.player;
    if (!player || !player.inventory.length) return -1;
    const entries = player.inventory.map((itemId, index) => ({
      index,
      price: PlayerState.getItemPrice(itemId),
      equipped: PlayerState.isItemEquipped(player, index),
    }));
    let candidates = entries.filter((entry) => !entry.equipped);
    if (!candidates.length) {
      candidates = entries;
    }
    candidates.sort((a, b) => {
      if (a.price !== b.price) return a.price - b.price;
      return a.index - b.index;
    });
    return candidates.length ? candidates[0].index : -1;
  }

  function onEnemyDefeated(enemy) {
    if (!enemy) return;
    const isGuardian =
      enemy &&
      enemy.guardianKey != null &&
      enemy.scene === SCENE.CAVE_B2 &&
      enemy.kind === getEnemyKindValue("SKELETON");
    if (
      isGuardian ||
      (enemy.scene === SCENE.CAVE_B2 &&
        enemy.kind === getEnemyKindValue("SKELETON") &&
        BLACKSMITH_GUARD_POSITIONS.some((pos) => pos.x === enemy.pos.x && pos.y === enemy.pos.y))
    ) {
      handleBlacksmithGuardianDefeat(enemy);
    }
    if (
      enemy.scene === SCENE.RUINS_B2 &&
      enemy.kind === getEnemyKindValue("DARK_KNIGHT") &&
      enemy.guardianKey
    ) {
      if (!progressFlags.ancientGuardians) {
        progressFlags.ancientGuardians = new Set();
      }
      progressFlags.ancientGuardians.add(enemy.guardianKey);
    }
    if (enemy.kind === getEnemyKindValue("DRAGON")) {
      progressFlags.dragonDefeated = true;
      state.flags.dragonDefeated = true;
    }
  }

  function normalizeMessageEntry(message, meta = {}) {

    if (message && typeof message === "object") {

      return {

        text: message.text || "",

        icon: message.icon || meta.icon || null,

        tone: message.tone || meta.tone || null,

      };

    }

    return {

      text: message != null ? String(message) : "",

      icon: meta.icon || null,

      tone: meta.tone || null,

    };

  }



  function pushMessage(message, meta = {}) {

    const entry = normalizeMessageEntry(message, meta);

    if (Game.messageLog && typeof Game.messageLog.push === "function") {

      Game.messageLog.push(entry);

      return;

    }

    const stateRef = Game.state || state;
    if (!stateRef || !Array.isArray(stateRef.messages)) return;
    stateRef.messages.push(entry);
    while (stateRef.messages.length > MAX_MESSAGES) {
      stateRef.messages.shift();
    }
  }


  function setPlayerPosition(pos) {
     state.playerPos = { x: pos.x, y: pos.y };
     markOccupancyDirty();
   }

   function getCurrentMap() {
     return Game.mapData ? Game.mapData[state.scene] : null;
   }

  function ensureSceneEnemies(scene) {
    if (!Game.entities) return;
    if (scene === SCENE.FIELD && typeof Game.entities.ensureFieldEnemies === "function") {
      Game.entities.ensureFieldEnemies();
    }
    if (
      (scene === SCENE.CAVE || scene === SCENE.CAVE_B2) &&
      typeof Game.entities.ensureCaveEnemies === "function"
    ) {
      Game.entities.ensureCaveEnemies();
    }
    if (
      (scene === SCENE.CAVE2 || scene === SCENE.CAVE2_B2) &&
      typeof Game.entities.ensureCave2Enemies === "function"
    ) {
      Game.entities.ensureCave2Enemies(scene);
    }
    if (
      (scene === SCENE.RUINS || scene === SCENE.RUINS_B2) &&
      typeof Game.entities.ensureRuinsEnemies === "function"
    ) {
      Game.entities.ensureRuinsEnemies(scene);
    }
  }

  function switchScene(nextScene, spawnKey) {
    const prevScene = state.scene;
    const map = Game.mapData ? Game.mapData[nextScene] : null;
    if (!map) return;
    const spawn = (map.spawnPoints && map.spawnPoints[spawnKey]) || map.spawnPoints.default;
    setPlayerPosition(spawn);
    state.scene = nextScene;
    state.walkCounter = 0;
    pushMessage({ text: `${sceneLabels[nextScene]}へ移動した。` });
    ensureSceneEnemies(nextScene);
    markOccupancyDirty();
    ensureOccupancy();
    handleQuestProgressOnSceneChange(prevScene, nextScene);
  }

  function initializeGame() {
    resetGameState();
    Game.ui.open(Game.ui.OVERLAY.TITLE);
    if (Game.saveSystem && typeof Game.saveSystem.refreshAvailability === "function") {
      Game.saveSystem.refreshAvailability();
    }
  }

   function startGame() {
     resetGameState();
    Game.pushMessage({ text: "島へようこそ。探索を始めよう。" });
   }

  function resetGameState() {
    PlayerState.resetProgressFlags(progressFlags);
    state.scene = SCENE.FIELD;
    state.walkCounter = 0;
    state.enemyRespawnSteps = 0;
    state.enemyIdSeq = 0;
    state.enemies = [];
    state.player = PlayerState.createDefaultPlayer();
     state.flags.starvingNotified = false;
     state.flags.dragonDefeated = false;
     state.messages = [];
    resetBattleState();
    if (Game.ui && typeof Game.ui.resetAll === "function") {
      Game.ui.resetAll();
    }
     const firstMap = Game.mapData ? Game.mapData[SCENE.FIELD] : null;
     if (firstMap && firstMap.spawnPoints) {
       setPlayerPosition(firstMap.spawnPoints.default);
     } else {
       setPlayerPosition({ x: 0, y: 0 });
     }
     if (Game.entities && typeof Game.entities.spawnInitialEnemies === "function") {
       Game.entities.spawnInitialEnemies();
     } else {
       ensureSceneEnemies(state.scene);
     }
     syncWorldStateFromFlags();
     markOccupancyDirty();
     ensureOccupancy();
   }

  function resetForNewGame() {
    resetGameState();
    Game.ui.open(Game.ui.OVERLAY.TITLE);
    if (Game.saveSystem && typeof Game.saveSystem.refreshAvailability === "function") {
      Game.saveSystem.refreshAvailability();
    }
  }

   function resetBattleState() {
     battleState.active = false;
     battleState.enemy = null;
     battleState.turn = "PLAYER";
     battleState.playerDefending = false;
     battleState.returnScene = null;
     battleState.returnPos = null;
   }

  function isInsideGrid(pos) {
    return (
      pos.x >= 0 &&
      pos.y >= 0 &&
      pos.x < config.gridWidth &&
      pos.y < config.gridHeight
    );
  }

  function handleQuestProgressOnSceneChange(prevScene, nextScene) {
    if (
      prevScene === SCENE.TOWN &&
      nextScene !== SCENE.TOWN &&
      progressFlags.questTalked &&
      !progressFlags.questGiven
    ) {
      progressFlags.questGiven = true;
      pushMessage({ text: "王様の頼みを胸に街をあとにした。" });
    }
  }

   function resolveTileEvent(x, y) {
     ensureOccupancy();
     const occ = getOccupancy(x, y);
     if (!occ) return;
     if (occ.enemy && occ.enemyRef) {
       Game.combat.startBattle(occ.enemyRef);
       return;
     }
     if (occ.chest) {
       handleChestEvent(state.scene, x, y);
       return;
     }
     if (occ.warp && occ.warpData) {
       if (occ.warpData.event === "RUINS_KEY_DOOR") {
         handleRuinsKeyDoorEvent(occ.warpData);
         return;
       }
       if (occ.warpData.event === "CAVE2_ENTRANCE") {
         handleCave2EntranceEvent(occ.warpData);
         return;
       }
       if (occ.warpData.event === "RUINS_ENTRANCE") {
         handleRuinsEntranceEvent(occ.warpData);
         return;
       }
       switchScene(occ.warpData.targetScene, occ.warpData.targetSpawn);
       return;
     }
   }

  function handleChestEvent(scene, x, y) {
    if (PlayerState.hasOpenedChest(progressFlags, scene, x, y)) {
      pushMessage({ text: "宝箱は空だった。" });
      return;
    }
    PlayerState.markChestOpened(progressFlags, scene, x, y);
    const events = Game.EVENTS ? Game.EVENTS[scene] : null;
    const reward =
      events && Array.isArray(events.chests)
        ? events.chests.find((pos) => pos.x === x && pos.y === y)
        : null;
    if (reward && reward.item) {
      const result = forceAddStoryItem(reward.item);
      if (reward.item === ITEM.HOLY_ORE) {
        progressFlags.hasOre = true;
      }
      if (reward.item === ITEM.ANCIENT_SWORD) {
        progressFlags.hasAncientSword = true;
      }
      if (!result.success) {
        pushMessage({ text: "インベントリに空きが必要だ。" });
      } else if (result.replaced) {
        pushMessage({ text: `${PlayerState.getItemName(reward.item)}を手に入れた（${result.replaced}と入れ替え）。` });
      } else {
        pushMessage({ text: `${PlayerState.getItemName(reward.item)}を手に入れた。` });
      }
    } else {
      pushMessage({ text: "宝箱を開けた。" });
    }
    markOccupancyDirty();
    ensureOccupancy();
  }

  function handleRuinsEntranceEvent(warpData) {
    // 遺跡にはいつでも入れるが、聖剣・聖盾がないと竜を倒せない
    switchScene(warpData.targetScene, warpData.targetSpawn);
  }

  function handleRuinsKeyDoorEvent(warpData) {
    if (progressFlags.ancientDoorOpened) {
      // 扉が既に開いている場合は通過できる
      switchScene(warpData.targetScene, warpData.targetSpawn);
      return;
    }
    const hasKey =
      progressFlags.hasAncientKey || PlayerState.hasItem(state.player, ITEM.ANCIENT_KEY);
    if (!hasKey) {
      pushMessage({ text: "鍵がなければ開かない……Ancient Key を探そう。" });
      return;
    }
    if (!progressFlags.hasAncientKey && PlayerState.hasItem(state.player, ITEM.ANCIENT_KEY)) {
      progressFlags.hasAncientKey = true;
    }
    PlayerState.removeItemById(state.player, ITEM.ANCIENT_KEY);
    progressFlags.hasAncientKey = false;
    progressFlags.ancientDoorOpened = true;
    progressFlags.ruins3Unlocked = true;
    pushMessage({ text: "鍵を使って扉を開けた！" });
    // 扉を開けた後、プレイヤーを扉の位置に移動させる
    const doorX = warpData.x || 13;
    const doorY = warpData.y || 10;
    setPlayerPosition({ x: doorX, y: doorY });
    markOccupancyDirty();
    ensureOccupancy();
  }

  function handleCave2EntranceEvent(warpData) {
    if (progressFlags.cave2Unlocked) {
      switchScene(warpData.targetScene, warpData.targetSpawn);
      return;
    }
    if (Game.story && typeof Game.story.consumePowerHammer === "function") {
      const used = Game.story.consumePowerHammer();
      if (used) {
        pushMessage({ text: "力のハンマーで岩を破いた！" });
        switchScene(warpData.targetScene, warpData.targetSpawn);
        return;
      }
    }
    pushMessage({ text: "岩が塞いでいる。力のハンマーが必要だ。" });
  }

   function isInventoryFull() {
     return PlayerState.isInventoryFull(state.player);
   }

   function addItem(itemId) {
     return PlayerState.addItem(state.player, itemId);
   }

   function removeItemByIndex(index) {
     return PlayerState.removeItemByIndex(state.player, index);
   }

   function describeItem(itemId) {
     return PlayerState.describeItem(itemId);
   }

   function addFood(amount) {
     PlayerState.addFood(state.player, amount);
   }

   function canBuy(itemId) {
     return PlayerState.canBuy(state.player, itemId);
   }

   function buyItem(itemId) {
     return PlayerState.buyItem(state.player, itemId);
   }

   function isItemEquipped(index) {
     return PlayerState.isItemEquipped(state.player, index);
   }

   function sellItem(index) {
     return PlayerState.sellItem(state.player, index);
   }

   function useItemByIndex(index) {
     return PlayerState.useItemByIndex(state.player, index);
   }

   function getPlayerEffectiveStats() {
     return PlayerState.getEffectiveStats(state.player);
   }

   function grantExp(amount) {
     return PlayerState.grantExp(state.player, amount, pushMessage);
   }

   function resetPlayerToSafePoint() {
     const priest = state.priest;
     const gridHeight = Game.config ? Game.config.gridHeight : 18;
     const safeScene = priest ? priest.scene : SCENE.TOWN;
     const baseY = gridHeight > 0 ? gridHeight - 1 : 17;
     const safePos = priest
       ? { x: priest.pos.x, y: Math.min(priest.pos.y + 1, baseY) }
       : { x: 12, y: 12 };
     state.scene = safeScene;
     setPlayerPosition(safePos);
     state.player.hp = state.player.maxHp;
     state.player.gold = Math.max(0, Math.floor(state.player.gold / 2));
     state.player.food = Math.max(0, Math.floor(state.player.food / 2));
     state.walkCounter = 0;
     state.flags.starvingNotified = false;
    pushMessage({ text: "神父の祈りで蘇りました。しかし、Gold と Food が半分になってしまった…" });
     ensureSceneEnemies(state.scene);
     markOccupancyDirty();
     ensureOccupancy();
   }


   function nextEnemyInstanceId() {
     state.enemyIdSeq += 1;
     return `enemy-${state.enemyIdSeq}`;
   }

   Game.state = state;
   Game.flags = progressFlags;
   Game.pushMessage = pushMessage;
   Game.setPlayerPosition = setPlayerPosition;
   Game.getCurrentMap = getCurrentMap;
   Game.switchScene = switchScene;
   Game.initializeGame = initializeGame;
   Game.startGame = startGame;
   Game.addItem = addItem;
   Game.removeItemByIndex = removeItemByIndex;
   Game.describeItem = describeItem;
   Game.addFood = addFood;
   Game.canBuy = canBuy;
   Game.buyItem = buyItem;
   Game.sellItem = sellItem;
   Game.useItemByIndex = useItemByIndex;
   Game.getPlayerEffectiveStats = getPlayerEffectiveStats;
   Game.isItemEquipped = isItemEquipped;
   Game.grantExp = grantExp;
  Game.resetPlayerToSafePoint = resetPlayerToSafePoint;
  Game.resetForNewGame = resetForNewGame;
  Game.makePosKey = PlayerState.makePosKey;
  Game.hasOpened = (scene, x, y) => PlayerState.hasOpenedChest(progressFlags, scene, x, y);
  Game.markOpened = (scene, x, y) => PlayerState.markChestOpened(progressFlags, scene, x, y);
  Game.nextEnemyInstanceId = nextEnemyInstanceId;
  Game.battle = battleState;
  Game.story = {
    syncWorldStateFromFlags,
    ensureStoryEnemies,
    onEnemyDefeated,
    finalizeBlacksmithRescue,
    tryGivePowerHammer,
    tryGiveAncientKey,
    tryForgeHolySword,
    tryGrantHolyShield,
    canTalkToBlacksmith,
    consumePowerHammer,
  };
  if (Game.occupancy) {
    Game.occupancy.resolveTileEvent = resolveTileEvent;
  }
})();
