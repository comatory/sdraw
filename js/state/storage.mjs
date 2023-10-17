import { DEFAULT_TOOL, DEFAULT_COLOR } from "./state.mjs";

export function loadTool() {
  return window.sessionStorage.getItem("tool") || DEFAULT_TOOL;
}

export function loadColor() {
  return window.sessionStorage.getItem("color") || DEFAULT_COLOR;
}

export function storeTool(tool) {
  window.sessionStorage.setItem("tool", tool.description);
}

export function storeColor(color) {
  window.sessionStorage.setItem("color", color);
}
