(function () {
  // 街シーンの ASCII マップ定義
  const Game = (window.Game = window.Game || {});
  const sources = (Game.mapSources = Game.mapSources || {});

  sources.TOWN = [
    "w w w w w w w w w w w d w w w w w w w w w w w w",
    "w . . . . . . . . . . r t w f f f s s s f f f w",
    "w . . . . . . . . . . r t w f f f s f s f f f w",
    "w . . t . . . w w w w r t w f f f f f f f f f w",
    "w . . . . . . w f f f r t w f f f f f f f f f w",
    "w . . . . . . w f f f r t w f f f f f f f f f w",
    "w . t t . . . w f f f r t w w w w f f f w w w w",
    "w . . . . . . w w w w r t t t t t r r r t t t w",
    "w r r r r r r r r r r r r r r r r r r r r r r w",
    "w . . . . . . . . . . r w w w w . . . . . . . w",
    "w . t t . . . . . . . r f f f w . . . . t t . w",
    "w . . . . . . . . . . r f f f w . . . . . . . w",
    "w . . . . . . . t t . r f f f w . t t . . . . w",
    "w . . . . . . . . . . r w w w w . . . . . . . w",
    "w . . . . . . . . t t r . . . . . . . . t t . w",
    "w . . . . . . . . . . r . . . . . . . . . . . w",
    "w . . . . . . . . . . r . . . . . . . . . . . w",
    "w w w w w w w w w w w d w w w w w w w w w w w w",
  ];
})();
