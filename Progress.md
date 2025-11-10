# Progress
## 2025-02-13
- config.js / constants.js を追加し、キャンバス設定と列挙定数を game_state.js から分離。
- state/ui_state.js を新設し、Game.ui でオーバーレイ・ショップ・インベントリ表示を集約。
- game_state.js から UI ロジックと LV_THRESH 重複定義を削除し、依存モジュール未読込時のガードを追加。
## 2025-02-14
- state/player_state.js を追加し、プレイヤー初期化・進行フラグ・所持品・経験値処理をモジュール化。
- state/occupancy.js を導入し、占有マップ・進入判定・イベント管理を分離。
- game_state.js を薄いファサード化し、入口タイルで進入できない不具合を修正。
- input コントローラ群（movement/overlay/battle）を実装してモード別に分割し、input.js は各コントローラのディスパッチに専念する構成へ変更。
## 2025-02-15
- renderer を layout / camera / text_utils / map_layer / entity_layer / ui_panel / overlay_layer / index に分割し、描画責務をレイヤー化。
- entities を entity_types / sprite_atlas / enemy_director / index に再構成し、フィールド遺跡前でドラゴンを固定スポーンさせるロジックを導入。
- 宿屋オーバーレイをショップ同様の選択 UI へ刷新し、矢印キーと Enter で選択できるよう改善。
- 遺跡座標とドラゴン配置を同期し、王のセリフなど日本語メッセージを整備。
## 2025-02-16
- index.html の操作説明テキストを修正し、UTF-8 で正常表示されるようにした。
- 洞窟の敵テーブルを見直し、クモをフィールド専用とし、洞窟はゴースト/ヴァンパイア/トロールのみに制限。
- messages/log.js を追加し、`Game.pushMessage` を `{ text, icon?, tone }` 形式のファサード経由に統一。メッセージ整形が簡素化された。

## 現在のファイル構成
AGENTS.md
combat.js
config.js
constants.js
dialogue.js
GAME_DESIGN.md
game_state.js
Gap.md
index.html
inn.js
input.js
map_data.js
Progress.md
README.md
shop.js
sketch.js
style.css
utils.js
assets\actors.png
assets\dialogues.json
assets\enemies.png
assets\objects_interactable.png
assets\tiles.png
entities\enemy_director.js
entities\entity_types.js
entities\index.js
entities\sprite_atlas.js
input\battle_input.js
input\movement_controller.js
input\overlay_controller.js
messages\log.js
renderer\camera.js
renderer\entity_layer.js
renderer\index.js
renderer\layout.js
renderer\map_layer.js
renderer\overlay_layer.js
renderer\text_utils.js
renderer\ui_panel.js
state\occupancy.js
state\player_state.js
state\ui_state.js

