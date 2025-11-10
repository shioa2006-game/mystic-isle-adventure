(function () {
  // レイアウト情報を集約
  const Game = (window.Game = window.Game || {});

  const tileSize = Game.config.tileSize;
  const mapAreaHeight = 450;

  const layout = {
    mapAreaWidth: Game.config.canvasWidth,
    mapAreaHeight,
    mapOffsetX: 0,
    mapOffsetY: 0,
    panelHeight: 150,
    panelWidth: Game.config.canvasWidth / 2,
  };

  const overlayArea = {
    x: 40,
    y: 50,
    width: Game.config.canvasWidth - 80,
    height: mapAreaHeight - 100,
  };

  Game.rendererLayout = {
    tileSize,
    mapAreaHeight,
    layout,
    overlayArea,
  };
})();
