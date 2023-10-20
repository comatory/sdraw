import {
  getCanvas,
  getCursorCanvas,
  setCanvasSizeByViewport,
  setCanvasSizeWithoutPanel,
} from "./dom.mjs";
import { prepareCanvasRestoration } from "./canvas.mjs";
import {
  createToolPanel,
  createColorPanel,
  attachPanelListeners,
} from "./ui/panel.mjs";
import { createState, COLOR } from "./state/state.mjs";
import { setTool, setColor, setCursor } from "./state/actions.mjs";
import { attachKeyboardListeners } from "./controls/keyboard.mjs";
import { attachGamepadListeners } from "./controls/gamepad.mjs";
import { initializeCursor } from "./cursor.mjs";
import { throttle } from "./util.mjs";

function attachResizeListeners() {
  const canvas = getCanvas();
  const cursorCanvas = getCursorCanvas();

  setCanvasSizeByViewport(cursorCanvas);
  setCanvasSizeWithoutPanel(canvas);

  function handleWindowResize() {
    const restoreCanvas = prepareCanvasRestoration(canvas);

    setCanvasSizeByViewport(cursorCanvas);
    setCanvasSizeWithoutPanel(canvas);

    restoreCanvas();
  }

  const throttledWindowResize = throttle(handleWindowResize, 5000);

  window.addEventListener("resize", throttledWindowResize);
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
    { state }
  );

  attachDrawingListeners(state);
  attachKeyboardListeners(state);
  attachGamepadListeners(state);

  createToolPanel({ state });
  createColorPanel({ state });
  attachPanelListeners({ state });
}
