export function createSvgDataUri(data) {
  return `data:image/svg+xml;base64,${window.btoa(data)}`;
}

export function serializeSvg(svg) {
  return new XMLSerializer().serializeToString(svg);
}

export function deserializeSvg(svg) {
  const parser = new DOMParser();
  return parser.parseFromString(svg, "image/svg+xml");
}

export function normalizeSvgSize(element, size = 24) {
  const singleDimension = Number.isFinite(size) ? size : null;
  const width = size.w ?? singleDimension;
  const height = size.h ?? singleDimension;

  element.setAttribute("width", width);
  element.setAttribute("height", height);

  return element;
}

export function deserializeSvgFromDataURI(dataURI) {
  const base64 = dataURI.replace(/^data:image\/svg\+xml;base64,/, "");

  return deserializeSvg(window.atob(base64));
}
