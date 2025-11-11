# リファクタリング設計書とのギャップ分析

**分析日時:** 2025-11-11
**対象:** GAME_DESIGN.md に記載のリファクタリング設計書との差分
**現在の実装状況:** 大部分は実装済み、いくつかの改善余地あり

---

## 実装状況サマリー

| カテゴリ | 実装率 | 状態 |
|---------|--------|------|
| 1. 状態管理レイヤー再構築 | 95% | ほぼ完了 |
| 2. 入力制御モジュール化 | 100% | 完了 |
| 3. 描画レイヤー整理 | 90% | ほぼ完了 |
| 4. エンティティと敵AI | 100% | 完了 |
| 5. データ/メッセージ統合 | 70% | 部分的に完了 |

**総合評価:** リファクタリングの主要な目標はほぼ達成されている。残りは細かいデータ整理と最適化。

---

## ギャップ詳細

### 1. 状態管理レイヤー再構築

#### ✅ 実装済み
- `config.js`: キャンバス寸法やタイルサイズを定義 (17行)
- `constants.js`: SCENE, TILE, ITEM, OVERLAY などの列挙体を統合 (145行)
- `state/player_state.js`: プレイヤー/インベントリ/進行フラグ操作を管理 (365行)
- `state/ui_state.js`: UI開閉やオーバーレイ状態を管理 (64行)
- `state/occupancy.js`: タイル占有ロジックを独立管理 (291行)

#### ⚠️ ギャップ

**Gap 1.1: game_state.js の行数が目標を若干超過**
- **現状**: 420行
- **目標**: 400行未満
- **評価**: **Better** (ほぼ目標達成、20行超過のみ)
- **詳細**:
  - ENEMY_DATA定義 (56-113行) が game_state.js 内に残存
  - その他は適切にモジュール化されている
- **推奨対応**:
  - ENEMY_DATA を `data/enemies.js` へ移動
  - これにより約60行削減可能 → 目標の400行未満を達成

**Gap 1.2: ENEMY_DATA の配置**
- **現状**: game_state.js 内に定義 (56-113行)
- **目標**: データ定義はデータモジュールに集約
- **評価**: **Must** (データ分離の原則に反する)
- **推奨対応**:
  ```javascript
  // 新規作成: data/enemies.js
  Game.ENEMY_DATA = { SLIME: {...}, BAT: {...}, ... }
  ```
  - game_state.js から参照するように変更

---

### 2. 入力制御モジュール化

#### ✅ 実装済み
- `input/movement_controller.js`: キーリピートと移動制御を実装
- `input/overlay_controller.js`: オーバーレイ別の入力処理を実装
- `input/battle_input.js`: 戦闘入力を専用化
- `input.js`: モードルーターとして機能し、各コントローラへディスパッチ

#### ⚠️ ギャップ

**Gap 2.1: input モジュールのファイル配置**
- **現状**: `input.js` がルートディレクトリに配置
- **目標**: `input/index.js` として配置
- **評価**: **Better** (機能的には問題なし、構造的整合性の問題)
- **推奨対応**:
  - `input.js` → `input/index.js` へリネーム
  - ディレクトリ構造の一貫性向上

---

### 3. 描画レイヤー整理

#### ✅ 実装済み
- `renderer/camera.js`: ビューポート計算を提供
- `renderer/map_layer.js`: タイル描画を担当
- `renderer/entity_layer.js`: エンティティ描画を担当
- `renderer/ui_panel.js`: UIパネル描画を担当
- `renderer/overlay_layer.js`: オーバーレイ描画を担当
- `renderer/index.js`: レイヤーファサードとして機能

#### ⚠️ ギャップ

**Gap 3.1: drawAll() 関数の不在**
- **現状**: `sketch.js` が各レイヤーを直接呼び出し (32-37行)
  ```javascript
  Game.renderer.drawMap();
  Game.renderer.drawEntities();
  Game.renderer.drawUI();
  Game.renderer.drawOverlays();
  Game.renderer.drawBattleOverlay();
  Game.renderer.drawClearOverlay();
  ```
