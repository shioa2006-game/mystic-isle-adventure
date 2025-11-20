(function () {
  // レンダラーのエントリポイント
  const Game = (window.Game = window.Game || {});

  function invokeLayer(name) {
    const layers = Game.rendererLayers || {};
    const fn = layers[name];
    if (typeof fn === "function") {
      fn();
    }
  }

  const rendererFacade = {
    drawMap: () => invokeLayer("drawMap"),
    drawEntities: () => invokeLayer("drawEntities"),
    drawUI: () => invokeLayer("drawUI"),
    drawOverlays: () => invokeLayer("drawOverlays"),
    drawBattleOverlay: () => invokeLayer("drawBattleOverlay"),
    drawClearOverlay: () => invokeLayer("drawClearOverlay"),
  };

  rendererFacade.drawAll = function drawAll() {
    rendererFacade.drawMap();
    rendererFacade.drawEntities();
    rendererFacade.drawUI();
    rendererFacade.drawOverlays();
    rendererFacade.drawBattleOverlay();
    rendererFacade.drawClearOverlay();
  };

  Game.renderer = rendererFacade;
})();
