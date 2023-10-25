import { TOOLS } from "../state/state.mjs";

const ICON_PATHS = {
  [TOOLS.PEN.id.description]: "img/tools/pen.svg",
  [TOOLS.FILL.id.description]: "img/tools/fill.svg",
  [TOOLS.CAM.id.description]: "img/tools/cam.svg",
  [TOOLS.STAMP.id.description]: "img/tools/stamp.svg",
}

export async function loadIcon(id) {
  const path = ICON_PATHS[id];

  if (!path) {
    throw new Error(`No icon path for ${id}`);
  }

  const response = await fetch(path);

  return response.text();
}
