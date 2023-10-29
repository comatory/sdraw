import { getCanvas } from "./dom.mjs";
import { storeCanvas, loadCanvas } from "./state/storage.mjs";

const SAVE_CANVAS_INTERVAL_IN_MS = 5000;

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
    SAVE_CANVAS_INTERVAL_IN_MS,
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

export function prepareCanvasRestoration(canvas) {
  const context = canvas.getContext("2d");
  const dataUri = canvas.toDataURL();
  const image = new Image();
  image.src = dataUri;

  return function restoreCanvas() {
    context.drawImage(image, 0, 0);
  };
}

export function isWithinCanvasBounds(x, y) {
  const rect = getCanvas().getBoundingClientRect();

  return x >= 0 && x < rect.width && y >= 0 && y < rect.height;
}