- **目標**: `renderer/index.js` に `drawAll()` を用意し、レイヤー配列を順番に呼び出す
- **評価**: **Better** (現状でも動作するが、拡張性に課題)
- **推奨対応**:
  ```javascript
  // renderer/index.js に追加
  function drawAll() {
    drawMap();
    drawEntities();
    drawUI();
    drawOverlays();
    drawBattleOverlay();
    drawClearOverlay();
  }
  ```
  - `sketch.js` では `Game.renderer.drawAll()` のみを呼ぶ
  - 描画順序変更がファイル単位で完結

---

### 4. エンティティと敵 AI

#### ✅ 実装済み
- `entities/sprite_atlas.js`: スプライト描画ヘルパーを提供
- `entities/enemy_director.js`: スポーン条件、リスポーン、追跡AIを実装
  - 占有判定を `Game.occupancy` から依存注入的に利用
  - パス探索を `Game.utils.findPath` から利用
- `entities/index.js`: 公開APIを束ねるファサード
- `entities/entity_types.js`: エンティティ種別定義

#### ✅ ギャップなし
このセクションは設計書通りに完全実装されている。

---

### 5. データ定義とメッセージ統一

#### ✅ 実装済み
- `messages/log.js`: 統一メッセージフォーマット `{ text, icon, tone }` を実装
  - `normalizeEntry()` で旧APIとの互換性を保持
  - `pushMessage()` のラッパー機能を提供
- アイテムメタ情報は `constants.js` の `ITEM_META` に集約

#### ⚠️ ギャップ

**Gap 5.1: data/items.js の不在**
- **現状**: アイテム定義が `constants.js` に配置
  - `ITEM`, `PRICE`, `ITEM_META` が constants.js に混在
- **目標**: `data/items.js` でアイテムメタ情報を一元管理
- **評価**: **Better** (現状でも動作するが、関心の分離が不十分)
- **推奨対応**:
  ```javascript
  // 新規作成: data/items.js
  Game.ITEMS = {
    FOOD10: {
      id: 'FOOD10',
      name: 'Food 10',
      detail: 'Food を 10 回復',
      price: 10,
    },
    // ...
  }
  ```
  - constants.js には ITEM enum のみ残す
  - メタ情報とプライス情報を data/items.js に移動

**Gap 5.2: data/maps/ の不在**
- **現状**: `map_data.js` 内に全マップがインラインで定義
  - ASCII文字列配列として直接記述
- **目標**: `data/maps/*.js` または JSON ファイルとして分離
- **評価**: **Better** (現状でも動作するが、マップ追加時の可読性に課題)
- **推奨対応**:
  - 各シーンを別ファイル化: `data/maps/field.js`, `data/maps/town.js` など
  - または JSON化: `data/maps/field.json`
  - `map_data.js` は読み込みと検証のみを担当

**Gap 5.3: メッセージフォーマット移行の完全性**
- **現状**: `Game.pushMessage()` は `messages/log.js` にフォールバックする実装
  - game_state.js:155-169 でラッパー実装
  - 一部の呼び出し元で旧形式 (文字列のみ) を使用している可能性
- **目標**: 全ての `pushMessage` 呼び出しが統一フォーマットを使用
- **評価**: **Better** (互換性レイヤーがあるため動作するが、統一が望ましい)
- **推奨対応**:
  - 全ての `pushMessage()` 呼び出しを検索
  - 可能な限り `{ text, icon?, tone? }` 形式に移行
  - ラッパーは移行期間後に削除を検討

---

## 成功判定との対比

設計書の「成功判定」セクションとの比較:

