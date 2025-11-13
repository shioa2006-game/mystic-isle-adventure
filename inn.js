(function () {
  // 宿屋での会話と宿泊を管理
  const Game = (window.Game = window.Game || {});

  const INN_COST = 10;
  const innState = {
    selection: 0,
  };

  const OPTIONS = [
    { key: "Y", label: "Y / Enter: 泊まる (10G)", action: stayAtInn },
    {
      key: "N",
      label: "N: やめる",
      action() {
        closeInn();
        Game.pushMessage({ text: "またどうぞ。" });
      },
    },
    {
      key: "ESC",
      label: "Esc: 閉じる",
      action() {
        closeInn();
      },
    },
  ];

  function resetSelection() {
    innState.selection = 0;
  }

  function tryOpenInn() {
    const state = Game.state;
    if (state.scene !== state.innkeeper.scene) {
      Game.pushMessage({ text: "ここには宿屋がない。" });
      return false;
    }
    if (!Game.utils.isAdjacent(state.playerPos, state.innkeeper.pos)) {
      Game.pushMessage({ text: "もう一歩近づこう。" });
      return false;
    }
    Game.pushMessage({ text: "宿屋主人: いらっしゃいませ。一晩 10G で泊まっていきますか？" });
    resetSelection();
    Game.ui.open(Game.ui.OVERLAY.INN);
    return true;
  }

  function closeInn() {
    if (Game.ui.state.overlay === Game.ui.OVERLAY.INN) {
      Game.ui.close();
    }
  }

  function handleInput(keyValue, keyCode) {
    const upper = (keyValue || "").toUpperCase();
    if (keyCode === window.UP_ARROW) {
      moveSelection(-1);
      return;
    }
    if (keyCode === window.DOWN_ARROW) {
      moveSelection(1);
      return;
    }
    if (keyCode === window.ENTER) {
      confirmSelection();
      return;
    }
    if (keyCode === window.ESCAPE || upper === "ESCAPE") {
      selectByKey("ESC");
      return;
    }
    if (upper === "Y") {
      selectByKey("Y");
      return;
    }
    if (upper === "N") {
      selectByKey("N");
      return;
    }
  }

  function moveSelection(delta) {
    const next = Game.utils.clamp(
      innState.selection + delta,
      0,
      Math.max(0, OPTIONS.length - 1)
    );
    innState.selection = next;
  }

  function confirmSelection() {
    const option = OPTIONS[innState.selection];
    if (option && typeof option.action === "function") {
      option.action();
    }
  }

  function selectByKey(keyName) {
    const idx = OPTIONS.findIndex((option) => option.key === keyName);
    if (idx >= 0) {
      innState.selection = idx;
      confirmSelection();
    }
  }

  function stayAtInn() {
    const player = Game.state.player;
    if (player.hp >= player.maxHp) {
      Game.pushMessage({ text: "HP は既に最大だ。" });
      return;
    }
    if (player.gold < INN_COST) {
      Game.pushMessage({ text: "Gold が足りない。" });
      return;
    }
    player.gold -= INN_COST;
    player.hp = player.maxHp;
    Game.pushMessage({ text: `${INN_COST}G を支払った。` });
    Game.pushMessage({ text: "ぐっすり眠り、HP が完全に回復した。" });
    closeInn();
  }

  function getState() {
    return innState;
  }

  function getOptions() {
    return OPTIONS;
  }

  Game.inn = {
    tryOpen: tryOpenInn,
    close: closeInn,
    handleInput,
    getState,
    getOptions,
  };
})();
