import { getCanvas, setCanvasSizeByViewport } from "./dom.mjs";
import { createState, TOOLS } from "./state/state.mjs";
import { setTool } from "./state/actions.mjs";

function attachResizeListeners() {
  const canvas = getCanvas();

  setCanvasSizeByViewport(canvas);

  window.addEventListener('resize', () => {
    setCanvasSizeByViewport(canvas);
  });
}

function attachDrawingListeners(state) {
  const currentTool = state.get(state => state.tool);

  if (!currentTool) {
    return;
  }

  setTool(currentTool, { state });
}

function attachKeyboardListeners(state) {
  window.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'p':
        setTool(TOOLS.PEN, { state });
        break;
      case 'f':
        setTool(TOOLS.FILL, { state });
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
