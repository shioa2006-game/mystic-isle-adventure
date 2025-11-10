(function () {
  // ゲーム全体で共有する描画やグリッド設定を定義
  const Game = (window.Game = window.Game || {});

  if (Game.config) return;

  const config = Object.freeze({
    canvasWidth: 800,
    canvasHeight: 600,
    tileSize: 48,
    gridWidth: 24,
    gridHeight: 18,
  });

  Game.config = config;
})();