| 判定基準 | 現状 | 達成度 |
|---------|------|--------|
| `game_state.js` を 400 行未満に縮小 | 420行 | 95% |
| 責務ごとのファイル境界を明確化 | 明確に分離されている | 100% |
| `input` 配下でモード別クラスの単体テスト可能 | 構造的には可能 | 100% |
| 操作追加がファイル単位で完結 | 完結している | 100% |
| 描画レイヤーが `drawAll()` の順序差し替えで拡張可能 | drawAll()未実装 | 80% |
| 敵スポーンや追跡ロジックがモジュール単体でテスト可能 | 完全に分離されている | 100% |
| `Game.entities` から分離されている | 完全に分離されている | 100% |
| `pushMessage` が統一フォーマット | ほぼ統一、ラッパーあり | 90% |
| UI 表示の崩れがない | 問題なし | 100% |

**総合達成度: 96%**

---

## 優先度別ギャップ一覧

### Must (必須対応)

| ID | 項目 | 影響範囲 | 対応工数 |
|----|------|----------|----------|
| Gap 1.2 | ENEMY_DATA のデータモジュール化 | game_state.js, 新規 data/enemies.js | 小 (0.5h) |

### Better (推奨対応)

| ID | 項目 | 影響範囲 | 対応工数 |
|----|------|----------|----------|
| Gap 1.1 | game_state.js の行数削減 | Gap 1.2 対応で自動解決 | - |
| Gap 2.1 | input.js → input/index.js リネーム | input.js, index.html 読み込み順序 | 極小 (0.1h) |
| Gap 3.1 | drawAll() 関数の実装 | renderer/index.js, sketch.js | 小 (0.3h) |
| Gap 5.1 | data/items.js の作成 | constants.js, 新規 data/items.js | 中 (1h) |
| Gap 5.2 | data/maps/ へのマップ分離 | map_data.js, 新規 data/maps/*.js | 中 (1.5h) |
| Gap 5.3 | メッセージフォーマット全面移行 | dialogue.js, shop.js, inn.js など | 中 (1h) |

---

## 推奨実装順序

リファクタリング設計書の「タスク分解と優先度」に基づいた推奨順序:

1. **Gap 1.2 (Must)**: ENEMY_DATA のデータモジュール化
   - 他のデータ整理の基盤となる
   - 影響範囲が限定的で安全

2. **Gap 3.1 (Better)**: drawAll() 関数の実装
   - 描画システムの完成度向上
   - 今後の描画レイヤー追加に備える

3. **Gap 5.1 (Better)**: data/items.js の作成
   - データ/メッセージ統合の一環
   - Gap 1.2 と同じパターンで実装可能

4. **Gap 5.2 (Better)**: data/maps/ へのマップ分離
   - マップ追加時の作業効率向上
   - 現時点では優先度は低い (既存マップが安定している)

5. **Gap 2.1 (Better)**: input.js のリネーム
   - 構造的整合性の向上
   - 機能的な影響はないため最後でも可

6. **Gap 5.3 (Better)**: メッセージフォーマット全面移行
   - 継続的な改善タスク
   - 互換性レイヤーがあるため緊急性は低い

---

## 補足: 設計書にない追加実装

現在のコードベースには、設計書に明記されていないが適切に実装されている要素もあります:

✅ **追加モジュール (良好)**
- `renderer/layout.js`: レイアウト計算を分離
- `renderer/text_utils.js`: テキスト描画ユーティリティ
- `entities/entity_types.js`: エンティティ種別定義
- `utils.js`: 汎用ユーティリティ関数

これらは設計思想に沿った良い拡張です。

---

## 結論

**リファクタリングは96%完了しており、主要な目標はほぼ達成されています。**

- **Must対応**: 1項目のみ (ENEMY_DATAの分離)
- **Better対応**: 5項目 (いずれも動作に影響しない最適化)

現在のコードベースは:
- ✅ 責務分離が明確
- ✅ モジュール化が適切
- ✅ 拡張性が高い
- ✅ 保守性が向上している

残りのギャップは、さらなる品質向上のための「磨き」の段階です。緊急性は低いですが、長期的な保守性を考慮すると対応が推奨されます。
