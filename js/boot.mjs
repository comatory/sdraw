import { getCanvas, setCanvasSizeByViewport } from "./dom.mjs";
import { state, TOOLS } from "./state/state.mjs";
import { setTool } from "./state/actions.mjs";

function attachResizeListeners() {
  const canvas = getCanvas();

  setCanvasSizeByViewport(canvas);

  window.addEventListener('resize', () => {
    setCanvasSizeByViewport(canvas);
  });
}

function attachDrawingListeners() {
  const currentTool = state.get(state => state.tool);

  if (!currentTool) {
    return;
  }

  setTool(currentTool);
}

function attachKeyboardListeners() {
  window.addEventListener('keydown', (event) => {
    switch (event.key) {
      case 'p':
        setTool(TOOLS.PEN);
        break;
      case 'f':
        setTool(TOOLS.FILL);
      default:
        break;
    }
  });
}

export function boot() {
  attachResizeListeners();
  attachDrawingListeners();
  attachKeyboardListeners();
}
