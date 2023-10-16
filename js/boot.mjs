import { getCanvas, getCursorCanvas, setCanvasSizeByViewport } from "./dom.mjs";
import { createState, TOOLS, COLOR } from "./state/state.mjs";
import { setTool, setColor, setNextColor, setPreviousColor, setCursor } from "./state/actions.mjs";
import { initializeCursor } from "./cursor.mjs";

function attachResizeListeners() {
  const canvas = getCanvas();
  const cursorCanvas = getCursorCanvas();

  setCanvasSizeByViewport(canvas);
  setCanvasSizeByViewport(cursorCanvas);

  window.addEventListener('resize', () => {
    setCanvasSizeByViewport(canvas);
    setCanvasSizeByViewport(cursorCanvas);
  });
}

function attachDrawingListeners(state) {
  initializeCursor({ state });

  const currentTool = state.get(state => state.tool);

  if (currentTool) {
    setTool(currentTool, { state });
  }

  const currentColor = state.get(state => state.color);

  if (currentColor) {
    setColor(currentColor, { state });
  }
}

function attachKeyboardListeners(state) {
  window.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'p':
        setTool(TOOLS.PEN, { state });
        break;
      case 'f':
        setTool(TOOLS.FILL, { state });
        break;
      case 'a':
        setNextColor({ state });
        break;
      case 'z':
        setPreviousColor({ state });
        break;
      default:
        break;
    }
  });
}

export function boot() {
  const state = createState();

  const cursorCanvas = getCursorCanvas();
  const rect = cursorCanvas.getBoundingClientRect();

  setCursor({
    x: rect.width / 2,
    y: rect.height / 2,
  }, { state });

  attachResizeListeners();
  attachDrawingListeners(state);
  attachKeyboardListeners(state);
}
