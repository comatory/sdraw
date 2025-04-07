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
import {
  getPanelColors,
  getColorButtons,
  getColorButtonByColor,
} from "../dom.mjs";
import { ColorButton } from "./color.mjs";

const GAMEPAD_BUTTON_ACTIVATION_DELAY_IN_MS = 300;

function attachKeyboardListeners({ state, signal }) {
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

  window.addEventListener("keydown", onKeyDown, { signal });
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

  requestGamepadAnimationFrame();
}

export function createColorPanel({ state }) {
  const colors = getPanelColors();
  let controller = new AbortController();

  state.addListener((nextState, prevState) => {
    if (nextState.color === prevState.color) {
      return;
    }

    const prevActiveButton = Array.from(getColorButtons()).find(
      (b) => b.isActive,
    );
    prevActiveButton.isActive = false;

    const nextActiveButton = getColorButtonByColor(nextState.color);

    if (!nextActiveButton) {
      throw new Error(`Color button not found for color: ${nextState.color}`);
    }

    nextActiveButton.isActive = true;
  });

  state.addListener((nextState, prevState) => {
    if (nextState.blockedInteractions === prevState.blockedInteractions) {
      return;
    }

    if (nextState.blockedInteractions) {
      if (!controller.signal.aborted) {
        controller.abort();
        controller = new AbortController();
      }
    } else {
      attachKeyboardListeners({ state, signal: controller.signal });
      attachGamepadListeners(state);
    }
  });

  COLOR_LIST.forEach((color) => {
    const colorButton = new ColorButton({
      color,
      onClick: () => setColor(color, { state }),
      signal: controller.signal,
      isActive: state.get((prevState) => prevState.color) === color,
    });

    colors.appendChild(colorButton);
  });

  attachKeyboardListeners({ state, signal: controller.signal });
  attachGamepadListeners(state);
}
