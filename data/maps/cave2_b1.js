(function () {
  // 洞窟2（1層）ASCIIマップ
  const Game = (window.Game = window.Game || {});
  const sources = (Game.mapSources = Game.mapSources || {});

  sources.CAVE2 = [
    "s s s s s s s s s s s s s s s s s s s s s s s s",
    "s c c c c c c c c c x c c c c c c c c c c c c s",
    "s c c c c c c c c c c c c s s c c c c c c c c s",
    "s c s c c s s c c c c c c c c c c c c c c c c s",
    "s ~ ~ ~ c c c c c c c c c c c c c c s c c c c s",
    "s c c ~ ~ ~ c s s s c c c c c c c s c c c s c s",
    "s c c c c ~ c c c c c c c c c s c c c c c s c s",
    "s c c s c ~ ~ ~ ~ ~ ~ ~ ~ c c c s c c c c c c s",
    "s c c c c c c c c c c c ~ ~ ~ ~ c c c c c c c s",
    "s c c c c c c c c c c c c c c c c c c ~ ~ ~ ~ s",
    "s s s c c c c c c c c c c c c c c ~ ~ ~ c c c s",
    "s c c c c c ~ ~ ~ ~ c c c ~ ~ ~ ~ ~ c c c s c s",
    "s c c ~ ~ ~ ~ c c ~ ~ ~ ~ ~ c c c c c c c c c s",
    "s c c c c c c c c c c c c c c c c c c c s c c s",
    "s c s c c c c c c s s c c c c c s s c c c c c s",
    "s c c c c s c c c c c c c c s c c c c c c c c s",
    "s c c c s s c c c c c c c c c c c c c c c c y s",
    "s s s s s s s s s s s s s s s s s s s s s s s s",
  ];
})();
