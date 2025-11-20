(function () {
  // 敵の出現と AI を担当
  const Game = (window.Game = window.Game || {});
  const types = Game.entityTypes || {};
  const rules = types.enemyRules || {};

  const {
    MIN_FIELD_ENEMIES = 3,
    MAX_FIELD_ENEMIES = 5,
    MIN_CAVE_ENEMIES = 2,
    MAX_CAVE_ENEMIES = 4,
    RESPAWN_STEP_THRESHOLD = 20,
    SAFE_DISTANCE_FROM_PLAYER = 4,
    ENEMY_CHASE_DISTANCE = 7,
  } = rules;

  const DRAGON_SCENE = Game.SCENE.FIELD;

  function spawnInitialEnemies() {
    Game.state.enemies = [];
    ensureFieldEnemies();
    ensureCaveEnemies(Game.SCENE.CAVE);
    ensureCaveEnemies(Game.SCENE.CAVE_B2);
    spawnDragonIfNeeded();
  }

  function ensureFieldEnemies() {
    ensureSceneEnemies(Game.SCENE.FIELD, MIN_FIELD_ENEMIES, MAX_FIELD_ENEMIES);
  }

  function ensureCaveEnemies(scene) {
    ensureSceneEnemies(scene, MIN_CAVE_ENEMIES, MAX_CAVE_ENEMIES);
  }

  function ensureSceneEnemies(scene, minCount, maxCount) {
    const current = Game.state.enemies.filter((enemy) => enemy.scene === scene);
    if (current.length >= minCount) return;
    const needed = Math.max(0, minCount - current.length);
    for (let i = 0; i < needed; i += 1) {
      if (scene === Game.SCENE.FIELD) {
        spawnFieldEnemy();
      } else {
        spawnCaveEnemy(scene);
      }
    }
    const capped = Game.state.enemies.filter((enemy) => enemy.scene === scene);
    if (capped.length > maxCount) {
      Game.state.enemies = Game.state.enemies.filter(
        (enemy) => !(enemy.scene === scene && !enemy.persistent)
      );
    }
  }

  function spawnFieldEnemy() {
    const map = Game.mapData[Game.SCENE.FIELD];
    if (!map) return;
    const pos = findSpawnLocation(Game.SCENE.FIELD, map, SAFE_DISTANCE_FROM_PLAYER);
    if (!pos) return;
    const enemy = createEnemyInstance(randomFieldEnemyKind(), Game.SCENE.FIELD, pos);
    Game.state.enemies.push(enemy);
  }

  function spawnCaveEnemy(scene) {
    const map = Game.mapData[scene];
    if (!map) return;
    const pos = findSpawnLocation(scene, map, 0);
    if (!pos) return;
    const kind = randomCaveEnemyKind();
    const enemy = createEnemyInstance(kind, scene, pos);
    Game.state.enemies.push(enemy);
  }

  function onPlayerStep() {
    if (Game.combat.isActive()) return;
    spawnDragonIfNeeded();
    const scene = Game.state.scene;
    const onField = scene === Game.SCENE.FIELD;
    const onCaveFloor = isCaveScene(scene);
    if (!onField && !onCaveFloor) {
      Game.state.enemyRespawnSteps = 0;
      return;
    }
    Game.state.enemyRespawnSteps += 1;
    if (Game.state.enemyRespawnSteps >= RESPAWN_STEP_THRESHOLD) {
      if (onField && countFieldNonDragon() < MAX_FIELD_ENEMIES) {
        spawnFieldEnemy();
      }
      if (onCaveFloor && countEnemiesForScene(scene) < MAX_CAVE_ENEMIES) {
        spawnCaveEnemy(scene);
      }
      Game.state.enemyRespawnSteps = 0;
    }
    moveEnemiesTowardPlayer();
  }

  function removeEnemyById(enemyId) {
    const idx = Game.state.enemies.findIndex((enemy) => enemy.id === enemyId);
    if (idx < 0) return;
    const [removed] = Game.state.enemies.splice(idx, 1);
    if (removed && removed.kind === types.ENEMY_KIND.DRAGON) {
      Game.state.flags.dragonDefeated = true;
    }
    if (Game.story && typeof Game.story.onEnemyDefeated === "function") {
      Game.story.onEnemyDefeated(removed);
    }
    Game.state.enemyRespawnSteps = 0;
    Game.occupancy.markDirty();
    spawnDragonIfNeeded();
  }

  function moveEnemiesTowardPlayer() {
    const scene = Game.state.scene;
    if (scene !== Game.SCENE.FIELD && !isCaveScene(scene)) return;
    if (Game.combat.isActive()) return;
    const playerPos = Game.state.playerPos;
    const enemies = Game.state.enemies.filter(
      (enemy) => enemy.scene === scene && enemy.kind !== types.ENEMY_KIND.DRAGON
    );
    if (!enemies.length) return;

    Game.occupancy.ensure();

    const reserved = new Set();
    const reserveKey = (pos) => `${pos.x},${pos.y}`;

    enemies.forEach((enemy) => {
      const dist = Game.utils.distance(enemy.pos, playerPos);
      if (dist >= ENEMY_CHASE_DISTANCE) return;
      const path = Game.utils.findPath(enemy.pos, playerPos, {
        scene,
        allowGoalOccupied: true,
        canEnter(x, y) {
          if (x === enemy.pos.x && y === enemy.pos.y) return true;
          const key = `${x},${y}`;
          if (reserved.has(key)) return false;
          return Game.occupancy.isFreeForEnemy(x, y, scene);
        },
      });
      if (!path || path.length < 2) return;
      const nextStep = path[1];
      if (nextStep.x === enemy.pos.x && nextStep.y === enemy.pos.y) return;
      enemy.pos.x = nextStep.x;
      enemy.pos.y = nextStep.y;
      reserved.add(reserveKey(enemy.pos));
      if (enemy.pos.x === playerPos.x && enemy.pos.y === playerPos.y) {
        Game.combat.startBattle(enemy);
      }
    });
  }

  function spawnDragonIfNeeded() {
    if (Game.state.flags && Game.state.flags.dragonDefeated) return;
    const pos = getDragonGuardPosition();
    if (!pos) return;
    const exists = Game.state.enemies.some(
      (enemy) => enemy.scene === DRAGON_SCENE && enemy.kind === types.ENEMY_KIND.DRAGON
    );
    if (exists) return;
    const dragon = createEnemyInstance(types.ENEMY_KIND.DRAGON, DRAGON_SCENE, pos);
    dragon.persistent = true;
    Game.state.enemies.push(dragon);
  }

  function createEnemyInstance(kind, scene, pos) {
    const enemyId = Game.nextEnemyInstanceId ? Game.nextEnemyInstanceId() : `enemy-${Date.now()}`;
    const enemyData = Game.ENEMY_DATA[kind];
    const randRange = (range) =>
      Array.isArray(range) && range.length === 2
        ? Game.utils.randInt(range[0], range[1])
        : Number(range) || 0;
    const enemy = {
      id: enemyId,
      kind,
      name: enemyData ? enemyData.name : kind,
      hp: enemyData ? randRange(enemyData.hp) : 10,
      maxHp: enemyData ? randRange(enemyData.hp) : 10,
      atk: enemyData ? randRange(enemyData.atk) : 2,
      def: enemyData ? randRange(enemyData.def) : 1,
      exp: enemyData ? randRange(enemyData.exp) : 5,
      gold: enemyData ? randRange(enemyData.gold) : 5,
      scene,
      pos: { ...pos },
      persistent: false,
    };
    enemy.maxHp = enemy.hp;
    return enemy;
  }

  function spawnFixedEnemy(kind, scene, pos, overrides = {}) {
    const enemy = createEnemyInstance(kind, scene, pos);
    Game.state.enemies.push(Object.assign(enemy, overrides));
    Game.occupancy.markDirty();
    return enemy;
  }

  function findSpawnLocation(scene, map, minDistance) {
    const maxAttempts = 200;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const x = Game.utils.randInt(0, Game.config.gridWidth - 1);
      const y = Game.utils.randInt(0, Game.config.gridHeight - 1);
      const tileId = map.tiles[y][x];
      if (Game.utils.isBlocked(tileId)) continue;
      if (Game.RESERVED_TILES.has(tileId)) continue;
      if (!isSpawnFree(x, y, scene)) continue;
      if (minDistance > 0) {
        const dist = Game.utils.distance({ x, y }, Game.state.playerPos);
        if (dist < minDistance) continue;
      }
      return { x, y };
    }
    return null;
  }

  function isSpawnFree(x, y, scene) {
    if (Game.entities && typeof Game.entities.isOccupiedByEntity === "function") {
      return !Game.entities.isOccupiedByEntity(x, y, scene);
    }
    return true;
  }

  function getDragonGuardPosition() {
    if (!Game.EVENTS) return null;
    const events = Game.EVENTS[DRAGON_SCENE];
    if (!events || !events.ruins) return null;
    return {
      x: events.ruins.x,
      y: Math.min(Game.config.gridHeight - 1, events.ruins.y + 1),
    };
  }

  function randomFieldEnemyKind() {
    const pool = [
      types.ENEMY_KIND.SLIME,
      types.ENEMY_KIND.BAT,
      types.ENEMY_KIND.SPIDER,
    ];
    return pool[Game.utils.randInt(0, pool.length - 1)];
  }

  function randomCaveEnemyKind() {
    const pool = [
      types.ENEMY_KIND.GHOST,
      types.ENEMY_KIND.VAMPIRE,
      types.ENEMY_KIND.TROLL,
    ];
    return pool[Game.utils.randInt(0, pool.length - 1)];
  }

  function countFieldNonDragon() {
    return Game.state.enemies.filter(
      (enemy) => enemy.scene === Game.SCENE.FIELD && enemy.kind !== types.ENEMY_KIND.DRAGON
    ).length;
  }

  function countEnemiesForScene(scene) {
    return Game.state.enemies.filter((enemy) => enemy.scene === scene).length;
  }

  function isCaveScene(scene) {
    return scene === Game.SCENE.CAVE || scene === Game.SCENE.CAVE_B2;
  }

  Game.enemyDirector = {
    spawnInitialEnemies,
    ensureFieldEnemies,
    ensureCaveEnemies,
    onPlayerStep,
    removeEnemyById,
    moveEnemiesTowardPlayer,
    spawnDragonIfNeeded,
    spawnFixedEnemy,
  };
})();
