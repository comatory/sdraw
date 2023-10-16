import { getCanvas, setCanvasSizeByViewport } from "./dom.mjs";
import { createState, TOOLS, COLOR } from "./state/state.mjs";
import { setTool, setColor, setNextColor, setPreviousColor } from "./state/actions.mjs";

function attachResizeListeners() {
  const canvas = getCanvas();

  setCanvasSizeByViewport(canvas);

  window.addEventListener('resize', () => {
    setCanvasSizeByViewport(canvas);
  });
}

function attachDrawingListeners(state) {
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

  attachResizeListeners();
  attachDrawingListeners(state);
  attachKeyboardListeners(state);
}
