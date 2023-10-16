import { activatePen } from "../tools/pen.mjs";
import { TOOLS } from "./state.mjs";

let disposeCallback;

export function setTool(tool, { state }) {
  if (disposeCallback) {
    disposeCallback();
  }

  state.set(state => ({
    tool,
  }));

  window.sessionStorage.setItem('tool', tool.description);

  switch (state.get(state => state.tool)) {
    case TOOLS.PEN:
      disposeCallback = activatePen();
      break;
    default:
      break;
  }
}
