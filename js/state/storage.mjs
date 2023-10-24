import { DEFAULT_TOOL, DEFAULT_COLOR, TOOLS } from "./state.mjs";

export function loadTool() {
  const storedValue = window.sessionStorage.getItem("tool") 

  if (!storedValue) {
    return DEFAULT_TOOL;
  }

  return Object.values(TOOLS).find((tool) => tool.id.description === storedValue) ?? DEFAULT_TOOL;
}

export function loadColor() {
  return window.sessionStorage.getItem("color") || DEFAULT_COLOR;
}

export function storeTool(tool) {
  window.sessionStorage.setItem("tool", tool.id.description);
}

export function storeColor(color) {
  window.sessionStorage.setItem("color", color);
}
