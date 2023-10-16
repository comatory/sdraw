export function getCanvas() {
  return document.getElementById('canvas');
}

export function setCanvasSizeByViewport(canvas) {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
