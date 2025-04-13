import {
  getGamepad,
  isPrimaryGamepadButtonPressed,
} from "../controls/gamepad.mjs";
import { usesTouchDevice } from "../controls/touch.mjs";
import { getCanvas } from "../dom.mjs";
import { isWithinCanvasBounds } from "../canvas.mjs";

const ctx = getCanvas().getContext("2d");

export function activatePen({ state, variant }) {
  let inProgress = false;
  let color = state.get((prevState) => prevState.color);
  let isHoldingSpacebar = false;
  let frame = null;
  const isTouchDevice = usesTouchDevice();

  function draw(x, y) {
    ctx.lineWidth = variant.value;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.moveTo(x, y);
  }

  function mouseDown() {
    inProgress = true;
    ctx.beginPath();
  }

  function mouseUp() {
    inProgress = false;
  }

  function mouseMove(event) {
    if (!inProgress) return;

    const x = event.clientX;
    const y = event.clientY;

    draw(x, y);
  }

  function touchStart(event) {
    if (event.touches.length === 0) {
      return;
    }

    const touch = event.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;

    if (!isWithinCanvasBounds(x, y)) {
      return;
    }

    event.preventDefault();

    mouseDown();
  }

  function touchEnd() {
    mouseUp();
  }

  function touchMove(event) {
    event.preventDefault();

    if (!inProgress || event.touches.length === 0) return;

    const touch = event.touches[0];

    const x = touch.clientX;
    const y = touch.clientY;

    draw(x, y);
  }

  function keyUp(event) {
    if (isHoldingSpacebar && event.code !== "Space") {
      return;
    }

    isHoldingSpacebar = false;
    inProgress = false;
  }

  function keyDown(event) {
    if (event.code !== "Space") {
      return;
    }

    isHoldingSpacebar = true;

    inProgress = true;
    ctx.beginPath();
  }

  let wasPrimaryGamepadButtonPressed = false;
  function activatePenOnGamepadButtonPress() {
    const gamepad = getGamepad(state);

    if (!gamepad) {
      requestGamepadAnimationFrame();
      return;
    }

    const pressed = isPrimaryGamepadButtonPressed(gamepad);
    const cursor = state.get((prevState) => prevState.cursor);

    if (!wasPrimaryGamepadButtonPressed && pressed) {
      ctx.beginPath();
    }

    if (pressed) {
      draw(cursor.x, cursor.y);
      wasPrimaryGamepadButtonPressed = true;
    } else {
      wasPrimaryGamepadButtonPressed = false;
    }

    requestGamepadAnimationFrame();
  }

  function requestGamepadAnimationFrame() {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }

    frame = requestAnimationFrame(activatePenOnGamepadButtonPress);
  }

  function cancelGamepadAnimationFrame() {
    cancelAnimationFrame(frame);
    frame = null;
  }

  function attachKeyboardListeners() {
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
  }

  function unattachKeyboardListeners() {
    window.removeEventListener("keydown", keyDown);
    window.removeEventListener("keyup", keyUp);
  }

  function attachTouchListeners() {
    if (!isTouchDevice) {
      return;
    }

    window.addEventListener("touchstart", touchStart, { passive: false });
    window.addEventListener("touchend", touchEnd, { passive: false });
    window.addEventListener("touchmove", touchMove, { passive: false });
  }

  function unattachTouchListeners() {
    if (!isTouchDevice) {
      return;
    }

    window.removeEventListener("touchstart", touchStart);
    window.removeEventListener("touchend", touchEnd);
    window.removeEventListener("touchmove", touchMove);
  }

  function attachMouseListeners() {
    if (isTouchDevice) {
      return;
    }

    window.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("mousemove", mouseMove);
  }

  function unattachMouseListeners() {
    if (isTouchDevice) {
      return;
    }
    window.removeEventListener("mousedown", mouseDown);
    window.removeEventListener("mouseup", mouseUp);
    window.removeEventListener("mousemove", mouseMove);
  }

  function activateListeners() {
    attachMouseListeners();
    attachKeyboardListeners();
    attachTouchListeners();
    requestGamepadAnimationFrame();
  }

  function deactivateListeners() {
    unattachMouseListeners();
    unattachKeyboardListeners();
    unattachTouchListeners();
    cancelGamepadAnimationFrame();
  }

  activateListeners();

  function updateColor(nextState, prevState) {
    if (nextState.color === prevState.color) {
      return;
    }

    color = nextState.color;
  }

  function updatePath(nextState, prevState) {
    if (nextState.cursor === prevState.cursor || !isHoldingSpacebar) {
      return;
    }

    if (!inProgress) {
      return;
    }

    draw(nextState.cursor.x, nextState.cursor.y);
  }

  state.addListener(updateColor);
  state.addListener(updatePath);

  return function dispose() {
    deactivateListeners();
    state.removeListener(updateColor);
    state.removeListener(updatePath);
  };
}
