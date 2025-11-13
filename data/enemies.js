(function () {
  // 敵ごとの能力値をまとめて定義
  const Game = (window.Game = window.Game || {});

  const ENEMY_DATA = Object.freeze({
    SLIME: {
      name: "スライム",
      hp: [8, 12],
      atk: [2, 3],
      def: [0, 0],
      exp: [3, 5],
      gold: [4, 8],
    },
    BAT: {
      name: "コウモリ",
      hp: [14, 18],
      atk: [3, 4],
      def: [0, 1],
      exp: [6, 8],
      gold: [8, 12],
    },
    SPIDER: {
      name: "クモ",
      hp: [20, 26],
      atk: [4, 6],
      def: [1, 2],
      exp: [9, 12],
      gold: [12, 16],
    },
    GHOST: {
      name: "ゴースト",
      hp: [28, 34],
      atk: [6, 7],
      def: [2, 3],
      exp: [12, 16],
      gold: [16, 20],
    },
    VAMPIRE: {
      name: "ヴァンパイア",
      hp: [36, 44],
      atk: [7, 9],
      def: [3, 4],
      exp: [18, 24],
      gold: [22, 28],
    },
    TROLL: {
      name: "トロル",
      hp: [48, 58],
      atk: [9, 11],
      def: [4, 5],
      exp: [24, 32],
      gold: [28, 36],
    },
    DRAGON: {
      name: "ドラゴン",
      hp: [60, 80],
      atk: [9, 11],
      def: [4, 5],
      exp: [30, 40],
      gold: [35, 50],
    },
  });

  Game.ENEMY_DATA = ENEMY_DATA;
})();
