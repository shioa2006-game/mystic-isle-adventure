# GAME_DESIGN.md
# Mystic Isle Adventure - 追加開発設計書（DevLog #2 対応）

## 目的
- DevLog.md「２．Mystic Isle Adventure -今後の追加開発」で合意した拡張（古代剣ミッション／遺跡拡張）を、既存コード構造に沿って実装するための設計方針をまとめる。
- 既存システム（p5.js＋Game.* モジュール群）の制約を踏まえ、追加で必要となるデータ構造・フラグ・イベント処理を明文化する。

## 現行仕様の整理（実装把握）
- シーン構成は `constants.js` の `SCENE` に定義済み。遺跡は `RUINS`（1F）と `RUINS_B2`（2F）までで、ドラゴンは `Game.EVENTS.RUINS_B2.dragon` で固定配置されている。
- 敵スポーンは `entities/enemy_director.js` でシーンごとに管理。固定敵（鍛冶屋ガーディアン）のような persistent 敵は `Game.story.ensureStoryEnemies()` から `Game.entities.spawnFixedEnemy` を使って生成している。
- 進行フラグは `state/player_state.js` の `createProgressFlags` が中心。聖鉱石取得フラグ（hasOre）、聖剣鍛造フラグ（holySwordCreated）、聖盾授与フラグ（hasHolyShield）などがあるが、Ancient Sword / 新鍵扉用のフラグは未定義。
- 聖剣鍛造は `game_state.tryForgeHolySword` で「IRON_SWORD + HOLY_ORE → HOLY_SWORD」。聖盾授与は `tryGrantHolyShield`。ドラゴン特殊ルール（聖剣なし攻撃0、聖盾なし被ダメ2倍）は `combat.js` に実装済み。
- マップとワープは `map_data.js` で管理。`Game.EVENTS` には遺跡入口・洞窟2入口・聖鉱石宝箱が登録され、`state/occupancy.js` がタイルイベントとして処理する。

## 追加開発仕様（DevLog #2 反映）
### 新ゲームフロー（フェーズ）
1. START：王様から竜討伐クエスト受注（現行どおり）
2. 鍛冶屋救出（洞窟1）→ 力のハンマー入手
3. 聖鉱石入手（洞窟2 B2 宝箱）
4. 古代剣ミッション開始：聖鉱石を見せると鍛冶屋が「古代の剣が必要」と説明 → 王様から Ancient Key 受領
5. 古代剣入手（遺跡2F）：鍵付き扉を Ancient Key で開け、固定ダークナイト3体を撃破 → 宝箱から Ancient Sword 入手
6. 聖剣錬成（街の鍛冶屋）：Holy Ore + Ancient Sword → Holy Sword（素材は消費）
7. 聖盾入手（王様）：聖剣完成後に授与（現行仕様踏襲）
8. 最終決戦（遺跡3F）：ドラゴン配置。1F〜3Fの出入り自由だが聖剣/聖盾なしだと特殊ルールにより実質攻略不可。

### マップ・シーン設計
- 遺跡を3階構成に拡張し、ドラゴン配置を3Fへ移動。
  - 新シーンID：`SCENE.RUINS_B3` を `constants.js` に追加し、ラベルも拡張。
  - マップデータ：`data/maps/ruins_3f.js` を新規作成。`map_data.js` の `Game.mapData` に3Fを登録し、1F⇔2F⇔3Fの階段ワープを定義し直す（ドラゴンイベントは3Fへ移動）。
- 鍵付き扉の設置：遺跡2Fに Ancient Sword 部屋への扉を配置。
  - タイルは `TILE.DOOR` を使用し、`Game.EVENTS` に「鍵付き扉イベント」を追加（warpData に `event: "RUINS_KEY_DOOR"` のような識別子を付与）。
  - 1回通過後は常時オープン扱いにするため、`Game.flags` に開錠済みフラグを保持し、占有マップ再構築時に通行可能タイルとして扱う。

### アイテム・フラグ・進行管理
- アイテム追加：
  - `ANCIENT_SWORD`（剣カテゴリ・ATK は Holy Sword より低め）を `constants.js` / `data/items.js` に追加。宝箱報酬に使用。
  - `ANCIENT_KEY` は既存定義を流用し、イベントで授与＆扉通過時に消費。
