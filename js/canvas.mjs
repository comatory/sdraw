import { getCanvas } from "./dom.mjs";
import { storeCanvas, loadCanvas } from "./state/storage.mjs";

const SAVE_CANVAS_INTERVAL_IN_MS = 5000;
const THROTTLE_DELAY_IN_MS = 1000;

export function attachCanvasSaveListener() {
  function handleSaveCanvas() {
    const canvas = getCanvas();
    const dataUri = canvas.toDataURL();
    storeCanvas(dataUri);
  }

  function handleSaveCanvasWhenIdle() {
    window.requestIdleCallback(handleSaveCanvas);
  }

  const interval = window.setInterval(
    handleSaveCanvasWhenIdle,
    SAVE_CANVAS_INTERVAL_IN_MS
  );

  return function dispose() {
    window.clearInterval(interval);
  };
}

export function restorePreviousCanvas(canvas) {
  const dataUri = loadCanvas();

  if (!dataUri) {
    return;
  }

  const image = new Image();
  image.onload = () => {
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
  };
  image.src = dataUri;
}

export function isWithinCanvasBounds(x, y) {
  const rect = getCanvas().getBoundingClientRect();

  return x >= 0 && x < rect.width && y >= 0 && y < rect.height;
}

function resizeCanvas(canvas, prevDataUri) {
  const boundingRect = canvas.getBoundingClientRect();
  canvas.width = boundingRect.width;
  canvas.height = boundingRect.height;

  if (!prevDataUri) {
    return;
  }

  const img = new Image();
  img.onload = () => {
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
  };

  img.src = prevDataUri;
}

function resizeCursorCanvas(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

export function attachWindowResizeListeners({ canvas, cursorCanvas }) {
  let resizeTimer = null;
  let prevDataUri = null;

  function resize() {
    resizeCanvas(canvas, prevDataUri);
  }

  function handleWindowResizeOnCanvas() {
    if (resizeTimer) {
      window.clearTimeout(resizeTimer);
    }

    prevDataUri = canvas.toDataURL();
    resizeTimer = window.setTimeout(resize, THROTTLE_DELAY_IN_MS);

    resizeCursorCanvas(cursorCanvas);
  }

  window.addEventListener("resize", handleWindowResizeOnCanvas);
}
