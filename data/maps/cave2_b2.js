(function () {
  // 洞窟2（地下2階）ASCIIマップ
  const Game = (window.Game = window.Game || {});
  const sources = (Game.mapSources = Game.mapSources || {});

  sources.CAVE2_B2 = [
    "s s s s s s s s s s s s s s s s s s s s s s s s",
    "s c c c c c c c c c c c c c c c c c c c c c c s",
    "s c c c c s c s c c c c c c c s c c c c c c c s",
    "s c c c c c c c c c c c c c c c c c c c c c c s",
    "s c c c s s c c c c c c c c c c c c c s c c c s",
    "s c c s c c c c c c c c c c c s c c s c c c c s",
    "s c c c c c c c c c ~ ~ ~ ~ ~ c c c c c c c c s",
    "s c c c c ~ ~ ~ ~ ~ ~ c c c c c c c c c c c c s",
    "s c c c ~ ~ c c c c c c c c c c c c c s c c c s",
    "s ~ ~ ~ ~ c c c c c c c c c c c c s c c c c c s",
    "s c c c c c c c c c c c c c c c c c c c c c c s",
    "s c c s c c c c c c c c s s c c c c c c c c c s",
    "s c c c c c c c c c c c c c ~ ~ ~ c c c c c c s",
    "s c c c c c s c c c c s c c c c ~ ~ ~ ~ ~ ~ ~ s",
    "s c c s c c c c c c c c c c c c c c c c c c c s",
    "s c c s c c c c c c c c c c c c c c c c c c c s",
    "s c c c c c c c c c c c c s c c c c c c c c x s",
    "s s s s s s s s s s s s s s s s s s s s s s s s",
  ];
})();
