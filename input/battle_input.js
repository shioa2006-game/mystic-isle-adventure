(function () {
  // 戦闘コマンド入力を担当
  const Game = (window.Game = window.Game || {});

  if (!Game.combat) {
    throw new Error("BattleInput の初期化に失敗しました。Game.combat が未定義です。");
  }

  function handleInput(keyValue, keyCode) {
    const upper = (keyValue || "").toUpperCase();
    if (upper === "A") {
      Game.combat.playerAction("ATTACK");
      return;
    }
    if (upper === "D") {
      Game.combat.playerAction("DEFEND");
      return;
    }
    if (upper === "R") {
      Game.combat.playerAction("RUN");
      return;
    }
    if (keyCode === window.ENTER) {
      return;
    }
  }

  Game.controllers = Game.controllers || {};
  Game.controllers.battle = {
    handleInput,
  };
})();
