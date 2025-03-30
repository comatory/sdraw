import { COLOR } from "./state/constants.mjs";
import { getCursorCanvas } from "./dom.mjs";

const ctx = getCursorCanvas().getContext("2d");
const CURSOR_SIZE = 20;

function offsetCursorX(x) {
  return x - CURSOR_SIZE / 2;
}

export function drawCursor(x, y) {
  x = offsetCursorX(x);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  const half = CURSOR_SIZE / 2;

  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.strokeStyle = COLOR.BLACK;

  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + CURSOR_SIZE, y);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + half, y - half);
  ctx.lineTo(x + half, y + half);
  ctx.stroke();

  ctx.closePath();


  ctx.moveTo(x + half, y + half);
  ctx.strokeStyle = COLOR.WHITE;
  ctx.fillStyle = COLOR.WHITE;
  ctx.beginPath();
  ctx.arc(x + half, y, 3, 0, Math.PI * 2);
  ctx.fill();
}
