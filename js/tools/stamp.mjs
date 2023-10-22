import { getCanvas } from "../dom.mjs";

export const DEFAULT_STAMPS = Object.freeze([
  'star.svg',
]);

export function activateStamp({ stamp }) {
  const ctx = getCanvas().getContext('2d');

  function drawStamp(x, y, stamp) {
    const url = `/img/stamps/${stamp}`;

    const image = new Image();
    image.src = url;
    image.onload = () => {
      ctx.drawImage(image, x, y);
    };
  }

  function mouseClick(event) {
    // TODO: allow to select stamp
    const activeStamp = DEFAULT_STAMPS[0];

    const x = event.clientX;
    const y = event.clientY;

    drawStamp(x, y, activeStamp);
  }

  window.addEventListener('click', mouseClick);

  return function dispose() {
    window.removeEventListener('click', mouseClick);
  }
}
