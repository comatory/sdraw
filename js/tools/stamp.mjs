import { getCanvas } from "../dom.mjs";
import { TOOLS } from "../state/state.mjs";
import { isWithinCanvasBounds } from "../canvas.mjs";
import {
  createSvgDataUri,
  serializeSvg,
  deserializeSvg,
  deserializeSvgFromDataURI,
} from "../svg-utils.mjs";
import { isDataUri } from "../state/utils.mjs";

function setSvgPathColor(svg, color) {
  Array.from(svg.querySelectorAll("path")).forEach((path) => {
    path.setAttribute("stroke", color);
  });

  return svg;
}

export function activateStamp({ state }) {
  const ctx = getCanvas().getContext("2d");

  function placeStamp({ x, y, svg, color }) {
    setSvgPathColor(svg, color);
    const data = createSvgDataUri(serializeSvg(svg));

    const image = new Image();
    image.onload = () => {
      ctx.drawImage(image, x, y);
    };
    image.src = data;
  }

  function drawStamp(x, y, stamp) {
    const color = state.get((prevState) => prevState.color);

    if (isDataUri(stamp.value)) {
      const doc = deserializeSvgFromDataURI(stamp.value);

      placeStamp({ x, y, svg: doc.documentElement, color });
      return;
    }

    window
      .fetch(stamp.iconUrl)
      .then((response) => response.text())
      .then((svg) => {
        const doc = deserializeSvg(svg);

        placeStamp({ x, y, svg: doc.documentElement, color });
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

  function keyDown(event) {
    if (event.code !== "Space") {
      return;
    }

    const activeStamp = state.get((prevState) =>
      prevState.activatedVariants.get(TOOLS.STAMP.id),
    );

    if (!activeStamp) {
      return;
    }

    const x = state.get((prevState) => prevState.cursor.x);
    const y = state.get((prevState) => prevState.cursor.y);

    if (!isWithinCanvasBounds(x, y)) {
      return;
    }

    drawStamp(x, y, activeStamp);
  }

  window.addEventListener("click", mouseClick);
  window.addEventListener("keydown", keyDown);

  return function dispose() {
    window.removeEventListener("click", mouseClick);
    window.removeEventListener("keydown", keyDown);
  };
}
