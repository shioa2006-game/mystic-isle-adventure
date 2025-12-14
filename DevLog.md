# DevLog

## マップ遷移一覧

### フィールド (FIELD) の遷移

#### フィールド ⇔ 街 (TOWN)
- field[10,8] → town[11,16] (南ドア)
  - ENTRANCE_TOWN (v) → DOOR (d)
  - スポーン: town[11,16] (fromField)

- town[11,16] (南ドア) → field[10,9]
  - DOOR (d) → フィールド
  - スポーン: field[10,9] (fromTownSouth)

- town[11,0] (北ドア) → field[10,7]
  - DOOR (d) → フィールド
  - スポーン: field[10,7] (fromTownNorth)

#### フィールド ⇔ 洞窟1 (CAVE)
- field[18,3] → cave[10,1]
  - ENTRANCE_CAVE (h) → STAIRS_UP (x)
  - スポーン: cave[10,1] (fromField)

- cave[10,1] → field[18,3]
  - STAIRS_UP (x) → フィールド
  - スポーン: field[18,3] (fromCave)

#### フィールド ⇔ 洞窟2 (CAVE2)
- field[21,15] → cave2[10,1]
  - ENTRANCE_CAVE (h) → STAIRS_UP (x)
  - スポーン: cave2[10,1] (fromField)

- cave2[10,1] → field[21,15]
  - STAIRS_UP (x) → フィールド
  - スポーン: field[21,15] (fromCave2)

#### フィールド ⇔ 遺跡 (RUINS)
- field[5,5] → ruins[12,16]
  - RUINS (u) → FLOOR_CAVE (c)
  - スポーン: ruins[12,16] (fromField)

- ruins[11,17] → field[5,5]
  - FLOOR_CAVE (c) → フィールド
  - スポーン: field[5,5] (fromRuins)

- ruins[12,17] → field[5,5]
  - FLOOR_CAVE (c) → フィールド
  - スポーン: field[5,5] (fromRuins)

### 洞窟1 (CAVE) の遷移

#### 洞窟1 ⇔ 洞窟1地下 (CAVE_B2)
- cave[22,22] → cave_b2[23,22]
  - STAIRS_DOWN (y) → STAIRS_UP (x)
  - スポーン: cave_b2[23,22] (fromUpper)

- cave_b2[23,22] → cave[22,22]
  - STAIRS_UP (x) → 洞窟1
  - スポーン: cave[22,22] (fromLower)

### 洞窟2 (CAVE2) の遷移

#### 洞窟2 ⇔ 洞窟2地下 (CAVE2_B2)
- cave2[23,22] → cave2_b2[23,22]
  - STAIRS_DOWN (y) → STAIRS_UP (x)
  - スポーン: cave2_b2[23,22] (fromUpper)

- cave2_b2[23,22] → cave2[23,22]
  - STAIRS_UP (x) → 洞窟2
  - スポーン: cave2[23,22] (fromLower)

### 遺跡 (RUINS) の遷移

#### 遺跡1階 (RUINS) ⇔ 遺跡2階 (RUINS_B2)
- ruins[12,1] → ruins_2f[12,1]
  - STAIRS_UP (x) → STAIRS_DOWN (y)
  - スポーン: ruins_2f[12,1] (fromUpper)

- ruins_2f[12,1] → ruins[12,1]
  - STAIRS_DOWN (y) → 遺跡1階
  - スポーン: ruins[12,1] (fromLower)

#### 遺跡2階 (RUINS_B2) ⇔ 遺跡3階 (RUINS_B3)
- ruins_2f[12,16] → ruins_3f[12,16]
  - STAIRS_UP (x) → STAIRS_DOWN (y)
  - スポーン: ruins_3f[12,16] (fromUpper)

- ruins_3f[12,16] → ruins_2f[12,16]
  - STAIRS_DOWN (y) → 遺跡2階
  - スポーン: ruins_2f[12,16] (fromLower)

### 座標表記について
- 座標は [x, y] の形式で表記（map_data.jsの position: {x, y} に対応）
- 0ベースのインデックス
- 各マップは 24x24 グリッド
- スポーン位置は遷移後のプレイヤー出現位置

