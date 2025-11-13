(function () {
  // レンダラーのエントリポイント
  const Game = (window.Game = window.Game || {});
  const layers = Game.rendererLayers || {};

  function getLayer(name) {
    const fn = layers[name];
    if (typeof fn === "function") return fn;
    return () => {};
  }

  const rendererFacade = {
    drawMap: getLayer("drawMap"),
    drawEntities: getLayer("drawEntities"),
    drawUI: getLayer("drawUI"),
    drawOverlays: getLayer("drawOverlays"),
    drawBattleOverlay: getLayer("drawBattleOverlay"),
    drawClearOverlay: getLayer("drawClearOverlay"),
  };

  rendererFacade.drawAll = function drawAll() {
    // 描画順を一元管理しておき、将来のレイヤー追加にも備える
    rendererFacade.drawMap();
    rendererFacade.drawEntities();
    rendererFacade.drawUI();
    rendererFacade.drawOverlays();
    rendererFacade.drawBattleOverlay();
    rendererFacade.drawClearOverlay();
  };

  Game.renderer = rendererFacade;
})();
