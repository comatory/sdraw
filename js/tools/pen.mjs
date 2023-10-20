import { getCanvas } from "../dom.mjs";

const ctx = getCanvas().getContext("2d");

export function activatePen({ state }) {
  let inProgress = false;
  let color = state.get((state) => state.color);
  let isHoldingSpacebar = false;

  function draw(x, y) {
    ctx.lineWidth = 5;
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

    const rect = getCanvas().getBoundingClientRect();
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

  window.addEventListener("mousedown", mouseDown);
  window.addEventListener("mouseup", mouseUp);
  window.addEventListener("mousemove", mouseMove);
  window.addEventListener("keydown", keyDown);
  window.addEventListener("keyup", keyUp);

  function updateColor(state, prevState) {
    if (state.color === prevState.color) {
      return;
    }

    color = state.color;
  }

  function updatePath(state, prevState) {
    if (state.cursor === prevState.cursor || !isHoldingSpacebar) {
      return;
    }

    if (!inProgress) {
      return;
    }

    draw(state.cursor.x, state.cursor.y);
  }

  state.addListener(updateColor);
  state.addListener(updatePath); 

  return function dispose() {
    state.removeListener(updateColor);
    state.removeListener(updatePath);

    window.removeEventListener("mousedown", mouseDown);
    window.removeEventListener("mouseup", mouseUp);
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("keydown", keyDown);
    window.removeEventListener("keyup", keyUp);
  };
}

export function drawWithFill() {}
