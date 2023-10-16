import { getCanvas } from "../dom.mjs";
import { state } from "../state/state.mjs";

const ctx = getCanvas().getContext('2d');

export function activatePen() {
  let inProgress = false;

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
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.moveTo(x, y);
  }

  window.addEventListener('mousedown', mouseDown);
  window.addEventListener('mouseup', mouseUp);
  window.addEventListener('mousemove', mouseMove);

  return function dispose() {
    window.removeEventListener('mousedown', mouseDown);
    window.removeEventListener('mouseup', mouseUp);
    window.removeEventListener('mousemove', mouseMove);
  }
}

export function drawWithFill() {
}
