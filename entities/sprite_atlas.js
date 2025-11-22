(function () {
  // スプライト描画を担当
  const Game = (window.Game = window.Game || {});
  const types = Game.entityTypes || {};

  function drawActor(g, actorType, gridX, gridY, options = {}) {
    if (!Game.assets || !Game.assets.actorsSheet) return false;
    const actorSprite = types.spriteSettings.actor;
    const spriteIndex = actorSprite.index[actorType];
    if (spriteIndex == null) return false;
    const tileSize = Game.config.tileSize;
    const offsetX = options.offsetX || 0;
    const offsetY = options.offsetY || 0;
    const screenX = gridX * tileSize + offsetX;
    const screenY = gridY * tileSize + offsetY;
    const sx = spriteIndex * actorSprite.size;
    g.push();
    g.imageMode(g.CORNER);
    g.image(
      Game.assets.actorsSheet,
      screenX,
      screenY,
      tileSize,
      tileSize,
      sx,
      0,
      actorSprite.size,
      actorSprite.size
    );
    g.pop();
    return true;
  }

  function drawEnemy(g, enemyKind, gridX, gridY, options = {}) {
    if (!Game.assets || !Game.assets.enemiesSheet) return false;
    const enemySprite = types.spriteSettings.enemy;
    const spriteIndex = enemySprite.index[enemyKind];
    if (spriteIndex == null) return false;
    const tileSize = Game.config.tileSize;
    const drawSize = options.drawSize || tileSize;
    const offsetX = options.offsetX || 0;
    const offsetY = options.offsetY || 0;
    const useScreen = options.useScreenCoordinates === true;
    const baseX = useScreen ? gridX : gridX * tileSize;
    const baseY = useScreen ? gridY : gridY * tileSize;
    const screenX = baseX + offsetX;
    const screenY = baseY + offsetY;
    let sx = 0;
    let sy = 0;
    if (typeof spriteIndex === "number") {
      sx = spriteIndex * enemySprite.size;
    } else {
      sx = (spriteIndex.x || 0) * enemySprite.size;
      sy = (spriteIndex.y || 0) * enemySprite.size;
    }
    g.push();
    g.imageMode(g.CORNER);
    g.image(
      Game.assets.enemiesSheet,
      screenX,
      screenY,
      drawSize,
      drawSize,
      sx,
      sy,
      enemySprite.size,
      enemySprite.size
    );
    g.pop();
    return true;
  }

  function drawObject(g, objectKind, gridX, gridY, options = {}) {
    if (!Game.assets || !Game.assets.objectsSheet) return false;
    const objectSprite = types.spriteSettings.object;
    const spriteIndex = objectSprite.index[objectKind];
    if (spriteIndex == null) return false;
    const tileSize = Game.config.tileSize;
    const offsetX = options.offsetX || 0;
    const offsetY = options.offsetY || 0;
    const screenX = gridX * tileSize + offsetX;
    const screenY = gridY * tileSize + offsetY;
    const sx = spriteIndex * objectSprite.size;
    g.push();
    g.imageMode(g.CORNER);
    g.image(
      Game.assets.objectsSheet,
      screenX,
      screenY,
      tileSize,
      tileSize,
      sx,
      0,
      objectSprite.size,
      objectSprite.size
    );
    g.pop();
    return true;
  }

  function drawEnemies(p, camera) {
    const enemies = Game.state.enemies.filter((enemy) => enemy.scene === Game.state.scene);
    enemies.forEach((enemy) => {
      const options = {
        offsetX: -camera.x,
        offsetY: -camera.y,
      };
      if (!drawEnemy(p, enemy.kind, enemy.pos.x, enemy.pos.y, options)) {
        const tileSize = Game.config.tileSize;
        const screenX = enemy.pos.x * tileSize + options.offsetX;
        const screenY = enemy.pos.y * tileSize + options.offsetY;
        p.push();
        p.noStroke();
        p.fill(200, 40, 40);
        p.rect(screenX, screenY, tileSize, tileSize);
        p.pop();
      }
    });
  }

  Game.spriteAtlas = {
    drawActor,
    drawEnemy,
    drawObject,
    drawEnemies,
  };
})();
