(function () {
  // 遺跡1階 ASCIIマップ
  const Game = (window.Game = window.Game || {});
  const sources = (Game.mapSources = Game.mapSources || {});

  sources.RUINS = [
    "w w w w w w w w w w w w w w w w w w w w w w w w",
    "w c c c c c c c c c c c x c c c c c c c c c c w",
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
    "w c c c c c c c c c w c c w c c c c c c c c c w",
    "w c c c c c c c c c w c c w c c c c c c c c c w",
    "w c c c c c c c c c w c c w c c c c c c c c c w",
    "w c c c c c c c c c w c c w c c c c c c c c c w",
    "w w w w w w w w w w w c c w w w w w w w w w w w",
  ];
})();
