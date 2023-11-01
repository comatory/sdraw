import { getGamepad, isPrimaryGamepadButtonPressed } from "../controls/gamepad.mjs";
import { getCanvas } from "../dom.mjs";

const ctx = getCanvas().getContext("2d");

export function activatePen({ state, variant }) {
  let inProgress = false;
  let color = state.get((prevState) => prevState.color);
  let isHoldingSpacebar = false;

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

  function activatePenOnGamepadButtonPress() {
    const gamepad = getGamepad(state);

    if (!gamepad) {
      return requestAnimationFrame(activatePenOnGamepadButtonPress);
    }

    const pressed = isPrimaryGamepadButtonPressed(gamepad);
    inProgress = pressed;

    const cursor = state.get((prevState) => prevState.cursor);

    if (pressed) {
      draw(cursor.x, cursor.y);
    } else {
      ctx.beginPath();
    }

    requestAnimationFrame(activatePenOnGamepadButtonPress);
  }


  function activateListeners() {
    requestAnimationFrame(activatePenOnGamepadButtonPress);
    window.addEventListener("mousedown", mouseDown);
    window.addEventListener("mouseup", mouseUp);
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
  }

  function deactivateListeners() {
    cancelAnimationFrame(activatePenOnGamepadButtonPress);
    window.removeEventListener("mousedown", mouseDown);
    window.removeEventListener("mouseup", mouseUp);
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("keydown", keyDown);
    window.removeEventListener("keyup", keyUp);
  }

  function onBlockInteractionsChange(nextState, prevState) {
    if (nextState.blockedInteractions === prevState.blockedInteractions) {
      return;
    }

    if (nextState.blockedInteractions) {
      deactivateListeners();
    } else {
      activateListeners();
    }
  }

  const blockInteractions = state.get(
    (prevState) => prevState.blockedInteractions,
  );

  state.addListener(onBlockInteractionsChange);

  if (blockInteractions) {
    deactivateListeners();
  } else {
    activateListeners();
  }

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

  requestAnimationFrame(activatePenOnGamepadButtonPress);

  return function dispose() {
    state.removeListener(onBlockInteractionsChange);
    state.removeListener(updateColor);
    state.removeListener(updatePath);
    deactivateListeners();
  };
}
