(function () {
  // サイドパネルの描画
  const Game = (window.Game = window.Game || {});
  const { layout } = Game.rendererLayout;
  const { estimateWrappedLineCount } = Game.rendererUtils;

  function drawPanels(p = window) {
    drawMessagePanel(p);
    drawStatusPanel(p);
  }

  function drawMessagePanel(p) {
    const x = layout.panelWidth;
    const y = layout.mapAreaHeight;
    p.fill(15, 15, 15);
    p.stroke(80);
    p.rect(x, y, layout.panelWidth, layout.panelHeight);
    p.fill(240);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(16);
    const messages = Game.state.messages.slice(-4);
    const lineHeight = 24;
    const iconSize = 20;
    let cursorY = y + 12;
    p.textWrap(p.CHAR);
    messages.forEach((entryRaw) => {
      const entry =
        typeof entryRaw === "string" || entryRaw == null ? { text: entryRaw || "" } : entryRaw;
      const lineY = cursorY;
      let textX = x + 12;
      if (
        entry.icon &&
        entry.icon.type === "enemy" &&
        entry.icon.kind &&
        Game.entities &&
        typeof Game.entities.drawEnemy === "function"
      ) {
        const iconY = lineY + (lineHeight - iconSize) / 2;
        const drawn = Game.entities.drawEnemy(p, entry.icon.kind, textX, iconY, {
          useScreenCoordinates: true,
          drawSize: iconSize,
        });
        if (drawn) {
          textX += iconSize + 6;
        } else if (entry.icon.label) {
          const label = entry.icon.label;
          p.text(label, textX, lineY);
          textX += p.textWidth(label) + 6;
        }
      } else if (entry.icon && entry.icon.label) {
        const label = entry.icon.label;
        p.text(label, textX, lineY);
        textX += p.textWidth(label) + 6;
      }
      const text = entry.text != null ? String(entry.text) : "";
      const availableWidth = Math.max(10, layout.panelWidth - (textX - x) - 12);
      const lineCount = estimateWrappedLineCount(p, text, availableWidth);
      p.text(text, textX, lineY, availableWidth);
      cursorY += Math.max(1, lineCount) * lineHeight;
    });
  }

  function drawStatusPanel(p) {
    const x = 0;
    const y = layout.mapAreaHeight;
    const player = Game.state.player;
    const stats = Game.getPlayerEffectiveStats();
    p.fill(15, 15, 20);
    p.stroke(80);
    p.rect(x, y, layout.panelWidth, layout.panelHeight);
    p.textAlign(p.LEFT, p.TOP);
    p.textSize(16);
    const isLowHp = player.hp <= player.maxHp / 5;
    p.fill(isLowHp ? p.color(255, 100, 100) : 240);
    p.text(`HP: ${player.hp}/${player.maxHp}`, x + 12, y + 12);
    p.fill(240);
    p.text(`LV: ${player.lv}  EXP: ${player.exp}`, x + 220, y + 12);
    const weaponName = resolveEquippedName(player, "weapon");
    const shieldName = resolveEquippedName(player, "shield");
    const storyLabel = resolveStoryItemLabel();
    const lines = [
      `ATK/DEF: ${stats.atk} / ${stats.def}`,
      `Food: ${player.food}  Gold: ${player.gold}  Story: ${storyLabel}`,
      `Weapon: ${weaponName}  Shield: ${shieldName}`,
    ];
    lines.forEach((line, index) => {
      p.text(line, x + 12, y + 12 + (index + 1) * 24);
    });
  }

  function resolveEquippedName(player, slotKey) {
    const equipIndex = player && player.equip ? player.equip[slotKey] : null;
    if (equipIndex == null || equipIndex < 0 || equipIndex >= player.inventory.length) {
      return "-";
    }
    const itemId = player.inventory[equipIndex];
    if (!itemId) return "-";
    const meta = Game.ITEM_META ? Game.ITEM_META[itemId] : null;
    return (meta && meta.name) || itemId || "-";
  }

  function resolveStoryItemLabel() {
    const flags = Game.flags || {};
    if (flags.hasHammer && !flags.cave2Unlocked) {
      return "Power Hammer";
    }
    if (flags.hasOre && !flags.holySwordCreated) {
      return "Holy Ore";
    }
    return "-";
  }

  Game.rendererLayers = Game.rendererLayers || {};
  Game.rendererLayers.drawUI = drawPanels;
})();
