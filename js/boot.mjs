import { getCanvas, getCursorCanvas, setCanvasSizeByViewport } from "./dom.mjs";
import { createState, TOOLS, COLOR } from "./state/state.mjs";
import {
  setTool,
  setColor,
  setNextColor,
  setPreviousColor,
  setCursor,
  moveCursorUp,
  moveCursorDown,
  moveCursorLeft,
  moveCursorRight,
} from "./state/actions.mjs";
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
  let acceleration = null;
  let accelerationTimer = null;

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
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        if (accelerationTimer) {
          window.clearTimeout(accelerationTimer);
        }

        acceleration = {
          key: event.key,
          acceleration: acceleration && acceleration.key === event.key ? acceleration.acceleration + 1 : 1,
        }

        handleMovementKeys(event, state, acceleration);
        accelerationTimer = window.setTimeout(() => {
          acceleration = null;
        }, 50);
        break;
      default:
        break;
    }
  });
}

function handleMovementKeys(event, state, acceleration) {
  const length = acceleration && acceleration.key === event.key ? acceleration.acceleration : 1;
  switch (event.key) {
    case 'ArrowUp':
      moveCursorUp(length, { state });
      break;
    case 'ArrowDown':
      moveCursorDown(length, { state });
      break;
    case 'ArrowLeft':
      moveCursorLeft(length, { state });
      break;
    case 'ArrowRight':
      moveCursorRight(length, { state });
      break;
  }
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
