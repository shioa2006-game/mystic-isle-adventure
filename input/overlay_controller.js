(function () {
  // オーバーレイ表示中のキー操作を担当
  const Game = (window.Game = window.Game || {});

  if (!Game.ui || !Game.ui.state) {
    throw new Error("OverlayController の初期化に失敗しました。Game.ui が未設定です。");
  }

  function handleInput(type, keyValue, keyCode) {
    switch (type) {
      case Game.ui.OVERLAY.TITLE:
        handleTitleOverlayInput(keyValue, keyCode);
        break;
      case Game.ui.OVERLAY.SHOP:
        Game.shop.handleInput(keyValue, keyCode);
        break;
      case Game.ui.OVERLAY.INVENTORY:
        handleInventoryOverlayInput(keyValue, keyCode);
        break;
      case Game.ui.OVERLAY.STATUS:
        handleStatusOverlayInput(keyValue, keyCode);
        break;
      case Game.ui.OVERLAY.INN:
        Game.inn.handleInput(keyValue, keyCode);
        break;
      default:
        break;
    }
  }

  function handleTitleOverlayInput(keyValue, keyCode) {
    if (keyCode === window.ENTER) {
      Game.ui.close();
      Game.startGame();
    }
  }

  function toggleInventory() {
    if (Game.ui.state.overlay === Game.ui.OVERLAY.INVENTORY) {
      Game.ui.close();
    } else {
      Game.ui.open(Game.ui.OVERLAY.INVENTORY);
    }
  }

  function toggleStatus() {
    if (Game.ui.state.overlay === Game.ui.OVERLAY.STATUS) {
      Game.ui.close();
    } else {
      Game.ui.open(Game.ui.OVERLAY.STATUS);
    }
  }

  function handleInventoryOverlayInput(keyValue, keyCode) {
    const invState = Game.ui.state.inventory;
    const inventory = Game.state.player.inventory;
    const upper = (keyValue || "").toUpperCase();
    if (keyCode === window.ESCAPE || upper === "ESCAPE" || upper === "I") {
      Game.ui.close();
      return;
    }
    if (keyCode === window.UP_ARROW) {
      invState.selection = Game.utils.clamp(invState.selection - 1, 0, Math.max(0, inventory.length - 1));
      return;
    }
    if (keyCode === window.DOWN_ARROW) {
      invState.selection = Game.utils.clamp(invState.selection + 1, 0, Math.max(0, inventory.length - 1));
      return;
    }
    if (upper === "U") {
      useSelectedInventoryItem();
      return;
    }
    if (keyCode === window.ENTER) {
      describeSelectedItem();
    }
  }

  function handleStatusOverlayInput(keyValue, keyCode) {
    const upper = (keyValue || "").toUpperCase();
    if (keyCode === window.ESCAPE || upper === "ESCAPE" || upper === "S") {
      Game.ui.close();
    }
  }

  function useSelectedInventoryItem() {
    const inventory = Game.state.player.inventory;
    if (!inventory.length) {
      Game.pushMessage({ text: "所持品は空だ。" });
      return;
    }
    const index = Game.utils.clamp(
      Game.ui.state.inventory.selection,
      0,
      Math.max(0, inventory.length - 1)
    );
    const result = Game.useItemByIndex(index);
    Game.pushMessage({ text: result.message });
    if (result.success && result.consumed) {
      const nextLength = Game.state.player.inventory.length;
      if (nextLength === 0) {
        Game.ui.state.inventory.selection = 0;
      } else if (Game.ui.state.inventory.selection >= nextLength) {
        Game.ui.state.inventory.selection = nextLength - 1;
      }
      Game.occupancy.markDirty();
    }
  }

  function describeSelectedItem() {
    const inventory = Game.state.player.inventory;
    if (!inventory.length) {
      Game.pushMessage({ text: "所持品は空だ。" });
      return;
    }
    const index = Game.utils.clamp(
      Game.ui.state.inventory.selection,
      0,
      Math.max(0, inventory.length - 1)
    );
    const itemId = inventory[index];
    Game.pushMessage({ text: Game.describeItem(itemId) });
  }

  Game.controllers = Game.controllers || {};
  Game.controllers.overlay = {
    handleInput,
    toggleInventory,
    toggleStatus,
  };
})();
