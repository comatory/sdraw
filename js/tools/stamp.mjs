import { getCanvas } from "../dom.mjs";
import { TOOLS } from "../state/constants.mjs";
import {
  getGamepad,
  isPrimaryGamepadButtonPressed,
} from "../controls/gamepad.mjs";
import { isWithinCanvasBounds } from "../canvas.mjs";
import {
  createSvgDataUri,
  serializeSvg,
  deserializeSvg,
  deserializeSvgFromDataURI,
  normalizeSvgSize,
} from "../svg-utils.mjs";
import { isDataUri } from "../state/utils.mjs";

function setSvgPathColor(svg, color) {
  [
    ...Array.from(svg.querySelectorAll("path")),
    ...Array.from(svg.querySelectorAll("circle")),
  ].forEach((path) => {
    if (path.getAttribute("stroke")) {
      path.setAttribute("stroke", color);
    } else {
      path.setAttribute("fill", color);
    }
  });

  return svg;
}

export function activateStamp({ state }) {
  const ctx = getCanvas().getContext("2d");
  let frame = null;

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
      const doc = stamp.size
        ? normalizeSvgSize(deserializeSvgFromDataURI(stamp.value), stamp.size)
        : deserializeSvgFromDataURI(stamp.value);

      placeStamp({ x, y, svg: doc.documentElement, color });
      return;
    }

    window
      .fetch(stamp.iconUrl)
      .then((response) => response.text())
      .then((svgData) => {
        const svg = stamp.size
          ? normalizeSvgSize(
              deserializeSvg(svgData).documentElement,
              stamp.size,
            )
          : deserializeSvg(svgData).documentElement;

        placeStamp({ x, y, svg, color });
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

  function activateStampOnGamepadButtonPress() {
    const gamepad = getGamepad(state);

    if (!gamepad) {
      requestGamepadAnimationFrame();
      return;
    }

    const pressed = isPrimaryGamepadButtonPressed(gamepad);
    const cursor = state.get((prevState) => prevState.cursor);

    if (pressed && isWithinCanvasBounds(cursor.x, cursor.y)) {
      const activeStamp = state.get((prevState) =>
        prevState.activatedVariants.get(TOOLS.STAMP.id),
      );

      drawStamp(cursor.x, cursor.y, activeStamp);
    }

    requestGamepadAnimationFrame();
  }

  function requestGamepadAnimationFrame() {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }

    frame = requestAnimationFrame(activateStampOnGamepadButtonPress);
  }

  function cancelGamepadAnimationFrame() {
    cancelAnimationFrame(frame);
    frame = null;
  }

  function activateListeners() {
    requestGamepadAnimationFrame();
    window.addEventListener("click", mouseClick);
    window.addEventListener("keydown", keyDown);
  }

  function deactivateListeners() {
    cancelGamepadAnimationFrame();
    window.removeEventListener("click", mouseClick);
    window.removeEventListener("keydown", keyDown);
  }

  activateListeners();

  return function dispose() {
    deactivateListeners();
  };
}
