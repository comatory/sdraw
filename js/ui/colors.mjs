import { COLOR_LIST } from "../state/constants.mjs";
import {
  setColor,
  setNextColor,
  setPreviousColor,
} from "../state/actions/tool.mjs";
import {
  isRightShoulderGamepadButtonPressed,
  isLeftShoulderGamepadButtonPressed,
  getGamepad,
} from "../controls/gamepad.mjs";
import { getPanelColors } from "../dom.mjs";
import { updateActivatedButton } from "./utils.mjs";

const GAMEPAD_BUTTON_ACTIVATION_DELAY_IN_MS = 300;

function attachKeyboardListeners(state) {
  function onKeyDown(event) {
    switch (event.key) {
      case "a":
        setNextColor({ state });
        break;
      case "z":
        setPreviousColor({ state });
        break;
      default:
        break;
    }
  }

  window.addEventListener("keydown", onKeyDown);

  return function dispose() {
    window.removeEventListener("keydown", onKeyDown);
  };
}

function attachGamepadListeners(state) {
  let frame = null;
  let buttonPressedTimestamp = null;

  function activateColorCycleOnShoulderButtonPresses(timestamp) {
    const gamepad = getGamepad(state);

    if (!gamepad) {
      requestGamepadAnimationFrame();
      return;
    }

    const buttonPressedDelta = timestamp - buttonPressedTimestamp;

    if (
      isRightShoulderGamepadButtonPressed(gamepad) &&
      buttonPressedDelta > GAMEPAD_BUTTON_ACTIVATION_DELAY_IN_MS
    ) {
      setNextColor({ state });
      buttonPressedTimestamp = timestamp;
    } else if (
      isLeftShoulderGamepadButtonPressed(gamepad) &&
      buttonPressedDelta > GAMEPAD_BUTTON_ACTIVATION_DELAY_IN_MS
    ) {
      setPreviousColor({ state });
      buttonPressedTimestamp = timestamp;
    }

    requestGamepadAnimationFrame();
  }

  function requestGamepadAnimationFrame() {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }

    frame = requestAnimationFrame(activateColorCycleOnShoulderButtonPresses);
  }

  function cancelGamepadAnimationFrame() {
    cancelAnimationFrame(frame);
    frame = null;
  }

  requestGamepadAnimationFrame();

  return function dispose() {
    cancelGamepadAnimationFrame();
  };
}

export function createColorPanel({ state }) {
  const colors = getPanelColors();
  let disposeKeyboardListenersCallback = null;
  let disposeGamepadListenersCallback = null;

  state.addListener((nextState, prevState) => {
    if (nextState.color === prevState.color) {
      return;
    }

    updateActivatedButton(colors, nextState.color);
  });

  state.addListener((nextState, prevState) => {
    if (nextState.blockedInteractions === prevState.blockedInteractions) {
      return;
    }

    if (nextState.blockedInteractions) {
      if (disposeKeyboardListenersCallback) {
        disposeKeyboardListenersCallback();
        disposeKeyboardListenersCallback = null;
      }

      if (disposeGamepadListenersCallback) {
        disposeGamepadListenersCallback();
        disposeGamepadListenersCallback = null;
      }
    } else {
      disposeKeyboardListenersCallback = attachKeyboardListeners(state);
      disposeGamepadListenersCallback = attachGamepadListeners(state);
    }
  });

  COLOR_LIST.forEach((color) => {
    const button = document.createElement("button");
    button.style.backgroundColor = color;

    button.addEventListener("click", () => {
      setColor(color, { state });
    });

    button.dataset.value = color;
    button.style.backgroundColor = color;

    colors.appendChild(button);
  });

  const selectedColor = state.get((prevState) => prevState.color);

  if (selectedColor) {
    updateActivatedButton(colors, selectedColor);
  }

  disposeKeyboardListenersCallback = attachKeyboardListeners(state);
  disposeGamepadListenersCallback = attachGamepadListeners(state);
}
