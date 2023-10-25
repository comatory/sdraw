import { getCanvas } from "../dom.mjs";
import { TOOLS } from "../state/state.mjs";
import { isWithinCanvasBounds } from "../canvas.mjs";

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

  function drawStamp(x, y, url) {
    const color = state.get((prevState) => prevState.color);

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
    const activeStamp = state.get((prevState) => prevState.activatedVariants.get(TOOLS.STAMP.id));

    if (!activeStamp) {
      return;
    }

    const x = event.clientX;
    const y = event.clientY;

    if (!isWithinCanvasBounds(x, y)) {
      return;
    }

    const stampUrl = activeStamp.iconUrl;

    drawStamp(x, y, stampUrl);
  }

  window.addEventListener("click", mouseClick);

  return function dispose() {
    window.removeEventListener("click", mouseClick);
  };
}
