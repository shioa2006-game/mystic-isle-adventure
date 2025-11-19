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
     throw new Error("Game.playerState ������`�ł��Bstate/player_state.js �̓ǂݍ��ݏ������m�F���Ă��������B");
   }
   if (!Game.occupancy) {
     throw new Error("Game.occupancy ������`�ł��Bstate/occupancy.js �̓ǂݍ��ݏ������m�F���Ă��������B");
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
     flags: {
       starvingNotified: false,
       dragonDefeated: false,
     },
     battle: battleState,
   };


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
     markOccupancyDirty();
     if (Game.entities && typeof Game.entities.spawnInitialEnemies === "function") {
       Game.entities.spawnInitialEnemies();
     } else {
       ensureSceneEnemies(state.scene);
     }
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
     if (occ.warp && occ.warpData) {
       switchScene(occ.warpData.targetScene, occ.warpData.targetSpawn);
       return;
     }
     if (occ.chest) {
       handleChestEvent(state.scene, x, y);
       return;
     }
     if (occ.ruins) {
       handleRuinsEvent(state.scene, x, y);
     }
   }

   function handleChestEvent(scene, x, y) {
     if (PlayerState.hasOpenedChest(progressFlags, scene, x, y)) {
       pushMessage({ text: "宝箱はすでに開いている。" });
       return;
     }
     PlayerState.markChestOpened(progressFlags, scene, x, y);
     progressFlags.hasKey = true;
     pushMessage({ text: "宝箱を開けた！ Ancient Key を手に入れた。" });
     markOccupancyDirty();
     ensureOccupancy();
   }

   function handleRuinsEvent(scene, x, y) {
     if (progressFlags.cleared) {
      pushMessage({ text: "扉はすでに開いている。" });
       return;
     }
     if (!progressFlags.hasKey) {
      pushMessage({ text: "重い扉だ…鍵が必要だ。" });
       return;
     }
     progressFlags.cleared = true;
    pushMessage({ text: "扉が開いた！" });
    if (Game.ui && typeof Game.ui.close === "function") {
      Game.ui.close();
    }
     resetBattleState();
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
  if (Game.occupancy) {
    Game.occupancy.resolveTileEvent = resolveTileEvent;
  }
})();
