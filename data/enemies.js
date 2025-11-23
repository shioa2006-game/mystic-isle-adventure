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
      atk: [7, 9],
      def: [3, 4],
      exp: [12, 16],
      gold: [16, 20],
    },
    WOLF: {
      name: "ウルフ",
      hp: [24, 32],
      atk: [6, 8],
      def: [2, 3],
      exp: [10, 14],
      gold: [14, 18],
    },
    SKELETON: {
      name: "スケルトン",
      hp: [32, 40],
      atk: [7, 9],
      def: [3, 4],
      exp: [14, 18],
      gold: [18, 22],
    },
    LIZARDMAN: {
      name: "リザードマン",
      hp: [48, 56],
      atk: [10, 12],
      def: [3, 4],
      exp: [20, 26],
      gold: [24, 30],
    },
    VAMPIRE: {
      name: "ヴァンパイア",
      hp: [42, 52],
      atk: [9, 11],
      def: [3, 4],
      exp: [18, 24],
      gold: [22, 28],
    },
    TROLL: {
      name: "トロル",
      hp: [56, 68],
      atk: [11, 14],
      def: [4, 5],
      exp: [24, 32],
      gold: [28, 36],
    },
    GOLEM: {
      name: "ゴーレム",
      hp: [85, 100],
      atk: [14, 17],
      def: [7, 9],
      exp: [40, 50],
      gold: [42, 50],
    },
    DARK_KNIGHT: {
      name: "ダークナイト",
      hp: [90, 105],
      atk: [15, 18],
      def: [8, 10],
      exp: [45, 55],
      gold: [48, 60],
    },
    REAPER: {
      name: "リーパー",
      hp: [95, 110],
      atk: [16, 20],
      def: [9, 11],
      exp: [50, 60],
      gold: [52, 65],
    },
    DRAGON: {
      name: "ドラゴン",
      hp: [160, 200],
      atk: [22, 26],
      def: [10, 12],
      exp: [100, 150],
      gold: [100, 150],
    },
  });

  Game.ENEMY_DATA = ENEMY_DATA;
})();
