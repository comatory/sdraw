import {
  DEFAULT_TOOL,
  DEFAULT_TOOL_VARIANTS,
  DEFAULT_COLOR,
  TOOLS,
} from "./state.mjs";

export function loadToolWithVariants() {
  const storedValue = window.sessionStorage.getItem("tool");

  if (!storedValue) {
    return {
      tool: DEFAULT_TOOL,
      activatedVariants: DEFAULT_TOOL_VARIANTS,
    };
  }

  const storedIds = JSON.parse(storedValue);

  const tool = Object.values(TOOLS).find(
    ({ id }) => id.description === storedIds.tool
  );

  if (!tool) {
    throw new Error(`Tool not found: ${storedIds.tool}`);
  }

  const variant = storedIds.variant
    ? tool.variants.find(({ id }) => id.description === storedIds.variant)
    : null;

  if (storedIds.variant && !variant) {
    throw new Error(`Variant not found: ${storedIds.variant}`);
  }

  const activatedVariants = new Map(DEFAULT_TOOL_VARIANTS);

  if (variant) {
    activatedVariants.set(tool.id, variant);
  }

  return { tool, activatedVariants };
}

export function loadColor() {
  return window.sessionStorage.getItem("color") || DEFAULT_COLOR;
}

export function storeTool(tool, variant) {
  window.sessionStorage.setItem(
    "tool",
    JSON.stringify({
      tool: tool.id.description,
      variant: variant?.id.description ?? null,
    })
  );
}

export function storeColor(color) {
  window.sessionStorage.setItem("color", color);
}
