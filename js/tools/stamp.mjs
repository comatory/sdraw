import { getCanvas } from "../dom.mjs";

export const DEFAULT_STAMPS = Object.freeze(["star.svg"]);

export function activateStamp({ state }) {
  const ctx = getCanvas().getContext("2d");

  function placeStamp(x, y, data) {
    const dataUri = `data:image/svg+xml;base64,${window.btoa(data)}`;
    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, x, y);
    };
    image.src = dataUri;
  }

  function drawStamp(x, y, stamp) {
    const url = `/img/stamps/${stamp}`;
    const color = state.get((state) => state.color);

    window
      .fetch(url)
      .then((response) => response.text())
      .then((svg) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svg, "image/svg+xml");
        const svgElement = doc.documentElement;

        Array.from(svgElement.querySelectorAll("path")).forEach((path) => {
          path.setAttribute("stroke", color);
        });

        const serializedSvg = new XMLSerializer().serializeToString(svgElement);

        placeStamp(x, y, serializedSvg);
      })
      .catch((error) => {
        alert(error);
      });
  }

  function mouseClick(event) {
    // TODO: allow to select stamp
    const activeStamp = DEFAULT_STAMPS[0];

    const x = event.clientX;
    const y = event.clientY;

    drawStamp(x, y, activeStamp);
  }

  window.addEventListener("click", mouseClick);

  return function dispose() {
    window.removeEventListener("click", mouseClick);
  };
}
