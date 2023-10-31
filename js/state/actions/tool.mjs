import { activatePen } from "../../tools/pen.mjs";
import { activateFill } from "../../tools/fill.mjs";
import { activateCam } from "../../tools/cam.mjs";
import { activateStamp } from "../../tools/stamp.mjs";
import { TOOLS, COLOR_LIST } from "../constants.mjs";
import { storeTool, storeColor, storeCustomVariants } from "../storage.mjs";

let disposeCallback;

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

function activateVariant(tool, variant, { state }) {
  const activatedVariants = state.get(
    (prevState) => prevState.activatedVariants,
  );

  const variants = new Map(activatedVariants);

  variants.set(tool.id, variant);

  state.set(() => ({
    activatedVariants: variants,
  }));
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
    (COLOR_LIST.indexOf(currentColor) + 1) % COLOR_LIST.length,
  );

  setColor(nextColor, { state });
}

export function setPreviousColor({ state }) {
  const currentColor = state.get((prevState) => prevState.color);
  const nextColor = COLOR_LIST.at(
    (COLOR_LIST.indexOf(currentColor) - 1) % COLOR_LIST.length,
  );

  setColor(nextColor, { state });
}

function produceUpdatedCustomVariants({
  previousCustomVariants,
  tool,
  variant,
}) {
  const nextCustomVariants = new Map(previousCustomVariants);

  const toolVariants = Array.from(new Set(nextCustomVariants.get(tool.id)));

  const variantIndex = toolVariants.findIndex(
    (customVariant) => customVariant.id === variant.id,
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
