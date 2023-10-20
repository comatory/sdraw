import { getCanvas, getCursorCanvas } from "../dom.mjs";
import { isWithinCanvasBounds } from "../canvas.mjs";

function hexToRGB(h) {
  let r = 0,
    g = 0,
    b = 0;
  const a = 255;

  // 3 digits
  if (h.length == 4) {
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];

    // 6 digits
  } else if (h.length == 7) {
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  }

  return [+r, +g, +b, a];
}

function getPixel(imageData, x, y) {
  if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) {
    return [-1, -1, -1, -1]; // impossible color
  } else {
    const offset = (y * imageData.width + x) * 4;
    return imageData.data.slice(offset, offset + 4);
  }
}

function setPixel(imageData, x, y, color) {
  const offset = (y * imageData.width + x) * 4;
  imageData.data[offset + 0] = color[0];
  imageData.data[offset + 1] = color[1];
  imageData.data[offset + 2] = color[2];
  imageData.data[offset + 3] = color[3];
}

function colorsMatch(a, b) {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}

// taken from SO: https://stackoverflow.com/a/56221940/3056783
function floodFill(ctx, x, y, fillColor) {
  // read the pixels in the canvas
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);

  // get the color we're filling
  const targetColor = getPixel(imageData, x, y);

  // check we are actually filling a different color
  if (!colorsMatch(targetColor, fillColor)) {
    const pixelsToCheck = [x, y];
    while (pixelsToCheck.length > 0) {
      const y = pixelsToCheck.pop();
      const x = pixelsToCheck.pop();

      const currentColor = getPixel(imageData, x, y);
      if (colorsMatch(currentColor, targetColor)) {
        setPixel(imageData, x, y, fillColor);
        pixelsToCheck.push(x + 1, y);
        pixelsToCheck.push(x - 1, y);
        pixelsToCheck.push(x, y + 1);
        pixelsToCheck.push(x, y - 1);
      }
    }

    // put the data back
    ctx.putImageData(imageData, 0, 0);
  }
}

export function activateFill({ state }) {
  const ctx = getCanvas().getContext("2d");
  const cursorCanvas = getCursorCanvas();

  function mouseClick(event) {
    const color = state.get((state) => state.color);
    const x = event.clientX;
    const y = event.clientY;

    if (!isWithinCanvasBounds(x, y)) {
      return;
    }

    floodFill(ctx, x, y, hexToRGB(color));
  }

  cursorCanvas.addEventListener("click", mouseClick);

  return function dispose() {
    cursorCanvas.removeEventListener("click", mouseClick);
  };
}
