(function () {
  // エンティティ種別とスプライト情報
  const Game = (window.Game = window.Game || {});

  const ACTOR_KIND = Object.freeze({
    PLAYER: "PLAYER",
    MERCHANT: "MERCHANT",
    INNKEEPER: "INNKEEPER",
    KING: "KING",
    PRIEST: "PRIEST",
    BLACKSMITH: "BLACKSMITH",
  });

  const ENEMY_KIND = Object.freeze({
    SLIME: "SLIME",
    BAT: "BAT",
    SPIDER: "SPIDER",
    GHOST: "GHOST",
    VAMPIRE: "VAMPIRE",
    TROLL: "TROLL",
    DRAGON: "DRAGON",
    WOLF: "WOLF",
    SKELETON: "SKELETON",
    LIZARDMAN: "LIZARDMAN",
    GOLEM: "GOLEM",
    DARK_KNIGHT: "DARK_KNIGHT",
    REAPER: "REAPER",
  });

  const OBJECT_KIND = Object.freeze({
    CHEST: "CHEST",
  });

  const spriteSettings = Object.freeze({
    actor: {
      size: 48,
      index: Object.freeze({
        [ACTOR_KIND.PLAYER]: 0,
        [ACTOR_KIND.MERCHANT]: 1,
        [ACTOR_KIND.INNKEEPER]: 2,
        [ACTOR_KIND.KING]: 3,
        [ACTOR_KIND.PRIEST]: 4,
        [ACTOR_KIND.BLACKSMITH]: 5,
      }),
    },
    enemy: {
      size: 48,
      index: Object.freeze({
        [ENEMY_KIND.SLIME]: { x: 0, y: 0 },
        [ENEMY_KIND.BAT]: { x: 1, y: 0 },
        [ENEMY_KIND.SPIDER]: { x: 2, y: 0 },
        [ENEMY_KIND.GHOST]: { x: 3, y: 0 },
        [ENEMY_KIND.VAMPIRE]: { x: 4, y: 0 },
        [ENEMY_KIND.TROLL]: { x: 5, y: 0 },
        [ENEMY_KIND.DRAGON]: { x: 6, y: 0 },
        [ENEMY_KIND.WOLF]: { x: 7, y: 0 },
        [ENEMY_KIND.SKELETON]: { x: 0, y: 1 },
        [ENEMY_KIND.LIZARDMAN]: { x: 1, y: 1 },
        [ENEMY_KIND.GOLEM]: { x: 2, y: 1 },
        [ENEMY_KIND.DARK_KNIGHT]: { x: 3, y: 1 },
        [ENEMY_KIND.REAPER]: { x: 4, y: 1 },
      }),
    },
    object: {
      size: 48,
      index: Object.freeze({
        [OBJECT_KIND.CHEST]: 0,
      }),
    },
  });

  const enemyRules = Object.freeze({
    MIN_FIELD_ENEMIES: 4,
    MAX_FIELD_ENEMIES: 6,
    MIN_CAVE_ENEMIES: 2,
    MAX_CAVE_ENEMIES: 4,
    MIN_CAVE2_ENEMIES: 2,
    MAX_CAVE2_ENEMIES: 4,
    MIN_RUINS_ENEMIES: 2,
    MAX_RUINS_ENEMIES: 4,
    RESPAWN_STEP_THRESHOLD: 15,
    SAFE_DISTANCE_FROM_PLAYER: 4,
    ENEMY_CHASE_DISTANCE: 7,
  });

  Game.entityTypes = {
    ACTOR_KIND,
    ENEMY_KIND,
    OBJECT_KIND,
    spriteSettings,
    enemyRules,
  };
})();
