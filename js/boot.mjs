import {
  getCanvas,
  getCursorCanvas,
  setCanvasSizeByViewport,
  setCanvasSizeWithoutPanel,
  setCanvasFill,
  setVideoSizeByCanvasSize,
} from "./dom.mjs";
import {
  attachCanvasSaveListener,
  attachWindowResizeListeners,
  restorePreviousCanvas,
} from "./canvas.mjs";
import { attachPanelListeners } from "./ui/panel.mjs";
import { createColorPanel } from "./ui/colors.mjs";
import { createToolPanel } from "./ui/tools.mjs";
import { createGlobalActionsPanel } from "./ui/global.mjs";
import { createState } from "./state/state.mjs";
import { setTool, setColor } from "./state/actions/tool.mjs";
import { setCursor } from "./state/actions/cursor.mjs";
import { attachKeyboardListeners } from "./controls/keyboard.mjs";
import { attachGamepadBlockListeners } from "./controls/general.mjs";
import { attachGamepadListeners } from "./controls/gamepad.mjs";
import { initializeCursor } from "./cursor.mjs";
import { ColorButton } from "./ui/color.mjs";
import { ToolButton } from "./ui/tool.mjs";
import { VariantButton } from "./ui/variant.mjs";
import { VariantStampButton } from "./ui/variant-stamp.mjs";
import { UiButton } from "./ui/button.mjs";

function registerComponents() {
  customElements.define("ui-button", UiButton);
  customElements.define("color-button", ColorButton);
  customElements.define("tool-button", ToolButton);
  customElements.define("variant-button", VariantButton);
  customElements.define("variant-stamp-button", VariantStampButton);
}

function attachResizeListeners() {
  const canvas = getCanvas();
  const cursorCanvas = getCursorCanvas();

  setCanvasSizeByViewport(cursorCanvas);
  setCanvasSizeWithoutPanel(canvas);
  setVideoSizeByCanvasSize(canvas);
  setCanvasFill(canvas);

  attachWindowResizeListeners({ canvas, cursorCanvas });
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

  registerComponents();
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
  attachGamepadBlockListeners(state);

  createToolPanel({ state });
  createColorPanel({ state });
  createGlobalActionsPanel();
  attachPanelListeners({ state });
}
