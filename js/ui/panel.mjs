import {
  getGamepad,
  isPrimaryGamepadButtonPressed,
} from "../controls/gamepad.mjs";
import { getPanel } from "../dom.mjs";
import { isCursorWithinPanelBounds } from "./utils.mjs";
import { UiButton } from "./button.mjs";

function getPanelButtonByCoordinates(x, y, panel) {
  const buttons = panel.querySelectorAll(
    "ui-button,color-button,tool-button,variant-button,variant-stamp-button",
  );

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const buttonRect = button.getBoundingClientRect();

    if (
      x >= buttonRect.left &&
      x <= buttonRect.right &&
      y >= buttonRect.top &&
      y <= buttonRect.bottom
    ) {
      return button;
    }
  }
}

function activatePanelButtonOnCoordinates(x, y) {
  const panel = getPanel();
  const rect = panel.getBoundingClientRect();

  if (!isCursorWithinPanelBounds(x, y, rect)) {
    return;
  }

  const button = getPanelButtonByCoordinates(x, y, panel);

  if (!button) {
    return;
  }

  // do not bubble event
  const clickEvent = new MouseEvent("click", {
    view: window,
    bubbles: false,
  });

  if (
    button instanceof UiButton
  ) {
    button.click(clickEvent);

    return;
  }

  button.dispatchEvent(clickEvent);
}

function attachMouseListeners() {
  function handleMouseClick(event) {
    activatePanelButtonOnCoordinates(event.clientX, event.clientY);
  }

  window.addEventListener("click", handleMouseClick);

  return function dispose() {
    window.removeEventListener("click", handleMouseClick);
  };
}

function attachKeyboardListeners(state) {
  function handleKeyDown(event) {
    if (event.key !== "Enter") {
      return;
    }

    const cursor = state.get((prevState) => prevState.cursor);

    activatePanelButtonOnCoordinates(cursor.x, cursor.y);
  }

  window.addEventListener("keydown", handleKeyDown);

  return function dispose() {
    window.removeEventListener("keydown", handleKeyDown);
  };
}

function attachGamepadListeners(state) {
  let frame = null;
  let wasPressed = false;

  function activateButtonPressOnPrimaryGamepadButtonPress() {
    const gamepad = getGamepad(state);

    if (!gamepad) {
      requestGamepadAnimationFrame();
      return;
    }

    const pressed = isPrimaryGamepadButtonPressed(gamepad);
    const cursor = state.get((prevState) => prevState.cursor);

    if (pressed && !wasPressed) {
      wasPressed = true;
      activatePanelButtonOnCoordinates(cursor.x, cursor.y);
    } else if (!pressed) {
      wasPressed = false;
    }

    requestGamepadAnimationFrame();
  }

  function requestGamepadAnimationFrame() {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }

    frame = requestAnimationFrame(
      activateButtonPressOnPrimaryGamepadButtonPress,
    );
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

export function attachPanelListeners({ state }) {
  let disposeMouseListenersCallback = null;
  let disposeKeyboardListenersCallback = null;
  let disposeGamepadListenersCallback = null;

  function activateListeners() {
    if (disposeMouseListenersCallback) {
      disposeMouseListenersCallback();
      disposeMouseListenersCallback = null;
    }

    disposeMouseListenersCallback = attachMouseListeners();

    if (disposeKeyboardListenersCallback) {
      disposeKeyboardListenersCallback();
      disposeKeyboardListenersCallback = null;
    }

    disposeKeyboardListenersCallback = attachKeyboardListeners(state);

    if (disposeGamepadListenersCallback) {
      disposeGamepadListenersCallback();
      disposeGamepadListenersCallback = null;
    }

    disposeGamepadListenersCallback = attachGamepadListeners(state);
  }

  activateListeners();
}
