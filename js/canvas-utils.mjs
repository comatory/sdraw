import { COLOR } from "./state/constants.mjs";
import { getCursorCanvas } from "./dom.mjs";

const ctx = getCursorCanvas().getContext("2d");
const CURSOR_SIZE = 20;

  export function drawCursor(x, y) {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.strokeStyle = COLOR.BLACK;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + CURSOR_SIZE, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + CURSOR_SIZE / 2, y - CURSOR_SIZE / 2);
  ctx.lineTo(x + CURSOR_SIZE / 2, y + CURSOR_SIZE / 2);
  ctx.stroke();
}
