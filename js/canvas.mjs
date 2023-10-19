export function prepareCanvasRestoration(canvas) {
  const context = canvas.getContext("2d");
  const dataUri = canvas.toDataURL();
  const image = new Image();
  image.src = dataUri;

  return function restoreCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
  }
}
