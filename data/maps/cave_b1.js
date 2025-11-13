(function () {
  // 洞窟 B1 シーンの ASCII マップ定義
  const Game = (window.Game = window.Game || {});
  const sources = (Game.mapSources = Game.mapSources || {});

  sources.CAVE = [
    "s s s s s s s s s s s s s s s s s s s s s s s s",
    "s c c c c c c c c c x c c c c c c c c c c c c s",
    "s c s s c c c c c c c c c c c c c c c c c c c s",
    "s c c c c c s c c c c c c c c c c c s s s c c s",
    "s c c c c c s c c c c c c c c c c c c c c c c s",
    "s c c c c c s c c s s c c c c c c c c c c c c s",
    "s c c c c c c c c c c c c c c c c c c c c c c s",
    "s c c s s c c c c c c c c c c c c c c c c c c s",
    "s c c c c c c c c c c c c c c c c c c c c c c s",
    "s c c c s c c c c c s s c c c c c c c c c c c s",
    "s c c c c c c c c c c c c c c c s s c c c c c s",
    "s c c c c c c c s c c c c c c c c c c c c c c s",
    "s c c c c c c c c c c c c c c c c c c c c c c s",
    "s c c c c c c c c c c c c c c c c c c c c c c s",
    "s c c c s s c c c c c c c s s c c c c c c c c s",
    "s c c c c c c c c c c c c c c c c c c c c c c s",
    "s c c c c c c c c c c c c c c c c c c c c c y s",
    "s s s s s s s s s s s s s s s s s s s s s s s s",
  ];
})();
