(function () {
  // 各種オーバーレイの描画
  const Game = (window.Game = window.Game || {});
  const { overlayArea } = Game.rendererLayout;
  const { estimateWrappedLineCount } = Game.rendererUtils;

  function drawOverlays(p = window) {
    const overlay = Game.ui.state.overlay;
    if (!overlay) return;
    switch (overlay) {
      case Game.ui.OVERLAY.TITLE:
        drawTitleOverlay(p);
        break;
      case Game.ui.OVERLAY.SHOP:
        drawShopOverlay(p);
        break;
      case Game.ui.OVERLAY.INVENTORY:
        drawInventoryOverlay(p);
        break;
      case Game.ui.OVERLAY.STATUS:
        drawStatusOverlay(p);
        break;
      case Game.ui.OVERLAY.INN:
        drawInnOverlay(p);
        break;
      default:
        break;
    }
  }

  function drawShopOverlay(p) {
    drawOverlayFrame(p);
    const state = Game.shop.getState();
    const buyOptions = Game.shop.getBuyOptions();
    const sellOptions = Game.shop.getSellOptions();
    const isSellMode = state.mode === "SELL";
    const list = isSellMode ? sellOptions : buyOptions;
    const selection = Math.min(state.selection, Math.max(list.length - 1, 0));
    p.fill(255);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(18);
    p.text("SHOP", overlayArea.x + 16, overlayArea.y + 14);
    p.textSize(16);
    p.text(
      `表示: ${isSellMode ? "Sell" : "Buy"} リスト / Gold ${Game.state.player.gold}`,
      overlayArea.x + 16,
      overlayArea.y + 44
    );
    let contentY = overlayArea.y + 72;
    if (!list.length) {
      const empty = isSellMode ? "売却できる物がない。" : "購入できる物がない。";
      p.text(empty, overlayArea.x + 16, contentY);
      return;
    }
    list.forEach((entry, index) => {
      const isSelected = index === selection;
      if (isSelected) {
        p.fill(40, 120, 200, 180);
        p.rect(overlayArea.x + 12, contentY - 4, overlayArea.width - 24, 28, 6);
        p.fill(255);
      } else {
        p.fill(220);
      }
      const label = entry.label || entry.name || entry.itemId;
      const price = entry.price != null ? `${entry.price}G` : "";
      p.text(`${label}  ${price}`, overlayArea.x + 20, contentY);
      contentY += 28;
    });
    const selected = list[selection];
    if (selected && selected.detail) {
      p.fill(220);
      p.textSize(14);
      const text = selected.detail;
      const width = overlayArea.width - 32;
      const lineCount = estimateWrappedLineCount(p, text, width);
      p.text(text, overlayArea.x + 16, overlayArea.y + overlayArea.height - lineCount * 18 - 16, width);
    }
  }

  function drawInventoryOverlay(p) {
    drawOverlayFrame(p);
    const inventory = Game.state.player.inventory;
    const selection = Game.ui.state.inventory.selection;
    p.fill(255);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(18);
    p.text("INVENTORY", overlayArea.x + 16, overlayArea.y + 14);
    p.textSize(16);
    if (!inventory.length) {
      p.text("所持品は空だ。", overlayArea.x + 16, overlayArea.y + 56);
      return;
    }
    let contentY = overlayArea.y + 52;
    inventory.forEach((itemId, index) => {
      const equippedMark = Game.isItemEquipped(index) ? " (装備中)" : "";
      const meta = Game.ITEM_META[itemId];
      const name = meta ? meta.name : itemId;
      const isSelected = index === selection;
      if (isSelected) {
        p.fill(40, 120, 200, 180);
        p.rect(overlayArea.x + 12, contentY - 4, overlayArea.width - 24, 26, 6);
        p.fill(255);
      } else {
        p.fill(220);
      }
      p.text(`${name}${equippedMark}`, overlayArea.x + 20, contentY);
      contentY += 26;
    });
    const selectedId = inventory[Math.min(selection, inventory.length - 1)];
    if (selectedId) {
      const meta = Game.ITEM_META[selectedId];
      if (meta && meta.detail) {
        const detailY = overlayArea.y + overlayArea.height - 60;
        p.fill(200);
        p.text(meta.detail, overlayArea.x + 20, detailY);
      }
    }
  }

  function drawStatusOverlay(p) {
    drawOverlayFrame(p);
    const player = Game.state.player;
    const stats = Game.getPlayerEffectiveStats();
    p.fill(255);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(18);
    p.text("STATUS", overlayArea.x + 16, overlayArea.y + 14);
    p.textSize(16);
    const lines = [
      `HP: ${player.hp}/${player.maxHp}`,
      `LV: ${player.lv}  EXP: ${player.exp}`,
      `ATK/DEF: ${stats.atk} / ${stats.def}`,
      `Food: ${player.food}`,
      `Gold: ${player.gold}`,
    ];
    lines.forEach((line, idx) => {
      p.text(line, overlayArea.x + 16, overlayArea.y + 52 + idx * 24);
    });
  }

  function drawInnOverlay(p) {
    drawOverlayFrame(p);
    const state = Game.inn.getState();
    const options = Game.inn.getOptions();
    p.fill(255);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(18);
    p.text("INN", overlayArea.x + 16, overlayArea.y + 14);
    p.textSize(16);
    options.forEach((option, index) => {
      const isSelected = index === state.selection;
      const rowY = overlayArea.y + 48 + index * 28;
      if (isSelected) {
        p.fill(40, 120, 200, 180);
        p.rect(overlayArea.x + 12, rowY - 4, overlayArea.width - 24, 26, 6);
        p.fill(255);
      } else {
        p.fill(220);
      }
      p.text(option.label, overlayArea.x + 20, rowY);
    });
  }

  function drawBattleOverlay(p = window) {
    if (!Game.combat.isActive()) return;
    drawOverlayFrame(p);
    const battle = Game.combat.getState();
    const enemy = battle.enemy;
    p.fill(255);
    p.textAlign(p.LEFT, p.TOP);
    const iconSize = 36;
    const iconX = overlayArea.x + 16;
    const iconY = overlayArea.y + 16;
    let textX = iconX;
    let enemyIconDrawn = false;
    if (enemy && enemy.kind && Game.entities && typeof Game.entities.drawEnemy === "function") {
      enemyIconDrawn = Game.entities.drawEnemy(p, enemy.kind, iconX, iconY, {
        useScreenCoordinates: true,
        drawSize: iconSize,
      });
      if (enemyIconDrawn) {
        textX += iconSize + 12;
      }
    }
    if (!enemyIconDrawn) {
      p.push();
      p.noStroke();
      p.fill(200, 40, 40);
      p.rect(iconX, iconY, iconSize, iconSize);
      p.pop();
      textX += iconSize + 12;
    }
    const enemyName = enemy && enemy.name ? enemy.name : enemy && enemy.kind ? enemy.kind : "";
    p.textSize(20);
    p.text(`Enemy: ${enemyName}`, textX, overlayArea.y + 18);
    p.textSize(16);
    p.text(`HP ${enemy.hp}/${enemy.maxHp}`, textX, overlayArea.y + 48);
    p.text("A:攻撃  D:防御  R:逃走", textX, overlayArea.y + 72);
    const player = Game.state.player;
    const isLowHp = player.hp <= player.maxHp / 5;
    p.fill(isLowHp ? p.color(255, 100, 100) : 255);
    p.text(`プレイヤーHP: ${player.hp}/${player.maxHp}`, textX, overlayArea.y + 96);
    p.fill(255);
  }

  function drawTitleOverlay(p = window) {
    p.push();
    p.noStroke();
    p.fill(0, 230);
    p.rect(0, 0, Game.config.canvasWidth, Game.config.canvasHeight);
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(48);
    p.text("Mystic Isle Adventure", Game.config.canvasWidth / 2, Game.config.canvasHeight / 2 - 40);
    p.textSize(20);
    p.text("Press ENTER to start", Game.config.canvasWidth / 2, Game.config.canvasHeight / 2 + 40);
    p.pop();
  }

  function drawClearOverlay(p = window) {
    if (!Game.flags || !Game.flags.cleared) return;
    p.push();
    p.noStroke();
    p.fill(0, 220);
    p.rect(0, 0, Game.config.canvasWidth, Game.config.canvasHeight);
    p.fill(255);
    p.textAlign(p.CENTER, p.CENTER);
    p.textSize(30);
    p.text("CONGRATULATIONS!", Game.config.canvasWidth / 2, Game.config.canvasHeight / 2 - 50);
    p.textSize(18);
    p.text(
      "Ancient Key で遺跡の謎を解き明かした。Thanks for playing.",
      Game.config.canvasWidth / 2,
      Game.config.canvasHeight / 2
    );
    p.text(
      "Enter: もう一度始める",
      Game.config.canvasWidth / 2,
      Game.config.canvasHeight / 2 + 40
    );
    p.pop();
  }

  function drawOverlayFrame(p) {
    p.push();
    p.noStroke();
    p.fill(0, 200);
    p.rect(overlayArea.x, overlayArea.y, overlayArea.width, overlayArea.height, 10);
    p.stroke(220);
    p.noFill();
    p.rect(overlayArea.x, overlayArea.y, overlayArea.width, overlayArea.height, 10);
    p.pop();
  }

  Game.rendererLayers = Game.rendererLayers || {};
  Game.rendererLayers.drawOverlays = drawOverlays;
  Game.rendererLayers.drawBattleOverlay = drawBattleOverlay;
  Game.rendererLayers.drawClearOverlay = drawClearOverlay;
})();
