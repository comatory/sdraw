import { COLOR } from "./state/constants.mjs";

export function getCanvas() {
  return document.getElementById("canvas");
}

export function getCursorCanvas() {
  return document.getElementById("cursor");
}

export function getPanelTools() {
  return document.getElementById("tools");
}

export function getToolButtons() {
  return getPanelTools().querySelectorAll("tool-button");
}

export function getToolButtonById(id) {
  return Array.from(getToolButtons()).find((button) => button.id === id);
}

export function getPanelToolVariants() {
  return document.getElementById("variants");
}

export function getVariantButtons() {
  return getPanelToolVariants().querySelectorAll(
    "variant-button,variant-stamp-button",
  );
}

export function getVariantButtonById(id) {
  return Array.from(getVariantButtons()).find((button) => button.id === id);
}

export function getPanelToolActions() {
  return document.getElementById("actions");
}

export function getPanelColors() {
  return document.getElementById("colors");
}

export function getColorButtons() {
  return getPanelColors().querySelectorAll("color-button");
}

export function getColorButtonByColor(color) {
  return Array.from(getColorButtons()).find((button) => button.color === color);
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

export function setCanvasFill(canvas) {
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = COLOR.WHITE;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

export function insertCountdown() {
  const countdown = document.createElement("div");
  countdown.id = "countdown";

  document.body.appendChild(countdown);
}

export function removeCountdown() {
  const countdown = document.getElementById("countdown");
  document.body.removeChild(countdown);
}

function getCSSVariableValue(name) {
  return window.getComputedStyle(document.body).getPropertyValue(name);
}

export function getCountdownAnimationLengthInSeconds() {
  const rawValue = getCSSVariableValue("--semaphore-animation-length");

  return Number.parseFloat(rawValue, 10);
}

export function getFlashAnimationLengthInSeconds() {
  const rawValue = getCSSVariableValue("--flash-animation-length");

  return Number.parseFloat(rawValue, 10);
}

export function getClearButton() {
  return document.getElementById("clear");
}

export function getSaveButton() {
  return document.getElementById("save");
}

export function getInfoButton() {
  return document.getElementById("info");
}

export function getInfoDialog() {
  return document.getElementById("info-dialog");
}

function getLoader() {
  return document.getElementById("loader");
}

export function showLoader() {
  const loader = getLoader();
  loader.style.display = "flex";
}

export function hideLoader() {
  const loader = getLoader();
  loader.style.display = "none";
}
