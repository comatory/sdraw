export function getCanvas() {
  return document.getElementById("canvas");
}

export function getCursorCanvas() {
  return document.getElementById("cursor");
}

export function getPanelTools() {
  return document.getElementById("tools");
}

export function getPanelToolVariants() {
  return document.getElementById("variants");
}

export function getPanelToolActions() {
  return document.getElementById("actions");
}

export function getPanelColors() {
  return document.getElementById("colors");
}

export function getPanel() {
  return document.getElementById("panel");
}

export function getCam() {
  return document.getElementById("cam");
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

export function setVideoSizeByCanvasSize(canvas) {
  const video = getCam();

  video.style.width = `${canvas.width}px`;
  video.style.height = `${canvas.height}px`;
}
