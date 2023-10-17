import { setCursor } from "./state/actions.mjs";
import { COLOR } from "./state/state.mjs";
import { getCursorCanvas } from "./dom.mjs";
import {
  getGamepad,
  createCursorFromGamepad,
  isGamepadDirectionPressed,
} from "./controls/gamepad.mjs";

const ctx = getCursorCanvas().getContext("2d");

const CURSOR_SIZE = 20;
const SET_CURSOR_DELAY_IN_MS = 500;
const BASE_GAMEPAD_ACCELERATION_MULTIPLIER = 1.0;
const MAX_GAMEPAD_ACCELERATION_MULTIPLIER = 8.0;
const GAMEPAD_ACCELERATION_MULTIPLIER_DELAY_IN_MS = 300;

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
      window.clearTimeout(setCursorTimer);
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX;
    const y = event.clientY;

    drawCursor(x - rect.left, y - rect.top);

    setCursorTimer = window.setTimeout(() => {
      setCursor({ x, y }, { state });
    }, SET_CURSOR_DELAY_IN_MS);
  }

  let prevGamepadCursor = {
    x: cursor.x,
    y: cursor.y,
  };
  let gamepadAccelerationMultiplier = BASE_GAMEPAD_ACCELERATION_MULTIPLIER;
  let gamepadAccelerationInterval = null;

  function drawCursorOnGamepadMove() {
    const gamepad = getGamepad(state);

    if (gamepad) {
      const gamepadCursor = createCursorFromGamepad(
        gamepad,
        prevGamepadCursor,
        gamepadAccelerationMultiplier
      );
      prevGamepadCursor = gamepadCursor;

      const { x, y } = gamepadCursor;
      drawCursor(x, y);

      gamepadAccelerationMultiplier = Math.min(
        gamepadAccelerationMultiplier + 0.08,
        MAX_GAMEPAD_ACCELERATION_MULTIPLIER
      );
    }

    requestAnimationFrame(drawCursorOnGamepadMove);
  }

  gamepadAccelerationInterval = window.setInterval(() => {
    const gamepad = getGamepad(state);

    if (!gamepad) {
      return;
    }

    const isPressingDirection = isGamepadDirectionPressed(gamepad);

    if (!isPressingDirection) {
      gamepadAccelerationMultiplier = BASE_GAMEPAD_ACCELERATION_MULTIPLIER;
    }
  }, 500);

  requestAnimationFrame(drawCursorOnGamepadMove);
  window.addEventListener("mousemove", drawCursorOnMouseMove);

  return function dispose() {
    cancelAnimationFrame(drawCursorOnGamepadMove);
    if (gamepadAccelerationInterval) {
      window.clearInterval(gamepadAccelerationInterval);
    }
    window.removeEventListener("mousemove", drawCursorOnMouseMove);

    if (setCursorTimer) {
      window.clearTimeout(setCursorTimer);
    }
  };
}
