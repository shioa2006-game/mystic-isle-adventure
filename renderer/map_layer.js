(function () {
  // タイル描画レイヤー
  const Game = (window.Game = window.Game || {});
  const { tileSize, layout } = Game.rendererLayout;

  const SPRITE_SIZE = 48;
  const SPRITE_COLS = 8;

  const TILE_TO_SPRITE_INDEX = {
    [Game.TILE.GRASS]: 0,
    [Game.TILE.ROAD]: 1,
    [Game.TILE.WATER]: 2,
    [Game.TILE.FLOOR_CAVE]: 3,
    [Game.TILE.FLOOR_BUILD]: 4,
    [Game.TILE.MOUNTAIN]: 5,
    [Game.TILE.ROCK]: 6,
    [Game.TILE.TREE]: 7,
    [Game.TILE.WALL]: 8,
    [Game.TILE.DOOR]: 9,
    [Game.TILE.ENTRANCE_TOWN]: 10,
    [Game.TILE.ENTRANCE_CAVE]: 11,
    [Game.TILE.STAIRS_UP]: 12,
    [Game.TILE.STAIRS_DOWN]: 13,
    [Game.TILE.RUINS]: 14,
  };

  function drawSprite(p, spriteIndex, screenX, screenY) {
    if (!Game.assets || !Game.assets.tilesSheet) return false;

    const col = spriteIndex % SPRITE_COLS;
    const row = Math.floor(spriteIndex / SPRITE_COLS);
    const sx = col * SPRITE_SIZE;
    const sy = row * SPRITE_SIZE;

    p.image(
      Game.assets.tilesSheet,
      screenX,
      screenY,
      tileSize,
      tileSize,
      sx,
      sy,
      SPRITE_SIZE,
      SPRITE_SIZE
    );
    return true;
  }

  function drawMap(p = window) {
    const map = Game.getCurrentMap();
    if (!map) return;
    const camera = Game.camera.getCamera();
    p.push();
    p.translate(layout.mapOffsetX, layout.mapOffsetY);
    p.noStroke();
    p.fill(0);
    p.rect(0, 0, layout.mapAreaWidth, layout.mapAreaHeight);
    for (let y = 0; y < Game.config.gridHeight; y += 1) {
      const screenY = y * tileSize - camera.y;
      if (screenY + tileSize < 0 || screenY > layout.mapAreaHeight) continue;
      for (let x = 0; x < Game.config.gridWidth; x += 1) {
        const screenX = x * tileSize - camera.x;
        if (screenX + tileSize < 0 || screenX > layout.mapAreaWidth) continue;
        const tileId = map.tiles[y][x];
        const spriteIndex = TILE_TO_SPRITE_INDEX[tileId];
        if (spriteIndex !== undefined) {
          p.push();
          p.imageMode(p.CORNER);
          drawSprite(p, spriteIndex, screenX, screenY);
          p.pop();
        } else {
          const color = Game.TILE_COLOR[tileId] || "#333333";
          p.fill(color);
          p.rect(screenX, screenY, tileSize, tileSize);
        }
      }
    }
    p.pop();
  }

  Game.rendererLayers = Game.rendererLayers || {};
  Game.rendererLayers.drawMap = drawMap;
})();
