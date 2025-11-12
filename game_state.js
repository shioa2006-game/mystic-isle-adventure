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
   const EQUIP_BONUS = Game.EQUIP_BONUS;
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

   const ENEMY_DATA = Object.freeze({
    SLIME: {
      name: "スライム",
      hp: [8, 12],
      atk: [2, 3],
      def: [0, 0],
      exp: [3, 5],
      gold: [4, 8],
    },
    BAT: {
      name: "コウモリ",
      hp: [14, 18],
      atk: [3, 4],
      def: [0, 1],
      exp: [6, 8],
      gold: [8, 12],
    },
    SPIDER: {
      name: "クモ",
      hp: [20, 26],
      atk: [4, 6],
      def: [1, 2],
      exp: [9, 12],
      gold: [12, 16],
    },
    GHOST: {
      name: "ゴースト",
      hp: [28, 34],
      atk: [6, 7],
      def: [2, 3],
      exp: [12, 16],
      gold: [16, 20],
    },
    VAMPIRE: {
      name: "ヴァンパイア",
      hp: [36, 44],
      atk: [7, 9],
      def: [3, 4],
      exp: [18, 24],
      gold: [22, 28],
    },
    TROLL: {
      name: "トロル",
      hp: [48, 58],
      atk: [9, 11],
      def: [4, 5],
      exp: [24, 32],
      gold: [28, 36],
    },
    DRAGON: {
      name: "ドラゴン",
      hp: [60, 80],
      atk: [9, 11],
      def: [4, 5],
      exp: [30, 40],
      gold: [35, 50],
     },
   });

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
     flags: {
       starvingNotified: false,
       dragonDefeated: false,
     },
     battle: battleState,
   };


  function pushMessage(message, meta = {}) {
    if (Game.messageLog && typeof Game.messageLog.push === "function") {
      Game.messageLog.push(message, meta);
      return;
    }
    const fallback = {
      text: message != null ? String(message) : "",
      icon: null,
      tone: meta.tone || null,
    };
    state.messages.push(fallback);
    if (state.messages.length > MAX_MESSAGES) {
      state.messages.shift();
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
    pushMessage(`${sceneLabels[nextScene]}へ移動した。`);
    ensureSceneEnemies(nextScene);
    markOccupancyDirty();
    ensureOccupancy();
    handleQuestProgressOnSceneChange(prevScene, nextScene);
  }

   function initializeGame() {
     resetGameState();
     Game.ui.open(Game.ui.OVERLAY.TITLE);
   }

   function startGame() {
     resetGameState();
     Game.pushMessage("島へようこそ。探索を始めよう。");
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
      pushMessage("王様の頼みを胸に街をあとにした。");
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
       pushMessage("���łɊJ�����󔠂��B");
       return;
     }
     PlayerState.markChestOpened(progressFlags, scene, x, y);
     progressFlags.hasKey = true;
     pushMessage("�󔠂��J�����BAncient Key ����ɓ��ꂽ�B");
     markOccupancyDirty();
     ensureOccupancy();
   }

   function handleRuinsEvent(scene, x, y) {
     if (progressFlags.cleared) {
       pushMessage("扉はすでに開いている。");
       return;
     }
     if (!progressFlags.hasKey) {
       pushMessage("重い扉だ…鍵が必要だ。");
       return;
     }
     progressFlags.cleared = true;
     pushMessage("扉が開いた！");
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
     const map = Game.mapData ? Game.mapData[SCENE.FIELD] : null;
     if (map && map.spawnPoints && map.spawnPoints.default) {
       setPlayerPosition(map.spawnPoints.default);
     } else {
       setPlayerPosition({ x: 2, y: 2 });
     }
     state.scene = SCENE.FIELD;
     state.player.hp = state.player.maxHp;
     pushMessage("安全な場所で目を覚ました。");
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
  Game.ENEMY_DATA = ENEMY_DATA;
  Game.battle = battleState;
  if (Game.occupancy) {
    Game.occupancy.resolveTileEvent = resolveTileEvent;
  }
})();

