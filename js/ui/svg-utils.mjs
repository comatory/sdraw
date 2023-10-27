export function serializeSvg(svg) {
  return new XMLSerializer().serializeToString(svg);
}

export function deserializeSvg(svg) {
  const parser = new DOMParser();
  return parser.parseFromString(svg, "image/svg+xml");
}

export function createSvgFromBlob(blob) {
  const svg = document.createElement("svg");
  svg.setAttribute("width", 24);
  svg.setAttribute("height", 24);
  const svgImage = document.createElement("image");
  svgImage.setAttribute("xlink:href", blob);
  svgImage.setAttribute("width", 24);
  svgImage.setAttribute("height", 24);
  svg.appendChild(svgImage);

  return svg;
}
