import { getCanvas } from "./dom.mjs";

export function prepareCanvasRestoration(canvas) {
  const context = canvas.getContext("2d");
  const dataUri = canvas.toDataURL();
  const image = new Image();
  image.src = dataUri;

  return function restoreCanvas() {
    context.drawImage(image, 0, 0);
  }
}

export function isWithinCanvasBounds(x, y) {
  const rect = getCanvas().getBoundingClientRect();

  return x >= 0 && x < rect.width && y >= 0 && y < rect.height;
}
