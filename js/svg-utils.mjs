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
  element.setAttribute("width", size);
  element.setAttribute("height", size);

  return element;
}

export function deserializeSvgFromDataURI(dataURI) {
  const base64 = dataURI.replace(/^data:image\/svg\+xml;base64,/, "");

  return deserializeSvg(window.atob(base64));
}
