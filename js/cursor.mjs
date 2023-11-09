import { setCursor } from "./state/actions/cursor.mjs";
import { getCursorCanvas } from "./dom.mjs";
import {
  getGamepad,
  createCursorFromGamepad,
  isGamepadDirectionPressed,
} from "./controls/gamepad.mjs";
import { usesTouchDevice } from "./controls/touch.mjs";
import { drawCursor } from "./canvas-utils.mjs";
const SET_CURSOR_DELAY_IN_MS = 500;
const BASE_GAMEPAD_ACCELERATION_MULTIPLIER = 1.0;
const MAX_GAMEPAD_ACCELERATION_MULTIPLIER = 4.0;

export function initializeCursor({ state }) {
  // TODO cursor shape based on active tool
  
  const isTouchDevice = usesTouchDevice();

  const canvas = getCursorCanvas();
  const cursor = state.get((prevState) => prevState.cursor);
  let gamepadBlocked = state.get((prevState) => prevState.gamepadBlocked);
  const x = cursor.x;
  const y = cursor.y;
  let setCursorTimer = null;

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
    if (gamepadBlocked) {
      return requestAnimationFrame(drawCursorOnGamepadMove);
    }

    const gamepad = getGamepad(state);

    if (gamepad) {
      const gamepadCursor = createCursorFromGamepad(
        gamepad,
        prevGamepadCursor,
        gamepadAccelerationMultiplier,
      );
      prevGamepadCursor = gamepadCursor;

      drawCursor(gamepadCursor.x, gamepadCursor.y);
      setCursor(gamepadCursor, { state });

      gamepadAccelerationMultiplier = Math.min(
        gamepadAccelerationMultiplier + 0.08,
        MAX_GAMEPAD_ACCELERATION_MULTIPLIER,
      );
    }

    requestAnimationFrame(drawCursorOnGamepadMove);
  }

  function handleGamepadBlockedChange(nextState) {
    gamepadBlocked = nextState.gamepadBlocked;
  }

  requestAnimationFrame(drawCursorOnGamepadMove);
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

  if (!isTouchDevice) {
    canvas.addEventListener("mousemove", drawCursorOnMouseMove);
    drawCursor(x, y);
  }

  state.addListener(handleGamepadBlockedChange);

  return function dispose() {
    cancelAnimationFrame(drawCursorOnGamepadMove);
    state.removeListener(handleGamepadBlockedChange);
    if (gamepadAccelerationInterval) {
      window.clearInterval(gamepadAccelerationInterval);
    }

    if (!isTouchDevice) {
      canvas.removeEventListener("mousemove", drawCursorOnMouseMove);
    }

    if (setCursorTimer) {
      window.clearTimeout(setCursorTimer);
    }
  };
}
