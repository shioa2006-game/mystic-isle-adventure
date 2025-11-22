# 追加開発と現行コードの差分メモ

- セリフ/メッセージの文字化け・内容差異
  - `dialogue.js` / `assets/dialogues.json` の王様/鍛冶屋/神父セリフが設計書の日本語と一致しておらず、文字化けも残っている。設計書記載のセリフに差し替えが必要。

---

## NPCダイアログ・ストーリーフロー統合表

### フェーズ別・NPC統合マトリックス表

| 項目 | フェーズ0<br>**START** | フェーズ1<br>**BLACKSMITH_RESCUED** | フェーズ2<br>**ORE_OBTAINED** | フェーズ3<br>**HOLY_SWORD_CREATED** | フェーズ4<br>**DRAGON_DEFEATED** |
|:---|:---|:---|:---|:---|:---|
| **到達条件（フラグ）** | ゲーム開始時 | `blacksmithRescued=true` | `hasOre=true` | `holySwordCreated=true` | `dragonDefeated=true` |
| **王様のセリフ** | 「よく来た、若き冒険者よ...竜が現れた...鍛冶屋が行方不明」 | 「鍛冶屋を助けてくれたそうだな...聖鉱石が欠かせぬ」 | 「聖鉱石を見つけたのだな...早く鍛冶屋に届け」 | 「おお、見事な聖剣だ！...約束通り、聖盾を授けよう」 | 「竜を倒し、島を救ってくれて感謝するぞ！」 |
| **鍛冶屋のセリフ** | 「助けてくれて本当に感謝する！...聖鉱石はここにはなかった」 | 「命の恩人だ。礼に力のハンマーを渡そう...東の海岸に岩で塞がれた洞窟...」 | 「おお、これこそ聖鉱石だ！...**聖剣を鍛えるには鉄の剣も必要だ**」 | 「聖盾は王様に頼んで受け取ってくれ。」 | （セリフ定義なし） |
| **神父のセリフ** | 「ようこそ、旅の冒険者よ...ここで祈れば旅路を記録できる」 | （フェーズ0と同じ） | （フェーズ0と同じ） | （フェーズ0と同じ） | （フェーズ0と同じ） |
| **会話後イベント** | **王**: `questTalked=true`, `questGiven=true`<br>**鍛**: `finalizeBlacksmithRescue()` | **鍛**: `tryGivePowerHammer()` | **鍛**: `tryForgeHolySword()` | **王**: `tryGrantHolyShield()` | - |
| **必要アイテム** | - | インベントリ空き1枠 | **鉄の剣** + 聖鉱石 | インベントリ空き1枠 | - |
| **成功時メッセージ** | **鍛**: 「鍛冶屋は無事に街へ戻っていった。」 | 「Power Hammer を受け取った。」 | 「鍛冶屋が聖剣を鍛え上げた！」 | 「聖盾を授かった！」 | - |
| **失敗時メッセージ** | - | 「インベントリの空きが必要だ。」 | **「鉄の剣を持っていないため、鍛冶が始められない。」**<br>または<br>「聖鉱石を所持していない。」 | 「インベントリの整理が必要だ。」 | - |
| **獲得アイテム** | - | **力のハンマー** | **聖剣**<br>（鉄の剣と聖鉱石を消費） | **聖盾** | - |


---

### 詳細情報

#### フェーズ0: START
**実装場所**:
- セリフ: `assets/dialogues.json:14-46`
- 王様イベント: `dialogue.js:203-206`
- 鍛冶屋イベント: `dialogue.js:210-219`, `game_state.js:177-185`

**王様の会話後処理**:
```javascript
// dialogue.js:203-206
if (session.characterId === "king" && session.phase === STORY_PHASE.START && Game.flags) {
  Game.flags.questTalked = true;
  Game.flags.questGiven = true;
}
```

**鍛冶屋の会話後処理**:
```javascript
// dialogue.js:210-219 → game_state.js:177-185
function finalizeBlacksmithRescue() {
  if (!progressFlags.blacksmithFreed || progressFlags.blacksmithRescued) return;
  progressFlags.blacksmithRescued = true;
  progressFlags.blacksmithFreed = false;
  moveBlacksmithToTown();  // 鍛冶屋を街へ移動
  pushMessage({ text: "鍛冶屋は無事に街へ戻っていった。" });
}
```

---

#### フェーズ1: BLACKSMITH_RESCUED
**実装場所**:
- セリフ: `assets/dialogues.json:20-51`
- 鍛冶屋イベント: `dialogue.js:220-227`, `game_state.js:196-209`

**鍛冶屋の会話後処理**:
```javascript
// dialogue.js:220-227 → game_state.js:196-209
function tryGivePowerHammer() {
  if (!progressFlags.blacksmithRescued || progressFlags.hasHammer) return;
  const result = forceAddStoryItem(ITEM.POWER_HAMMER);
  if (!result.success) {
    pushMessage({ text: "インベントリの空きが必要だ。" });
    return;
  }
  progressFlags.hasHammer = true;
  pushMessage({ text: "Power Hammer を受け取った。" });
}
```

---

#### フェーズ2: ORE_OBTAINED（最重要）
**実装場所**:
- セリフ: `assets/dialogues.json:25-56`
- 鍛冶屋イベント: `dialogue.js:228-235`, `game_state.js:211-236`

