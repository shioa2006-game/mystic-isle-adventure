(function () {
  // マップ上の占有情報と移動制限を管理
  const Game = (window.Game = window.Game || {});

  if (!Game.config) {
    throw new Error("Game.config が未定義です。config.js を先に読み込んでください。");
  }

  const occupancyMap = new Map();
  const enemyRestricted = new Set();
  let occupancyDirty = true;

  function keyOf(x, y) {
    return `${x},${y}`;
  }

  function clearOccupancy() {
    occupancyMap.clear();
    enemyRestricted.clear();
  }

  function occupyCell(x, y, meta = {}) {
    const config = Game.config;
    if (x < 0 || y < 0 || x >= config.gridWidth || y >= config.gridHeight) return;
    const key = keyOf(x, y);
    const existing = occupancyMap.get(key) || { layer: Game.LAYER ? Game.LAYER.FLOOR : 0 };
    if (!occupancyMap.has(key)) {
      occupancyMap.set(key, existing);
    }
    if (meta.layer != null && Game.LAYER && meta.layer >= existing.layer) {
      existing.layer = meta.layer;
    }
    existing.reserved = existing.reserved || !!meta.reserved;
    existing.warp = existing.warp || !!meta.warp;
    if (meta.warpData) existing.warpData = meta.warpData;
    existing.npc = existing.npc || !!meta.npc;
    existing.enemy = existing.enemy || !!meta.enemy;
    existing.chest = existing.chest || !!meta.chest;
    existing.ruins = existing.ruins || !!meta.ruins;
    if (meta.enemyRef) existing.enemyRef = meta.enemyRef;
    existing.player = existing.player || !!meta.player;
    existing.tileId = meta.tileId || existing.tileId;
  }

  function markEnemyRestrictedArea(x, y, radius = Game.NO_ENEMY_RADIUS || 1) {
    const config = Game.config;
    for (let dy = -radius; dy <= radius; dy += 1) {
      for (let dx = -radius; dx <= radius; dx += 1) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= config.gridWidth || ny >= config.gridHeight) continue;
        enemyRestricted.add(keyOf(nx, ny));
      }
    }
  }

  function getOccupancy(x, y) {
    return occupancyMap.get(keyOf(x, y)) || null;
  }

  function rebuildOccupancy() {
    clearOccupancy();
    const state = Game.state;
    if (!state) {
      occupancyDirty = false;
      return;
    }
    const config = Game.config;
    const RESERVED_TILES = Game.RESERVED_TILES || new Set();
    const hasOpened = Game.playerState && typeof Game.playerState.hasOpenedChest === "function"
      ? (scene, x, y) => Game.playerState.hasOpenedChest(Game.flags, scene, x, y)
      : () => false;

    const map =
      (typeof Game.getCurrentMap === "function" && Game.getCurrentMap()) ||
      (Game.mapData ? Game.mapData[state.scene] : null);

    if (map) {
      for (let y = 0; y < config.gridHeight; y += 1) {
        for (let x = 0; x < config.gridWidth; x += 1) {
          const tileId = map.tiles[y][x];
          const reserved = RESERVED_TILES.has(tileId);
          occupyCell(x, y, { layer: Game.LAYER.FLOOR, tileId, reserved });
          if (reserved) {
            markEnemyRestrictedArea(x, y);
          }
        }
      }

      const entrances = map.entrances || [];
      entrances.forEach((entry) => {
        occupyCell(entry.position.x, entry.position.y, {
          layer: Game.LAYER.STATIC,
          reserved: true,
          warp: true,
          warpData: entry,
        });
        markEnemyRestrictedArea(entry.position.x, entry.position.y);
      });

      if (map.reservedTiles) {
        map.reservedTiles.forEach((pos) => {
          occupyCell(pos.x, pos.y, { layer: Game.LAYER.STATIC, reserved: true });
          markEnemyRestrictedArea(pos.x, pos.y);
        });
      }

      const events = Game.EVENTS ? Game.EVENTS[state.scene] : null;
      if (events) {
        if (Array.isArray(events.chests)) {
          events.chests.forEach((pos) => {
            if (hasOpened(state.scene, pos.x, pos.y)) return;
            occupyCell(pos.x, pos.y, {
              layer: Game.LAYER.STATIC,
              reserved: true,
              chest: true,
            });
            markEnemyRestrictedArea(pos.x, pos.y);
          });
        }
        if (events.ruins) {
          const pos = events.ruins;
          occupyCell(pos.x, pos.y, {
            layer: Game.LAYER.STATIC,
            reserved: true,
            ruins: true,
            warp: true,
          });
          markEnemyRestrictedArea(pos.x, pos.y);
        }
      }
    }

    if (state.merchant.scene === state.scene) {
      occupyCell(state.merchant.pos.x, state.merchant.pos.y, {
        layer: Game.LAYER.NPC,
        npc: true,
      });
    }

    if (state.innkeeper.scene === state.scene) {
      occupyCell(state.innkeeper.pos.x, state.innkeeper.pos.y, {
        layer: Game.LAYER.NPC,
        npc: true,
      });
    }

    if (state.king && state.king.scene === state.scene) {
      occupyCell(state.king.pos.x, state.king.pos.y, {
        layer: Game.LAYER.NPC,
        npc: true,
      });
    }
    if (state.priest && state.priest.scene === state.scene) {
      occupyCell(state.priest.pos.x, state.priest.pos.y, {
        layer: Game.LAYER.NPC,
        npc: true,
      });
    }

    state.enemies
      .filter((enemy) => enemy.scene === state.scene)
      .forEach((enemy) => {
        occupyCell(enemy.pos.x, enemy.pos.y, {
          layer: Game.LAYER.ENEMY,
          enemy: true,
          enemyRef: enemy,
        });
      });

    occupyCell(state.playerPos.x, state.playerPos.y, {
      layer: Game.LAYER.PLAYER,
      player: true,
    });

    occupancyDirty = false;
  }

  function ensureOccupancy() {
    if (occupancyDirty) {
      rebuildOccupancy();
    }
  }

  function markOccupancyDirty() {
    occupancyDirty = true;
  }

  function isFreeForPlayer(x, y) {
    const config = Game.config;
    const state = Game.state;
    if (!state) return { ok: false };
    ensureOccupancy();
    if (x < 0 || y < 0 || x >= config.gridWidth || y >= config.gridHeight) {
      return { ok: false };
    }
    const map = typeof Game.getCurrentMap === "function" ? Game.getCurrentMap() : null;
    if (!map) {
      return { ok: false };
    }
    const tileId = map.tiles[y][x];
    if (Game.utils && typeof Game.utils.isBlocked === "function" && Game.utils.isBlocked(tileId)) {
      return { ok: false };
    }
    const occ = getOccupancy(x, y);
    if (occ) {
      if (occ.npc) {
        return { ok: false, npc: true };
      }
      if (occ.enemy) {
        return { ok: false, enemy: true, enemyRef: occ.enemyRef };
      }
      if (occ.chest || occ.ruins) {
        return {
          ok: true,
          chest: occ.chest,
          ruins: occ.ruins,
          warp: occ.warp,
          warpData: occ.warpData,
        };
      }
      if (occ.reserved && !occ.warp) {
        return {
          ok: false,
          reserved: occ.reserved,
          warp: occ.warp,
          warpData: occ.warpData,
        };
      }
      if (occ.player) {
        return {
          ok: false,
          player: true,
        };
      }
      return {
        ok: true,
        warp: occ.warp,
        warpData: occ.warpData,
      };
    }
    return { ok: true };
  }

  function isFreeForEnemy(x, y, scene) {
    const config = Game.config;
    const state = Game.state;
    if (!state) return false;
    const targetScene = scene || state.scene;
    if (x < 0 || y < 0 || x >= config.gridWidth || y >= config.gridHeight) {
      return false;
    }
    if (enemyRestricted.has(keyOf(x, y))) return false;
    const map = Game.mapData ? Game.mapData[targetScene] : null;
    if (!map) return false;
    const tileId = map.tiles[y][x];
    if (Game.utils && typeof Game.utils.isBlocked === "function" && Game.utils.isBlocked(tileId)) return false;
    if (Game.RESERVED_TILES && Game.RESERVED_TILES.has(tileId)) return false;
    const hasEnemy = state.enemies.some(
      (enemy) => enemy.scene === targetScene && enemy.pos.x === x && enemy.pos.y === y
    );
    if (hasEnemy) return false;
    if (targetScene === state.scene) {
      ensureOccupancy();
      const occ = getOccupancy(x, y);
      if (occ && (occ.npc || occ.player || occ.enemy || occ.reserved)) {
        return false;
      }
    }
    if (state.merchant.scene === targetScene && state.merchant.pos.x === x && state.merchant.pos.y === y) {
      return false;
    }
    if (state.innkeeper.scene === targetScene && state.innkeeper.pos.x === x && state.innkeeper.pos.y === y) {
      return false;
    }
    if (state.king && state.king.scene === targetScene && state.king.pos.x === x && state.king.pos.y === y) {
      return false;
    }
    if (state.priest && state.priest.scene === targetScene && state.priest.pos.x === x && state.priest.pos.y === y) {
      return false;
    }
    if (targetScene === state.scene && state.playerPos.x === x && state.playerPos.y === y) {
      return false;
    }
    return true;
  }

  Game.occupancy = {
    clear: clearOccupancy,
    occupy: occupyCell,
    rebuild: rebuildOccupancy,
    ensure: ensureOccupancy,
    markDirty: markOccupancyDirty,
    get: getOccupancy,
    markEnemyRestrictedArea,
    isFreeForPlayer,
    isFreeForEnemy,
  };
})();
