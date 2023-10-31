import { getCanvas } from "../../dom.mjs";
import { storeCanvas } from "../storage.mjs";

export function resetCanvas() {
  const canvas = getCanvas();
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  storeCanvas(canvas);
}

export function exportImage() {
  const canvas = getCanvas();
  const data = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.download = "sdraw-export.png";
  link.href = data;

  const event = new MouseEvent("click");
  link.dispatchEvent(event);
}