**鍛冶屋の会話後処理**:
```javascript
// dialogue.js:228-235 → game_state.js:211-236
function tryForgeHolySword() {
  if (!progressFlags.hasOre || progressFlags.holySwordCreated) return;
  const player = state.player;

  // 🔍 鉄の剣チェック（game_state.js:214-217）
  if (!PlayerState.hasItem(player, ITEM.IRON_SWORD)) {
    pushMessage({ text: "鉄の剣を持っていないため、鍛冶が始められない。" });
    return;
  }

  // 🔍 聖鉱石チェック（game_state.js:218-222）
  if (!PlayerState.hasItem(player, ITEM.HOLY_ORE)) {
    pushMessage({ text: "聖鉱石を所持していない。" });
    progressFlags.hasOre = false;
    return;
  }

  // ✅ 成功: アイテムを消費して聖剣を作成
  PlayerState.removeItemById(player, ITEM.IRON_SWORD);
  PlayerState.removeItemById(player, ITEM.HOLY_ORE);
  progressFlags.hasOre = false;
  const result = forceAddStoryItem(ITEM.HOLY_SWORD);
  if (!result.success) {
    pushMessage({ text: "インベントリに空きが必要だ。" });
    return;
  }
  progressFlags.holySwordCreated = true;
  pushMessage({ text: "鍛冶屋が聖剣を鍛え上げた！" });
}
```

**重要**:
- セリフでは「鉄の剣も必要だ」と言うだけで、アイテムチェックは**会話終了後**に実行される
- プレイヤーが鉄の剣を持っていない場合、セリフは表示されるがアイテム作成は失敗する

---

#### フェーズ3: HOLY_SWORD_CREATED
**実装場所**:
- セリフ: `assets/dialogues.json:29-61`
- 王様イベント: `dialogue.js:236-243`, `game_state.js:238-251`

**王様の会話後処理**:
```javascript
// dialogue.js:236-243 → game_state.js:238-251
function tryGrantHolyShield() {
  if (!progressFlags.holySwordCreated || progressFlags.hasHolyShield) return;
  const result = forceAddStoryItem(ITEM.HOLY_SHIELD);
  if (!result.success) {
    pushMessage({ text: "インベントリの整理が必要だ。" });
    return;
  }
  progressFlags.hasHolyShield = true;
  pushMessage({ text: "聖盾を授かった！" });
}
```

---

#### フェーズ4: DRAGON_DEFEATED
**実装場所**:
- セリフ: `assets/dialogues.json:34-36`
- 会話後イベント: なし

**備考**: エンディング相当のフェーズ。会話のみで追加処理なし。

---

### フェーズ判定ロジック

**実装場所**: `dialogue.js:263-270`, `dialogue.js:272-277`

```javascript
function getCurrentPhase() {
  const story = Game.flags || {};
  if (story.dragonDefeated) return STORY_PHASE.DRAGON_DEFEATED;      // 4
  if (story.holySwordCreated) return STORY_PHASE.HOLY_SWORD_CREATED; // 3
  if (story.hasOre) return STORY_PHASE.ORE_OBTAINED;                 // 2
  if (story.blacksmithRescued) return STORY_PHASE.BLACKSMITH_RESCUED;// 1
  return STORY_PHASE.START;                                          // 0
}

function getPhaseForCharacter(characterId) {
  // 鍛冶屋は特別処理: 救出前は常にフェーズ0
  if (characterId === "blacksmith" && !Game.flags.blacksmithRescued) {
    return STORY_PHASE.START;
  }
  return getCurrentPhase();
}
```

---

### セリフのフォールバック機能

**実装場所**: `dialogue.js:114-127`

```javascript
function findLines(characterId, phase) {
  const character = getCharacter(characterId);
  if (!character || !character.dialogues) return null;
  let target = phase;
  while (target >= 0) {
    const key = String(target);
    const lines = character.dialogues[key];
    if (Array.isArray(lines) && lines.length > 0) {
      return { lines, phase: target };
    }
    target -= 1;  // 📌 見つからない場合、前のフェーズにフォールバック
  }
  return null;
}
```

**重要**: 現在のフェーズにセリフが定義されていない場合、自動的に過去のフェーズのセリフを使用する。

---

### 会話クールダウン機能

**実装場所**: `dialogue.js:23`, `dialogue.js:136-139`, `dialogue.js:246`, `dialogue.js:283-285`

```javascript
// 会話終了後、プレイヤーが1回移動するまで新しい会話を開始できない
dialogueState.cooldownUntilMove = false;

// 会話開始時チェック
if (dialogueState.cooldownUntilMove && !session.active) {
  return;  // クールダウン中は新規会話を開始しない
}

// 会話終了時にクールダウン設定
dialogueState.cooldownUntilMove = true;

// 移動時にクールダウン解除（input.js等で呼ばれる）
Game.dialogue.clearCooldown();
```

---

## まとめ

### 鉄の剣問題の核心

**質問**: 「鉄の剣を持たずに鍛冶屋に話しかけたらどういうセリフを言うのか？」

**回答**:
1. **セリフは通常通り表示される**: 「鉄の剣も必要だ。商人から手に入れて持ってきてくれ」（`dialogues.json:52-56`）
2. **会話終了後、アイテムチェックが実行される**: `tryForgeHolySword()` が呼ばれる（`dialogue.js:234`）
3. **鉄の剣がない場合のメッセージ**: 「鉄の剣を持っていないため、鍛冶が始められない。」（`game_state.js:215`）
4. **結果**: セリフは見れるが、聖剣は作成されない

### アーキテクチャの特徴

- **セリフとロジックの分離**: dialogues.jsonはセリフのみを管理し、アイテムチェックはJavaScript側で実装
- **イベント駆動型**: 会話終了時（`completeSession()`）に各種イベント処理が発火
- **フラグベースの状態管理**: `progressFlags`でゲーム進行を追跡
- **フォールバック機構**: セリフが定義されていない場合、自動的に過去のフェーズを使用
