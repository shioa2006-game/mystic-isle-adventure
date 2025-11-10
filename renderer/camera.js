(function () {
  // カメラ位置を算出
  const Game = (window.Game = window.Game || {});

  function getCamera() {
    const player = Game.state.playerPos;
    const tileSize = Game.rendererLayout.tileSize;
    const { mapAreaWidth, mapAreaHeight } = Game.rendererLayout.layout;
    const centerX = player.x * tileSize + tileSize / 2;
    const centerY = player.y * tileSize + tileSize / 2;
    return {
      x: centerX - mapAreaWidth / 2,
      y: centerY - mapAreaHeight / 2,
    };
  }

  Game.camera = {
    getCamera,
  };
})();
