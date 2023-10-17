import {
  setTool,
  setNextColor,
  setPreviousColor,
  moveCursor,
} from "../state/actions.mjs";

const MAXIMUM_CURSOR_ACCERATION = 20;
const NO_KEYS_PRESSED = Object.freeze({
  up: false,
  down: false,
  left: false,
  right: false,
});

function clearAccelerationTimer(timer) {
  if (!timer) {
    return;
  }

  window.clearTimeout(timer);
}

function setAccelerationTimer(acceleration) {
  return window.setTimeout(() => {
    acceleration = null;
  }, 50);
}

function produceAcceleration(prevAcceleration, key) {
  return {
    key,
    acceleration:
      prevAcceleration && prevAcceleration.key === key
        ? prevAcceleration.acceleration + 1
        : 1,
  };
}

function produceMovementKeysPressed(prevKeysPressed, key, activated) {
  return {
    ...prevKeysPressed,
    [key]: activated,
  };
}

export function attachKeyboardListeners(state) {
  let acceleration = null;
  let accelerationTimer = null;
  let keysPressed = NO_KEYS_PRESSED;

  window.addEventListener("keyup", (event) => {
    switch (event.key) {
      case "ArrowUp":
        keysPressed = produceMovementKeysPressed(
          keysPressed,
          'up',
          false,
        );
        break;
      case "ArrowDown":
        keysPressed = produceMovementKeysPressed(
          keysPressed,
          'down',
          false,
        );
        break;
      case "ArrowLeft":
        keysPressed = produceMovementKeysPressed(
          keysPressed,
          'left',
          false,
        );
      case "ArrowRight":
        keysPressed = produceMovementKeysPressed(
          keysPressed,
          'right',
          false,
        );
        break;
      default:
        break;
    }
  });

  window.addEventListener("keydown", (event) => {
    switch (event.key) {
      case "p":
        setTool(TOOLS.PEN, { state });
        break;
      case "f":
        setTool(TOOLS.FILL, { state });
        break;
      case "a":
        setNextColor({ state });
        break;
      case "z":
        setPreviousColor({ state });
        break;
      case "ArrowUp":
        keysPressed = produceMovementKeysPressed(
          keysPressed,
          'up',
          true,
        );
        break;
      case "ArrowDown":
        keysPressed = produceMovementKeysPressed(
          keysPressed,
          'down',
          true,
        );
        break;
      case "ArrowLeft":
        keysPressed = produceMovementKeysPressed(
          keysPressed,
          'left',
          true,
        );
        break;
      case "ArrowRight":
        keysPressed = produceMovementKeysPressed(
          keysPressed,
          'right',
          true,
        );
        break;
        break;
      default:
        break;
    }

    clearAccelerationTimer(accelerationTimer);

    acceleration = produceAcceleration(acceleration, event.key);
    moveCursor({
      acceleration,
      state,
      keysPressed,
    });

    accelerationTimer = setAccelerationTimer(acceleration);
  });
}
