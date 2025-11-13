(function () {
  // 矢印キー操作とプレイヤー移動・空腹管理を担当
  const Game = (window.Game = window.Game || {});

  if (!Game.SCENE || !Game.occupancy) {
    throw new Error("MovementController の初期化順序が不正です。");
  }

  const hungerScenes = new Set([Game.SCENE.FIELD, Game.SCENE.CAVE, Game.SCENE.CAVE_B2]);

  const keyState = {
    pressed: {},
    lastPressed: null,
    moveTimer: 0,
    moveInterval: 8,
  };

  function handleArrowPress(keyCode) {
    if (!isArrowKey(keyCode)) return false;
    keyState.pressed[keyCode] = true;
    keyState.lastPressed = keyCode;
    const delta = arrowToDelta(keyCode);
    tryMove(delta.x, delta.y);
    keyState.moveTimer = 0;
    return true;
  }

  function handleKeyRelease(keyCode) {
    if (!isArrowKey(keyCode)) return;
    delete keyState.pressed[keyCode];
    if (keyState.lastPressed === keyCode) {
      const arrowKeys = [window.LEFT_ARROW, window.RIGHT_ARROW, window.UP_ARROW, window.DOWN_ARROW];
      const stillPressed = arrowKeys.find((key) => keyState.pressed[key]);
      keyState.lastPressed = stillPressed || null;
      keyState.moveTimer = 0;
    }
  }

  function update() {
    if (!keyState.lastPressed) return;
    if (Game.combat.isActive()) return;
    if (Game.ui.state.overlay) return;
    keyState.moveTimer += 1;
    if (keyState.moveTimer >= keyState.moveInterval) {
      const delta = arrowToDelta(keyState.lastPressed);
      tryMove(delta.x, delta.y);
      keyState.moveTimer = 0;
    }
  }

  function tryMove(dx, dy) {
    if (!dx && !dy) return;
    const state = Game.state;
    const next = { x: state.playerPos.x + dx, y: state.playerPos.y + dy };
    if (!isInsideGrid(next)) {
        Game.pushMessage({ text: "これ以上進めない。" });
      return;
    }
    Game.occupancy.ensure();
    const moveCheck = Game.occupancy.isFreeForPlayer(next.x, next.y);
    if (!moveCheck.ok) {
      if (moveCheck.enemy && moveCheck.enemyRef) {
        Game.combat.startBattle(moveCheck.enemyRef);
      } else if (moveCheck.warp && moveCheck.warpData) {
        Game.occupancy.resolveTileEvent(next.x, next.y);
      } else {
        Game.pushMessage({ text: "そこには進めない。" });
      }
      return;
    }

    Game.setPlayerPosition(next);
    handleFoodCost();
    Game.entities.onPlayerStep();
    Game.occupancy.markDirty();
    Game.occupancy.ensure();
    Game.occupancy.resolveTileEvent(next.x, next.y);
    if (Game.dialogue && typeof Game.dialogue.clearCooldown === "function") {
      Game.dialogue.clearCooldown();
    }
  }

  function handleFoodCost() {
    const state = Game.state;
    if (!hungerScenes.has(state.scene)) {
      state.walkCounter = 0;
      return;
    }
    if (state.player.food > 0) {
      state.flags.starvingNotified = false;
    }
    const starvingBefore = state.player.food === 0;
    state.walkCounter += 1;
    if (state.player.food > 0 && state.walkCounter % 2 === 0) {
      state.player.food = Math.max(0, state.player.food - 1);
      if (state.player.food === 0) {
        Game.pushMessage({ text: "Food が尽きた。" });
      }
    }
    if (state.player.food === 0) {
      if (starvingBefore) {
        state.player.hp = Math.max(0, state.player.hp - 1);
        Game.pushMessage({ text: "飢えで HP が減った。" });
        if (state.player.hp === 0) {
          Game.pushMessage({ text: "力尽きてしまった…" });
          Game.resetPlayerToSafePoint();
        }
      } else if (!state.flags.starvingNotified) {
        Game.pushMessage({ text: "急いで補給しよう。" });
        state.flags.starvingNotified = true;
      }
    }
  }

  function isInsideGrid(pos) {
    return (
      pos.x >= 0 &&
      pos.y >= 0 &&
      pos.x < Game.config.gridWidth &&
      pos.y < Game.config.gridHeight
    );
  }

  function isArrowKey(keyCode) {
    return (
      keyCode === window.LEFT_ARROW ||
      keyCode === window.RIGHT_ARROW ||
      keyCode === window.UP_ARROW ||
      keyCode === window.DOWN_ARROW
    );
  }

  function arrowToDelta(keyCode) {
    switch (keyCode) {
      case window.LEFT_ARROW:
        return { x: -1, y: 0 };
      case window.RIGHT_ARROW:
        return { x: 1, y: 0 };
      case window.UP_ARROW:
        return { x: 0, y: -1 };
      case window.DOWN_ARROW:
        return { x: 0, y: 1 };
      default:
        return { x: 0, y: 0 };
    }
  }

  Game.controllers = Game.controllers || {};
  Game.controllers.movement = {
    handleArrowPress,
    handleKeyRelease,
    update,
  };
})();
