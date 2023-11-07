import { setGamepadIndex } from "../state/actions/controls.mjs";

// Chrome swaps gamepad axes so need to handle it
function isChrome() {
  return navigator.userAgent.indexOf("Chrome") !== -1;
}

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
  const isChromeBrowser = isChrome();

  const axis1 = isChromeBrowser ? gamepad.axes[1] : gamepad.axes[0];
  const axis2 = isChromeBrowser ? gamepad.axes[0] : gamepad.axes[1];
  const axis3 = isChromeBrowser ? null : gamepad.axes[2];
  const axis4 = isChromeBrowser ? null : gamepad.axes[3];

  if (Math.ceil(axis1) !== 0) {
    if (isChromeBrowser) {
      nextCursor.y += axis1 * multiplier;
    } else {
      nextCursor.y -= axis1 * multiplier;
    }
  }
  if (Math.ceil(axis2) !== 0) {
    nextCursor.x += axis2 * multiplier;
  }
  if (Number.isFinite(axis3) && Math.ceil(axis3) !== 0) {
    nextCursor.y += axis3 * multiplier;
  }
  if (Number.isFinite(axis4) && Math.ceil(axis4) !== 0) {
    nextCursor.x += axis4 * multiplier;
  }

  return {
    x: prevCursor.x + nextCursor.x,
    y: prevCursor.y + nextCursor.y,
  };
}

export function isGamepadDirectionPressed(gamepad) {
  if (isChrome()) {
    return gamepad.axes.slice(0, 2).some((axis) => Math.ceil(axis) !== 0);
  }
  return gamepad.axes.slice(0, 3).some((axis) => Math.ceil(axis) !== 0);
}

export function isPrimaryGamepadButtonPressed(gamepad) {
  return gamepad.buttons[2].pressed;
}

export function isRightShoulderGamepadButtonPressed(gamepad) {
  return gamepad.buttons[5].pressed;
}

export function isLeftShoulderGamepadButtonPressed(gamepad) {
  return gamepad.buttons[4].pressed;
}

export function isRightTriggerGamepadButtonPressed(gamepad) {
  return gamepad.buttons[7].pressed;
}

export function isLeftTriggerGamepadButtonPressed(gamepad) {
  return gamepad.buttons[6].pressed;
}

export function isGamepadButtonPressed(gamepad) {
  return gamepad.buttons.some((button) => button.pressed);
}
