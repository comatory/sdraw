import { drawCursor } from "../cursor.mjs";
import { activatePen } from "../tools/pen.mjs";
import { activateFill } from "../tools/fill.mjs";
import { activateCam } from "../tools/cam.mjs";
import { activateStamp } from "../tools/stamp.mjs";
import { TOOLS, COLOR_LIST } from "./state.mjs";
import { storeTool, storeColor, storeCustomVariants } from "./storage.mjs";
import {
  getCam,
  getCanvas,
  insertCountdown,
  removeCountdown,
  getCountdownAnimationLengthInSeconds,
  getFlashAnimationLengthInSeconds,
} from "../dom.mjs";

let disposeCallback;
const MAXIMUM_CURSOR_ACCERATION = 20;

export async function setTool(tool, { state, variant }) {
  if (disposeCallback) {
    disposeCallback();
    disposeCallback = null;
  }

  state.set(() => ({
    tool,
  }));

  const restoredVariant = !variant
    ? state.get((prevState) => prevState.activatedVariants.get(tool.id))
    : null;

  const nextVariant = variant || restoredVariant;

  if (nextVariant) {
    activateVariant(tool, nextVariant, { state });
  }

  storeTool(tool, nextVariant);

  switch (state.get((prevState) => prevState.tool.id)) {
    case TOOLS.PEN.id:
      disposeCallback = activatePen({ state, variant: nextVariant });
      break;
    case TOOLS.FILL.id:
      disposeCallback = activateFill({ state });
      break;
    case TOOLS.CAM.id:
      disposeCallback = await activateCam({ state });
      break;
    case TOOLS.STAMP.id:
      disposeCallback = activateStamp({ state, variant: nextVariant });
      break;
    default:
      break;
  }
}

export function setColor(color, { state }) {
  state.set(() => ({
    color,
  }));

  storeColor(color);
}

export function setNextColor({ state }) {
  const currentColor = state.get((prevState) => prevState.color);
  const nextColor = COLOR_LIST.at(
    (COLOR_LIST.indexOf(currentColor) + 1) % COLOR_LIST.length
  );

  setColor(nextColor, { state });
}

export function setPreviousColor({ state }) {
  const currentColor = state.get((prevState) => prevState.color);
  const nextColor = COLOR_LIST.at(
    (COLOR_LIST.indexOf(currentColor) - 1) % COLOR_LIST.length
  );

  setColor(nextColor, { state });
}

export function setCursor(cursor, { state }) {
  state.set(() => ({
    cursor,
  }));
}

export function moveCursor({ acceleration, state, keysPressed }) {
  const length = Math.min(
    acceleration && acceleration.key === event.key
      ? acceleration.acceleration
      : 1,
    MAXIMUM_CURSOR_ACCERATION
  );

  const cursor = state.get((prevState) => prevState.cursor);
  const nextCursor = {
    ...cursor,
    x:
      cursor.x +
      ((keysPressed.right ? 1 + length : 0) +
        (keysPressed.left ? -1 - length : 0)),
    y:
      cursor.y +
      ((keysPressed.down ? 1 + length : 0) +
        (keysPressed.up ? -1 - length : 0)),
  };

  setCursor(nextCursor, { state });
  drawCursor(nextCursor.x, nextCursor.y);
}

export function setGamepadIndex(index, { state }) {
  state.set(() => ({
    gamepad: index,
  }));
}

function activateVariant(tool, variant, { state }) {
  const activatedVariants = state.get(
    (prevState) => prevState.activatedVariants
  );

  const variants = new Map(activatedVariants);

  variants.set(tool.id, variant);

  state.set(() => ({
    activatedVariants: variants,
  }));
}

export function memorizePhoto({ state }) {
  state.set(() => ({
    photoMemorized: true,
  }));
}

export function unsetPhoto({ state }) {
  state.set(() => ({
    photoMemorized: false,
  }));
}

export function takePhoto({ state }) {
  const cam = getCam();
  const canvas = getCanvas();
  const ctx = canvas.getContext("2d");
  const countdownAnimationLength =
    getCountdownAnimationLengthInSeconds() * 1000;
  const flashAnimationLength = getFlashAnimationLengthInSeconds() * 1000;

  insertCountdown();
  blockInteractions({ state });

  setTimeout(() => {
    ctx.drawImage(cam, 0, 0, canvas.width, canvas.height);
    memorizePhoto({ state });
    removeCountdown();
    unblockInteractions({ state });
  }, countdownAnimationLength + flashAnimationLength);
}

export function removePhoto({ state }) {
  const canvas = getCanvas();
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  unsetPhoto({ state });
}

export function blockInteractions({ state }) {
  state.set(() => ({
    blockedInteractions: true,
  }));
}

export function unblockInteractions({ state }) {
  state.set(() => ({
    blockedInteractions: false,
  }));
}

function produceUpdatedCustomVariants({
  previousCustomVariants,
  tool,
  variant,
}) {
  const nextCustomVariants = new Map(previousCustomVariants);

  const toolVariants = Array.from(new Set(nextCustomVariants.get(tool.id)));

  const variantIndex = toolVariants.findIndex(
    (customVariant) => customVariant.id === variant.id
  );

  if (variantIndex === -1) {
    throw new Error("Variant not found");
  }

  toolVariants.splice(variantIndex, 1, variant);

  const nextToolVariants = new Set(toolVariants);
  nextCustomVariants.set(tool.id, nextToolVariants);

  return nextCustomVariants;
}

export function setCustomVariant(tool, variant, { state }) {
  const nextCustomVariants = produceUpdatedCustomVariants({
    tool,
    variant,
    previousCustomVariants: state.get((prevState) => prevState.customVariants),
  });

  storeCustomVariants(nextCustomVariants);

  state.set(() => ({
    customVariants: nextCustomVariants,
  }));
}
