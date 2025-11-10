(function () {
  const Game = (window.Game = window.Game || {});

  function estimateWrappedLineCount(p, text, maxWidth) {
    const source = (text != null ? String(text) : "").split(/\r?\n/);
    const lines = [];
    for (const segment of source) {
      let current = "";
      if (segment.length === 0) {
        lines.push("");
        continue;
      }
      for (const char of segment) {
        const next = current + char;
        if (current.length === 0 || p.textWidth(next) <= maxWidth) {
          current = next;
          continue;
        }
        lines.push(current);
        current = char.trim().length === 0 ? "" : char;
      }
      lines.push(current);
    }
    return Math.max(1, lines.filter((line) => line.length > 0).length || source.length);
  }

  Game.rendererUtils = {
    estimateWrappedLineCount,
  };
})();
