import { getCanvas, getCursorCanvas, setCanvasSizeByViewport } from "./dom.mjs";
import { createState, TOOLS, COLOR } from "./state/state.mjs";
import {
  setTool,
  setColor,
  setCursor,
} from "./state/actions.mjs";
import { attachKeyboardListeners } from "./controls/keyboard.mjs";
import { initializeCursor } from "./cursor.mjs";

function attachResizeListeners() {
  const canvas = getCanvas();
  const cursorCanvas = getCursorCanvas();

  setCanvasSizeByViewport(canvas);
  setCanvasSizeByViewport(cursorCanvas);

  window.addEventListener("resize", () => {
    setCanvasSizeByViewport(canvas);
    setCanvasSizeByViewport(cursorCanvas);
  });
}

function attachDrawingListeners(state) {
  initializeCursor({ state });

  const currentTool = state.get((state) => state.tool);

  if (currentTool) {
    setTool(currentTool, { state });
  }

  const currentColor = state.get((state) => state.color);

  if (currentColor) {
    setColor(currentColor, { state });
  }
}

export function boot() {
  const state = createState();

  attachResizeListeners();

  const cursorCanvas = getCursorCanvas();
  const rect = cursorCanvas.getBoundingClientRect();

  setCursor(
    {
      x: rect.width / 2,
      y: rect.height / 2,
    },
    { state },
  );
  attachDrawingListeners(state);
  attachKeyboardListeners(state);
}
