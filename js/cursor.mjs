import { setCursor } from "./state/actions.mjs";
import { COLOR } from "./state/state.mjs";
import { getCursorCanvas } from "./dom.mjs";

const ctx = getCursorCanvas().getContext("2d");

const CURSOR_SIZE = 20;
const SET_CURSOR_DELAY_IN_MS = 500;

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

export function initializeCursor({ state }) {
  // TODO cursor shape based on active tool

  const canvas = getCursorCanvas();
  const cursor = state.get((state) => state.cursor);
  const x = cursor.x;
  const y = cursor.y;
  let setCursorTimer = null;

  drawCursor(x, y);

  function drawCursorOnMouseMove(event) {
    if (setCursorTimer) {
      window.clearTimeout(setCursorTimer)
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    drawCursor(x - rect.left, y - rect.top);

    setCursorTimer = window.setTimeout(() => {
      setCursor({ x, y }, { state });
    }, SET_CURSOR_DELAY_IN_MS);
  }

  window.addEventListener("mousemove", drawCursorOnMouseMove);

  return function dispose() {
    window.removeEventListener("mousemove", drawCursorOnMouseMove);

    if (setCursorTimer) {
      window.clearTimeout(setCursorTimer)
    }
  };
}
