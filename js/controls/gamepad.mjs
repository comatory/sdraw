import { setGamepadIndex } from "../state/actions/controls.mjs";

export function attachGamepadListeners(state) {
  window.addEventListener("gamepadconnected", (event) => {
    setGamepadIndex(event.gamepad.index, { state });
  });

  window.addEventListener("gamepaddisconnected", () => {
    setGamepadIndex(null, { state });
  });
}

export function getGamepad(state) {
  const gamepadIndex = state.get((prevState) => prevState.gamepad);

  if (gamepadIndex === null) {
    return null;
  }

  return navigator.getGamepads()[gamepadIndex];
}

export function createCursorFromGamepad(gamepad, prevCursor, multiplier) {
  const nextCursor = { x: 0, y: 0 };

  const axis1 = gamepad.axes[0];
  const axis2 = gamepad.axes[1];
  const axis3 = gamepad.axes[2];
  const axis4 = gamepad.axes[3];

  if (Math.ceil(axis1) !== 0) {
    nextCursor.y -= axis1 * multiplier;
  }
  if (Math.ceil(axis2) !== 0) {
    nextCursor.x += axis2 * multiplier;
  }
  if (Math.ceil(axis3) !== 0) {
    nextCursor.y += axis3 * multiplier;
  }
  if (Math.ceil(axis4) !== 0) {
    nextCursor.x += axis4 * multiplier;
  }

  return {
    x: prevCursor.x + nextCursor.x,
    y: prevCursor.y + nextCursor.y,
  };
}

export function isGamepadDirectionPressed(gamepad) {
  return gamepad.axes.slice(0, 3).some((axis) => Math.ceil(axis) !== 0);
}

export function isPrimaryGamepadButtonPressed(gamepad) {
  return gamepad.buttons[2].pressed;
}
