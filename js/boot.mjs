import {
  getCanvas,
  getCursorCanvas,
  setCanvasSizeByViewport,
  setCanvasSizeWithoutPanel,
  setVideoSizeByCanvasSize,
} from "./dom.mjs";
import {
  prepareCanvasRestoration,
  attachCanvasSaveListener,
  restorePreviousCanvas,
} from "./canvas.mjs";
import { attachPanelListeners } from "./ui/panel.mjs";
import { createColorPanel } from "./ui/colors.mjs";
import { createToolPanel } from "./ui/tools.mjs";
import { createGlobalActionsPanel } from "./ui/global.mjs";
import { createState } from "./state/state.mjs";
import { setTool, setColor, setCursor } from "./state/actions.mjs";
import { attachKeyboardListeners } from "./controls/keyboard.mjs";
import { attachGamepadListeners } from "./controls/gamepad.mjs";
import { initializeCursor } from "./cursor.mjs";
import { throttle } from "./utils.mjs";

function attachResizeListeners() {
  const canvas = getCanvas();
  const cursorCanvas = getCursorCanvas();

  setCanvasSizeByViewport(cursorCanvas);
  setCanvasSizeWithoutPanel(canvas);
  setVideoSizeByCanvasSize(canvas);

  function handleWindowResize() {
    const restoreCanvas = prepareCanvasRestoration(canvas);

    setCanvasSizeByViewport(cursorCanvas);
    setCanvasSizeWithoutPanel(canvas);
    setVideoSizeByCanvasSize(canvas);

    restoreCanvas();
  }

  const throttledWindowResize = throttle(handleWindowResize, 5000);

  window.addEventListener("resize", throttledWindowResize);
}

function attachDrawingListeners(state) {
  initializeCursor({ state });

  const currentTool = state.get((prevState) => prevState.tool);

  if (currentTool) {
    const activatedVariants = state.get(
      (prevState) => prevState.activatedVariants,
    );
    const variant = activatedVariants.get(currentTool.id);
    setTool(currentTool, { state, variant });
  }

  const currentColor = state.get((prevState) => prevState.color);

  if (currentColor) {
    setColor(currentColor, { state });
  }
}

export function boot() {
  const state = createState();
  const canvas = getCanvas();

  restorePreviousCanvas(canvas);
  attachCanvasSaveListener(canvas);

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
  attachGamepadListeners(state);

  createToolPanel({ state });
  createColorPanel({ state });
  createGlobalActionsPanel({ state });
  attachPanelListeners({ state });
}
