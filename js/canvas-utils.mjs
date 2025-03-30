import { COLOR } from "./state/constants.mjs";
import { getCursorCanvas } from "./dom.mjs";

const ctx = getCursorCanvas().getContext("2d");
const CURSOR_SIZE = 10;
const CURSOR_PART_SIZE = CURSOR_SIZE / 2;
const GAP = CURSOR_SIZE / 2;
const LINE_WIDTH = 5;

export function drawCursor(x, y) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.lineWidth = LINE_WIDTH;
  ctx.lineCap = "round";
  ctx.strokeStyle = COLOR.BLACK;

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
