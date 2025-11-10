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
  };

  function resetShopState() {
    uiState.shop.mode = "BUY";
    uiState.shop.selection = 0;
  }

  function resetInventoryState() {
    uiState.inventory.selection = 0;
  }

  function resetAll() {
    uiState.overlay = null;
    resetShopState();
    resetInventoryState();
  }

  function openOverlay(type) {
    uiState.overlay = type;
    if (type === Game.OVERLAY.SHOP) {
      resetShopState();
    }
    if (type === Game.OVERLAY.INVENTORY) {
      resetInventoryState();
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
    resetAll,
  };
})();
