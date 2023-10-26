import {
  setTool,
  setNextColor,
  setPreviousColor,
  moveCursor,
} from "../state/actions.mjs";
import { TOOLS } from "../state/state.mjs";

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

function setAccelerationTimer(value) {
  return window.setTimeout(() => {
    value = null;
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

  function shouldBlockInteractions() {
    return state.get((prevState) => prevState.blockedInteractions);
  }

  window.addEventListener("keyup", (event) => {
    if (shouldBlockInteractions()) {
      return;
    }

    switch (event.key) {
      case "ArrowUp":
        keysPressed = produceMovementKeysPressed(keysPressed, "up", false);
        break;
      case "ArrowDown":
        keysPressed = produceMovementKeysPressed(keysPressed, "down", false);
        break;
      case "ArrowLeft":
        keysPressed = produceMovementKeysPressed(keysPressed, "left", false);
        break;
      case "ArrowRight":
        keysPressed = produceMovementKeysPressed(keysPressed, "right", false);
        break;
      default:
        break;
    }
  });

  window.addEventListener("keydown", (event) => {
    if (shouldBlockInteractions()) {
      return;
    }

    if (event.key === "p") {
      setTool(TOOLS.PEN, { state });
    } else if (event.key === "f") {
      setTool(TOOLS.FILL, { state });
    } else if (event.key === "c") {
      setTool(TOOLS.CAM, { state });
    } else if (event.key === "s") {
      setTool(TOOLS.STAMP, { state });
    } else if (event.key === "a") {
      setNextColor({ state });
    } else if (event.key === "z") {
      setPreviousColor({ state });
    }

    if (
      event.key !== "ArrowUp" &&
      event.key !== "ArrowDown" &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight"
    ) {
      return;
    }

    switch (event.key) {
      case "ArrowUp":
        keysPressed = produceMovementKeysPressed(keysPressed, "up", true);
        break;
      case "ArrowDown":
        keysPressed = produceMovementKeysPressed(keysPressed, "down", true);
        break;
      case "ArrowLeft":
        keysPressed = produceMovementKeysPressed(keysPressed, "left", true);
        break;
      case "ArrowRight":
        keysPressed = produceMovementKeysPressed(keysPressed, "right", true);
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
