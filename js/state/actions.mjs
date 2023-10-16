import { activatePen } from "../tools/pen.mjs";
import { TOOLS, COLOR_LIST } from "./state.mjs";
import { storeTool, storeColor } from "./storage.mjs";

let disposeCallback;

export function setTool(tool, { state }) {
  if (disposeCallback) {
    disposeCallback();
    disposeCallback = null;
  }

  state.set(state => ({
    tool,
  }));

  storeTool(tool);

  switch (state.get(state => state.tool)) {
    case TOOLS.PEN:
      disposeCallback = activatePen({ state });
      break;
    default:
      break;
  }
}

export function setColor(color, { state }) {
  state.set(state => ({
    color,
  }));

  storeColor(color);
}

export function setNextColor({ state }) {
  const currentColor = state.get(state => state.color);
  const nextColor = COLOR_LIST.at((COLOR_LIST.indexOf(currentColor) + 1) % COLOR_LIST.length);

  setColor(nextColor, { state });
}

export function setPreviousColor({ state }) {
  const currentColor = state.get(state => state.color);
  const nextColor = COLOR_LIST.at((COLOR_LIST.indexOf(currentColor) - 1) % COLOR_LIST.length);

  setColor(nextColor, { state });
}
