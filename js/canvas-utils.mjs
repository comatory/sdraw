import { COLOR } from "./state/constants.mjs";
import { getCursorCanvas, getCanvas } from "./dom.mjs";
import { getPanel } from "./dom.mjs";
import { isCursorWithinPanelBounds } from "./ui-utils.mjs";

const ctx = getCursorCanvas().getContext("2d");
const canvasCtx = getCanvas().getContext("2d");
const CURSOR_SIZE = 10;
const CURSOR_PART_SIZE = CURSOR_SIZE / 2;
const GAP = CURSOR_SIZE / 2;
const LINE_WIDTH = 5;

/**
 * Inverts color to avoid invisible cursor.
 *
 * @param {number} r - Red color.
 * @param {number} g - Green color.
 * @param {number} b - Blue color.
 *
 * @returns {number[]} - Inverted color in r, g,b order.
 */
function invertColor(r, g, b) {
  const rgb = [r, g, b];
  for (var i = 0; i < rgb.length; i++) rgb[i] = (i === 3 ? 1 : 255) - rgb[i];
  return rgb;
}

/**
 * Returns color on given canvas area in RGBA format.
 *
 * @param {number} x - X coordinate.
 * @param {number} y - Y coordinate.
 *
 * @returns {string} - RGBA color.
 */
function getPixelRGBAColor(x, y) {
  const panel = getPanel();
  const rect = panel.getBoundingClientRect();

  if (isCursorWithinPanelBounds(x, y, rect)) {
    return COLOR.BLACK;
  }

  const pixel = canvasCtx.getImageData(x, y, GAP, GAP);
  const [r, g, b] = invertColor(...pixel.data);

  return `rgb(${r}, ${g}, ${b})`;
}

export function drawCursor(x, y) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = "round";
  ctx.strokeStyle = getPixelRGBAColor(x, y);

  /* --- Cursor --- */
  // Draw top line
  ctx.beginPath();
  ctx.moveTo(x, y - GAP);
  ctx.lineTo(x, y - CURSOR_PART_SIZE - GAP - CURSOR_SIZE);
  ctx.stroke();

  // Draw bottom line
  ctx.beginPath();
  ctx.moveTo(x, y + GAP);
  ctx.lineTo(x, y + CURSOR_PART_SIZE + GAP + CURSOR_SIZE);
  ctx.stroke();

  // Draw left line
  ctx.beginPath();
  ctx.moveTo(x - GAP, y);
  ctx.lineTo(x - CURSOR_PART_SIZE - GAP - CURSOR_SIZE, y);
  ctx.stroke();

  // Draw right line
  ctx.beginPath();
  ctx.moveTo(x + GAP, y);
  ctx.lineTo(x + CURSOR_PART_SIZE + GAP + CURSOR_SIZE, y);
  ctx.stroke();

  ctx.closePath();
}
