(function () {
  // 遺跡 地下2階 ASCIIマップ
  const Game = (window.Game = window.Game || {});
  const sources = (Game.mapSources = Game.mapSources || {});

  sources.RUINS_B2 = [
    "w w w w w w w w w w w w w w w w w w w w w w w w",
    "w c c c c c c c c c c c y c c c c c c c c c c w",
    "w c c c c c c c c c c c c c c c c c c c c c c w",
    "w c c c c c c c c c c c c c c c c c c c c c c w",
    "w c c c s w w s c c s w w s c c s w w s c c c w",
    "w c c c c c c c c c c c c c c c c c c c c c c w",
    "w c c c c c c c c c c c c c c c c c c c c c c w",
    "w c c c c c c c c c c c c c c c c c c c c c c w",
    "w c c c s w w s w w s w w s w w s w w s c c c w",
    "w c c c c c c c c c c c c c c c c c c c c c c w",
    "w c c c c c c c c c c c c c c c c c c c c c c w",
    "w c c c c c c c c c c c c c c c c c c c c c c w",
    "w c c c s w w s c c s c c s c c s w w s c c c w",
    "w c c c c c c c c c s c c s c c c c c c c c c w",
    "w c c c c c c c c c s f f s c c c c c c c c c w",
    "w c c c c c c c c c s f f s c c c c c c c c c w",
    "w c c c c c c c c c s s s s c c c c c c c c c w",
    "w w w w w w w w w w w w w w w w w w w w w w w w",
  ];
})();