- 進行フラグ追加（`state/player_state.js`）：
  - `hasAncientKey`（鍵保有）、`ancientDoorOpened`（扉開放済み）、`hasAncientSword`（宝箱入手済み）、`ruins3Unlocked`（3F到達用ワープ開放）などを新設。
  - リセット処理・セーブデータ適用時に新フラグを初期化／復元する。
- ストーリーフェーズ追加（`dialogue.js`）：
  - 聖鉱石入手後〜聖剣完成前に「古代剣入手フェーズ」を挟み、`STORY_PHASE` と会話分岐を追加。鍛冶屋・王様の台詞で古代剣ミッション開始と鍵授与を誘導する。
- 聖剣錬成レシピ変更（`game_state.tryForgeHolySword`）：
  - 条件を「HOLY_ORE + ANCIENT_SWORD」に変更し、素材消費とメッセージを更新する。

### イベント／会話設計
- 鍛冶屋イベント：
  - 聖鉱石を見せた際に古代剣の必要性を説明し、`hasOre` を維持しつつ「鍵は王様へ」導線を出す。
  - 聖剣完成時のメッセージを古代剣素材に合わせて更新。
- 王様イベント：
  - 聖鉱石提示後に Ancient Key を授与する会話を追加。所持済みの場合は再授与しない。
  - 聖剣完成後の聖盾授与は既存処理を継続。
- 鍵付き扉イベント（遺跡2F）：
  - 扉に入ると、Ancient Key 未所持なら通行不可メッセージ。所持時は消費して開錠、`ancientDoorOpened` を true にし、以後は素通り。
  - 宝箱は既存の `handleChestEvent` で管理し、`Game.EVENTS` に遺跡2F宝箱を登録。取得時に `hasAncientSword` を立てる。

### 敵配置・バランス
- 固定ダークナイト3体（宝箱ガーディアン）：
  - 遺跡2Fの宝箱周囲に `ENEMY_KIND.DARK_KNIGHT` を persistent 配置。
  - 実装は鍛冶屋ガーディアンと同様に `Game.story.ensureStoryEnemies` 内で `spawnFixedEnemy` を呼び出し、撃破状態をフラグで保持し再スポーンさせない。
- 通常スポーン調整：
  - `entities/enemy_director.js` のスポーン対象シーンに `RUINS_B3` を追加。ドラゴンは通常スポーンから除外し、`Game.EVENTS` の専用配置で管理。
  - 3Fはドラゴン専用フロアとし、通常の雑魚スポーンは不要なら min/max を 0 にする、またはスポーン関数で除外する。
- ドラゴン移動：
  - `Game.EVENTS.RUINS_B2.dragon` を削除し、`RUINS_B3` に配置。`enemy_director` の DRAGON_SCENE も `RUINS_B3` に更新。

### セーブ・ロード
- `save_system.js` のスナップショットに新規フラグ（鍵・扉・古代剣取得・ガーディアン撃破・遺跡3F開放）を含める。
- `Game.story.syncWorldStateFromFlags` で
  - 鍵付き扉開放済みならマップ占有を通行可に反映。
  - ダークナイト撃破済みなら再生成しない。

### 実装タスクと主要改修箇所
- 定数・データ：`constants.js`（シーン/アイテム追加）、`data/items.js`（Ancient Sword 定義）、`data/maps/ruins_*.js`（3F新規＋1F/2F再配置）。
- マップ／イベント：`map_data.js`（ワープ定義更新、鍵付き扉イベント登録、ドラゴンイベント移動）、`state/occupancy.js`（鍵扉イベント処理を追加）。
- ストーリー／フラグ：`state/player_state.js`（新フラグ追加・初期化）、`game_state.js`（聖剣レシピ変更、鍵扉処理、固定ダークナイト生成、ドラゴン移動）、`dialogue.js`（新フェーズと会話追加）。
- 敵：`entities/enemy_director.js`（遺跡3F対応、DRAGON_SCENE 更新）、`entities/sprite_atlas.js` などは既存スプライトを流用。
- 保存：`save_system.js`（新フラグを保存/復元）、`Game.story.syncWorldStateFromFlags` の呼び出し確認。

以上を実装することで、DevLog 記載の新フロー（Ancient Key → Ancient Sword → Holy Sword → Holy Shield → Dragon）が、既存コードベースと矛盾なく動作する。*** End Patch
