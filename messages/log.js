(function () {
  const Game = (window.Game = window.Game || {});

  function normalizeEntry(message, meta = {}) {
    let textValue;
    let iconValue;
    if (typeof message === "string") {
      textValue = message;
      iconValue = meta.icon || null;
    } else if (message && typeof message === "object") {
      textValue = message.text || "";
      iconValue = message.icon || meta.icon || null;
    } else {
      textValue = message != null ? String(message) : "";
      iconValue = meta.icon || null;
    }
    const icon =
      iconValue && typeof iconValue === "object"
        ? {
            type: iconValue.type || null,
            kind: iconValue.kind || null,
            label: iconValue.label || null,
          }
        : null;
    const tone = meta.tone || (message && message.tone) || null;
    return { text: textValue, icon, tone };
  }

  function push(message, meta = {}) {
    const entry = normalizeEntry(message, meta);
    const messages = Game.state && Game.state.messages;
    const max = Game.MAX_MESSAGES || 4;
    if (!messages) return;
    messages.push(entry);
    while (messages.length > max) {
      messages.shift();
    }
  }

  Game.messageLog = {
    normalizeEntry,
    push,
  };
})();
