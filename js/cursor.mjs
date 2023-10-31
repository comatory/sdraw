import { setCursor } from "./state/actions/cursor.mjs";
import { getCursorCanvas } from "./dom.mjs";
import {
  getGamepad,
  createCursorFromGamepad,
  isGamepadDirectionPressed,
} from "./controls/gamepad.mjs";
import { drawCursor } from "./canvas-utils.mjs";
const SET_CURSOR_DELAY_IN_MS = 500;
const BASE_GAMEPAD_ACCELERATION_MULTIPLIER = 1.0;
const MAX_GAMEPAD_ACCELERATION_MULTIPLIER = 4.0;

export function initializeCursor({ state }) {
  // TODO cursor shape based on active tool

  const canvas = getCursorCanvas();
  const cursor = state.get((prevState) => prevState.cursor);
  const x = cursor.x;
  const y = cursor.y;
  let setCursorTimer = null;

  drawCursor(x, y);

  function shouldBlockInteractions() {
    return state.get((prevState) => prevState.blockedInteractions);
  }

  function drawCursorOnMouseMove(event) {
    if (setCursorTimer) {
      window.clearTimeout(setCursorTimer);
    }

    if (shouldBlockInteractions()) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const { clientX, clientY } = event;

    drawCursor(clientX - rect.left, clientY - rect.top);

    setCursorTimer = window.setTimeout(() => {
      setCursor({ x: clientX, y: clientY }, { state });
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
        gamepadAccelerationMultiplier,
      );
      prevGamepadCursor = gamepadCursor;

      drawCursor(gamepadCursor.x, gamepadCursor.y);

      gamepadAccelerationMultiplier = Math.min(
        gamepadAccelerationMultiplier + 0.08,
        MAX_GAMEPAD_ACCELERATION_MULTIPLIER,
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
  canvas.addEventListener("mousemove", drawCursorOnMouseMove);

  return function dispose() {
    cancelAnimationFrame(drawCursorOnGamepadMove);
    if (gamepadAccelerationInterval) {
      window.clearInterval(gamepadAccelerationInterval);
    }
    canvas.removeEventListener("mousemove", drawCursorOnMouseMove);

    if (setCursorTimer) {
      window.clearTimeout(setCursorTimer);
    }
  };
}
