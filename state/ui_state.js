(function () {
  // UI の表示状態とオーバーレイ操作を一元管理
  const Game = (window.Game = window.Game || {});

  if (!Game.OVERLAY) {
    throw new Error("Game.OVERLAY が未定義です。constants.js の読み込み順序を確認してください。");
  }

  const uiState = {
    overlay: null,
    shop: {
      mode: "BUY",
      selection: 0,
    },
    inventory: {
      selection: 0,
    },
    title: {
      selection: 0,
    },
    saveConfirm: {
      selection: 0,
    },
  };

  function resetShopState() {
    uiState.shop.mode = "BUY";
    uiState.shop.selection = 0;
  }

  function resetInventoryState() {
    uiState.inventory.selection = 0;
  }

  function resetTitleState() {
    uiState.title.selection = 0;
  }

  function resetSaveConfirmState() {
    uiState.saveConfirm.selection = 0;
  }

  function resetEndingState() {
    // エンディングは選択状態を持たない
  }

  function resetAll() {
    uiState.overlay = null;
    resetShopState();
    resetInventoryState();
    resetTitleState();
    resetSaveConfirmState();
    resetEndingState();
  }

  function openOverlay(type) {
    uiState.overlay = type;
    if (type === Game.OVERLAY.SHOP) {
      resetShopState();
    }
    if (type === Game.OVERLAY.INVENTORY) {
      resetInventoryState();
    }
    if (type === Game.OVERLAY.TITLE) {
      resetTitleState();
    }
    if (type === Game.OVERLAY.SAVE_CONFIRM) {
      resetSaveConfirmState();
    }
    if (type === Game.OVERLAY.ENDING) {
      resetEndingState();
    }
  }

  function closeOverlay() {
    uiState.overlay = null;
  }

  function isOverlayOpen() {
    return !!uiState.overlay;
  }

  Game.ui = {
    state: uiState,
    OVERLAY: Game.OVERLAY,
    open: openOverlay,
    close: closeOverlay,
    isOpen: isOverlayOpen,
    resetShop: resetShopState,
    resetInventory: resetInventoryState,
    resetTitle: resetTitleState,
    resetSaveConfirm: resetSaveConfirmState,
    resetAll,
  };
})();
