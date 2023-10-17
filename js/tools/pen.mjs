import { getCanvas } from "../dom.mjs";

const ctx = getCanvas().getContext("2d");

export function activatePen({ state }) {
  let inProgress = false;
  let color = state.get((state) => state.color);

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

    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.moveTo(x, y);
  }

  window.addEventListener("mousedown", mouseDown);
  window.addEventListener("mouseup", mouseUp);
  window.addEventListener("mousemove", mouseMove);

  function updateColor(state) {
    if (state.color === color) {
      return;
    }

    color = state.color;
  }

  state.addListener(updateColor);

  return function dispose() {
    state.removeListener(updateColor);

    window.removeEventListener("mousedown", mouseDown);
    window.removeEventListener("mouseup", mouseUp);
    window.removeEventListener("mousemove", mouseMove);
  };
}

export function drawWithFill() {}
