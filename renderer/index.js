(function () {
  // レンダラーのエントリポイント
  const Game = (window.Game = window.Game || {});
  const layers = Game.rendererLayers || {};

  function getLayer(name) {
    const fn = layers[name];
    if (typeof fn === "function") return fn;
    return () => {};
  }

  Game.renderer = {
    drawMap: getLayer("drawMap"),
    drawEntities: getLayer("drawEntities"),
    drawUI: getLayer("drawUI"),
    drawOverlays: getLayer("drawOverlays"),
    drawBattleOverlay: getLayer("drawBattleOverlay"),
    drawClearOverlay: getLayer("drawClearOverlay"),
  };
})();
