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
  - スポーン: cave[10,2] (fromField)

- cave[10,1] → field[18,4]
  - STAIRS_UP (x) → フィールド
  - スポーン: field[18,4] (fromCave)

#### フィールド ⇔ 洞窟2 (CAVE2)
- field[21,15] → cave2[10,1]
  - ENTRANCE_CAVE (h) → STAIRS_UP (x)
  - スポーン: cave2[10,2] (fromField)

- cave2[10,1] → field[20,15]
  - STAIRS_UP (x) → フィールド
  - スポーン: field[20,15] (fromCave2)

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
  - スポーン: cave_b2[23,21] (fromUpper)

- cave_b2[23,22] → cave[22,21]
  - STAIRS_UP (x) → 洞窟1
  - スポーン: cave[22,21] (fromLower)

### 洞窟2 (CAVE2) の遷移

#### 洞窟2 ⇔ 洞窟2地下 (CAVE2_B2)
- cave2[23,22] → cave2_b2[23,22]
  - STAIRS_DOWN (y) → STAIRS_UP (x)
  - スポーン: cave2_b2[23,21] (fromUpper)

- cave2_b2[23,22] → cave2[23,21]
  - STAIRS_UP (x) → 洞窟2
  - スポーン: cave2[23,21] (fromLower)

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