(function () {
  // エンティティ種別とスプライト情報
  const Game = (window.Game = window.Game || {});

  const ACTOR_KIND = Object.freeze({
    PLAYER: "PLAYER",
    MERCHANT: "MERCHANT",
    INNKEEPER: "INNKEEPER",
    KING: "KING",
  });

  const ENEMY_KIND = Object.freeze({
    SLIME: "SLIME",
    BAT: "BAT",
    SPIDER: "SPIDER",
    GHOST: "GHOST",
    VAMPIRE: "VAMPIRE",
    TROLL: "TROLL",
    DRAGON: "DRAGON",
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
      }),
    },
    enemy: {
      size: 48,
      index: Object.freeze({
        [ENEMY_KIND.SLIME]: 0,
        [ENEMY_KIND.BAT]: 1,
        [ENEMY_KIND.SPIDER]: 2,
        [ENEMY_KIND.GHOST]: 3,
        [ENEMY_KIND.VAMPIRE]: 4,
        [ENEMY_KIND.TROLL]: 5,
        [ENEMY_KIND.DRAGON]: 6,
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
    MIN_FIELD_ENEMIES: 3,
    MAX_FIELD_ENEMIES: 5,
    MIN_CAVE_ENEMIES: 2,
    MAX_CAVE_ENEMIES: 4,
    RESPAWN_STEP_THRESHOLD: 20,
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
