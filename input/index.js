(function () {
  // 全体の入力フローを統括し、各モジュールへ分配
  const Game = (window.Game = window.Game || {});

  if (!Game.controllers || !Game.controllers.movement || !Game.controllers.overlay || !Game.controllers.battle) {
    throw new Error("入力コントローラの初期化順序が不正です。");
  }

  const movement = Game.controllers.movement;
  const overlay = Game.controllers.overlay;
  const battle = Game.controllers.battle;

  function handleKeyPressed(keyValue, keyCode) {
    Game.occupancy.ensure();
    if (Game.combat.isActive()) {
      battle.handleInput(keyValue, keyCode);
      return;
    }

    const overlayType = Game.ui.state.overlay;
    if (overlayType) {
      overlay.handleInput(overlayType, keyValue, keyCode);
      return;
    }

    if (movement.handleArrowPress(keyCode)) {
      return;
    }

    const upper = (keyValue || "").toUpperCase();
    switch (upper) {
      case "T":
        handleTalk();
        return;
      case "I":
        overlay.toggleInventory();
        return;
      case "S":
        overlay.toggleStatus();
        return;
      case "U":
        Game.pushMessage({ text: "所持品を開いてから使用しよう。" });
        return;
      default:
        break;
    }

    if (keyCode === window.ESCAPE) {
      Game.pushMessage({ text: "閉じる対象がない。" });
    }
  }

  function handleKeyReleased(keyCode) {
    movement.handleKeyRelease(keyCode);
  }

  function update() {
    movement.update();
  }

  function handleTalk() {
    const pos = Game.state.playerPos;
    if (!isAdjacentToNpc(pos)) {
      Game.pushMessage({ text: "そばに話しかけられる相手がいない。" });
      return;
    }
    if (
      Game.utils.isAdjacent(pos, Game.state.merchant.pos) &&
      Game.state.scene === Game.state.merchant.scene
    ) {
      Game.shop.tryOpen();
      return;
    }
    if (
      Game.utils.isAdjacent(pos, Game.state.innkeeper.pos) &&
      Game.state.scene === Game.state.innkeeper.scene
    ) {
      Game.inn.tryOpen();
      return;
    }
    if (
      Game.state.king &&
      Game.utils.isAdjacent(pos, Game.state.king.pos) &&
      Game.state.scene === Game.state.king.scene &&
      Game.dialogue &&
      typeof Game.dialogue.talk === "function"
    ) {
      Game.dialogue.talk("king");
      return;
    }
    if (
      Game.state.priest &&
      Game.utils.isAdjacent(pos, Game.state.priest.pos) &&
      Game.state.scene === Game.state.priest.scene &&
      Game.dialogue &&
      typeof Game.dialogue.talk === "function"
    ) {
      Game.dialogue.talk("priest");
      return;
    }
    if (
      Game.state.blacksmith &&
      Game.utils.isAdjacent(pos, Game.state.blacksmith.pos) &&
      Game.state.scene === Game.state.blacksmith.scene
    ) {
      if (
        Game.dialogue &&
        typeof Game.dialogue.talk === "function" &&
        Game.story &&
        typeof Game.story.canTalkToBlacksmith === "function" &&
        Game.story.canTalkToBlacksmith()
      ) {
        Game.dialogue.talk("blacksmith");
      }
      return;
    }
    if (Game.dialogue && typeof Game.dialogue.talk === "function") {
      Game.dialogue.talk("default");
      return;
    }
    Game.pushMessage({ text: "誰も応えてくれない。" });
  }

  function isAdjacentToNpc(pos) {
    const deltas = Game.utils.directions4 || [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];
    for (const delta of deltas) {
      const nx = pos.x + delta.x;
      const ny = pos.y + delta.y;
      const occ = Game.occupancy.get(nx, ny);
      if (occ && occ.npc) {
        return true;
      }
    }
    return false;
  }

  Game.input = {
    handleKeyPressed,
    handleKeyReleased,
    update,
  };
})();
