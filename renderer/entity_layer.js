(function () {
  // プレイヤー / NPC / イベントレイヤー
  const Game = (window.Game = window.Game || {});
  const { layout, tileSize } = Game.rendererLayout;

  function drawEntities(p = window) {
    const camera = Game.camera.getCamera();
    p.push();
    p.translate(layout.mapOffsetX, layout.mapOffsetY);
    drawEventEntities(p, camera);
    drawNpcEntities(p, camera);
    drawPlayer(p, camera);
    if (Game.entities && typeof Game.entities.drawEnemies === "function") {
      Game.entities.drawEnemies(p, camera);
    }
    p.pop();
  }

  function drawEventEntities(p, camera) {
    if (!Game.EVENTS) return;
    const scene = Game.state.scene;
    const events = Game.EVENTS[scene];
    if (!events) return;
    if (Array.isArray(events.chests)) {
      events.chests.forEach((pos) => {
        if (
          Game.playerState &&
          Game.playerState.hasOpenedChest &&
          Game.playerState.hasOpenedChest(Game.flags, scene, pos.x, pos.y)
        ) {
          return;
        }
        drawObject(p, pos.x, pos.y, camera, Game.entities.OBJECT_KIND.CHEST);
      });
    }
  }

  function drawNpcEntities(p, camera) {
    const actorDrawOptions = {
      offsetX: -camera.x,
      offsetY: -camera.y,
    };
    const actors = [
      { kind: Game.entities.ACTOR_KIND.MERCHANT, data: Game.state.merchant },
      { kind: Game.entities.ACTOR_KIND.INNKEEPER, data: Game.state.innkeeper },
    ];
    if (Game.state.king) {
      actors.push({ kind: Game.entities.ACTOR_KIND.KING, data: Game.state.king });
    }
    actors.forEach((entry) => {
      if (!entry.data || entry.data.scene !== Game.state.scene) return;
      const ok = Game.entities.drawActor(
        p,
        entry.kind,
        entry.data.pos.x,
        entry.data.pos.y,
        actorDrawOptions
      );
      if (!ok) {
        drawFallbackRect(p, entry.data.pos.x, entry.data.pos.y, camera, p.color(240, 200, 120));
      }
    });
  }

  function drawPlayer(p, camera) {
    const options = {
      offsetX: -camera.x,
      offsetY: -camera.y,
    };
    const pos = Game.state.playerPos;
    const ok = Game.entities.drawActor(p, Game.entities.ACTOR_KIND.PLAYER, pos.x, pos.y, options);
    if (!ok) {
      drawFallbackRect(p, pos.x, pos.y, camera, p.color(80, 200, 255));
    }
  }

  function drawObject(p, gridX, gridY, camera, objectKind) {
    if (!Game.entities || typeof Game.entities.drawObject !== "function") {
      drawFallbackRect(p, gridX, gridY, camera, p.color(180, 120, 60));
      return;
    }
    const drawn = Game.entities.drawObject(p, objectKind, gridX, gridY, {
      offsetX: -camera.x,
      offsetY: -camera.y,
    });
    if (!drawn) {
      drawFallbackRect(p, gridX, gridY, camera, p.color(180, 120, 60));
    }
  }

  function drawFallbackRect(p, gridX, gridY, camera, color) {
    const screenX = gridX * tileSize - camera.x;
    const screenY = gridY * tileSize - camera.y;
    p.push();
    p.noStroke();
    p.fill(color);
    p.rect(screenX, screenY, tileSize, tileSize);
    p.pop();
  }

  Game.rendererLayers = Game.rendererLayers || {};
  Game.rendererLayers.drawEntities = drawEntities;
})();