## マップ遷移パターンの分類

### パターンA: 描画タイルの上にスポーン（同座標）
プレイヤーが遷移トリガーと同じ座標に出現するパターン。
主に階段（上下）の遷移で使用される。

#### フィールド ⇔ 洞窟（CAVE/CAVE2）
- field[18,3] → cave[10,1] / cave[10,1] → field[18,3]
  - トリガー座標 = スポーン座標
- field[21,15] → cave2[10,1] / cave2[10,1] → field[21,15]
  - トリガー座標 = スポーン座標
- cave[22,22] → cave_b2[23,22] / cave_b2[23,22] → cave[22,22]
  - トリガー座標 = スポーン座標
- cave2[23,22] → cave2_b2[23,22] / cave2_b2[23,22] → cave2[23,22]
  - トリガー座標 = スポーン座標

#### 遺跡階層間の遷移
- ruins[12,1] → ruins_2f[12,1] (STAIRS_UP → STAIRS_DOWN)
  - トリガー座標 = スポーン座標
- ruins_2f[12,1] → ruins[12,1] (STAIRS_DOWN → STAIRS_UP)
  - トリガー座標 = スポーン座標
- ruins_2f[12,16] → ruins_3f[12,16] (STAIRS_UP → STAIRS_DOWN)
  - トリガー座標 = スポーン座標
- ruins_3f[12,16] → ruins_2f[12,16] (STAIRS_DOWN → STAIRS_UP)
  - トリガー座標 = スポーン座標

#### フィールド ⇔ 遺跡
- field[5,5] (RUINS) → ruins[12,16]
  - 遺跡入口の固定座標にスポーン（ruinsSpawnFromField）
- ruins[11,17] → field[5,5] (FLOOR_CAVE → フィールド)
  - トリガー座標から遷移、フィールドの固定座標にスポーン
- ruins[12,17] → field[5,5] (FLOOR_CAVE → フィールド)
  - トリガー座標から遷移、フィールドの固定座標にスポーン

### パターンB: 描画タイルから1マスずれた位置にスポーン
プレイヤーが遷移トリガーから上下左右に1マスずれた位置に出現するパターン。
主にドアで使用され、プレイヤーが描画の「手前」に出現する。

#### フィールド ⇔ 街
- field[10,8] (ENTRANCE_TOWN) → town[11,15]
  - ドアの1マス上にスポーン（townDoorSouth[11,16] - 1）
- town[11,16] (南DOOR) → field[10,9]
  - 入口の1マス下にスポーン（fieldTownEntry[10,8] + 1）
- town[11,0] (北DOOR) → field[10,7]
  - 入口の1マス上にスポーン（fieldTownEntry[10,8] - 1）

### パターンの特徴まとめ

| パターン | 使用される場所 | スポーン位置 | 実装箇所 |
|---------|--------------|------------|----------|
| A: 同座標 | 遺跡階段、洞窟階段・入口 | トリガータイルと同じ座標 | map_data.js: spawnPoints定義で同座標を指定 |
| B: 1マスずれ | ドア（町出入口） | トリガータイルから±1マス | map_data.js: spawnPoints定義で±1を計算 |

### 遷移処理の流れ（実装）
1. プレイヤーが移動先タイルに到達（movement_controller.js:65-95）
2. `Game.occupancy.resolveTileEvent()`が呼ばれる（movement_controller.js:91）
3. `switchScene(targetScene, targetSpawn)`が実行される（game_state.js:456-472）
4. `spawnPoints[targetSpawn]`から座標を取得してプレイヤーを配置（game_state.js:463-464）

### 実装上の注意点
- パターンAは洞窟・遺跡の階段で使用され、プレイヤーが階段の上に立つ
- パターンBは主にドアで使用され、プレイヤーが描画の「手前」に立つ
- スポーン座標の計算は`map_data.js`の181-220行目で定義されている
- 遷移後の座標はグリッドの範囲内に収まるよう`Math.min()`や`Math.max()`で調整される
