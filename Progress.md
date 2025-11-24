# 進捗まとめ
- 対応済み: `Game.story` に `tryGiveAncientKey` を公開し、王様会話から Ancient Key が正常に授与されるようにした。
- 対応済み: 遺跡2F鍵付き扉イベントを `resolveTileEvent` で処理し、Ancient Key 所持確認→消費→`ancientDoorOpened`/`ruins3Unlocked` 立て→通行解放を実装。
- 対応済み: 遺跡2F宝箱で `ANCIENT_SWORD` 入手時に `hasAncientSword` を立て、ストーリーフェーズが進むよう修正。
- 対応済み: 古代剣宝箱ガーディアン用の固定ダークナイト生成と撃破フラグ管理を追加（`ancientGuardians` を参照し再スポーン抑止）。
- 対応済み: 進行フラグに `ruins3Unlocked` を追加し、セーブ/ロードに含めるよう更新。
