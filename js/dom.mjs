export function getCanvas() {
  return document.getElementById("canvas");
}

export function getCursorCanvas() {
  return document.getElementById("cursor");
}

export function getPanelTools() {
  return document.getElementById("tools");
}

export function getPanelColors() {
  return document.getElementById("colors");
}

export function getPanel() {
  return document.getElementById("panel");
}

function getPanelBounds() {
  const panel = document.getElementById("panel");
  return panel.getBoundingClientRect();
}

export function setCanvasSizeByViewport(canvas) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

export function setCanvasSizeWithoutPanel(canvas) {
  const panelBounds = getPanelBounds();
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight - panelBounds.height;
}
