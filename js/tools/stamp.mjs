import { getCanvas } from "../dom.mjs";
import { TOOLS } from "../state/state.mjs";
import { isWithinCanvasBounds } from "../canvas.mjs";
import { serializeSvg, deserializeSvg } from "../ui/svg-utils.mjs";

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
    const color = state.get((prevState) => prevState.color);

    if (stamp.value) {
      placeStamp(x, y, stamp.value);
      return;
    }

    window
      .fetch(stamp.iconUrl)
      .then((response) => response.text())
      .then((svg) => {
        const doc = deserializeSvg(svg);
        const svgElement = doc.documentElement;

        Array.from(svgElement.querySelectorAll("path")).forEach((path) => {
          path.setAttribute("stroke", color);
        });

        const serializedSvg = serializeSvg(svgElement);

        placeStamp(x, y, serializedSvg);
      })
      .catch((error) => {
        alert(error);
      });
  }

  function mouseClick(event) {
    const activeStamp = state.get((prevState) =>
      prevState.activatedVariants.get(TOOLS.STAMP.id),
    );

    if (!activeStamp) {
      return;
    }

    const x = event.clientX;
    const y = event.clientY;

    if (!isWithinCanvasBounds(x, y)) {
      return;
    }

    drawStamp(x, y, activeStamp);
  }

  window.addEventListener("click", mouseClick);

  return function dispose() {
    window.removeEventListener("click", mouseClick);
  };
}
