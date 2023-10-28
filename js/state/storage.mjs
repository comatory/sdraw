import {
  DEFAULT_TOOL,
  DEFAULT_TOOL_VARIANTS,
  DEFAULT_COLOR,
  DEFAULT_CUSTOM_VARIANTS,
  TOOLS,
} from "./state.mjs";

export function loadToolWithVariants(customVariants) {
  const storedValue = window.localStorage.getItem("tool");

  if (!storedValue) {
    return {
      tool: DEFAULT_TOOL,
      activatedVariants: DEFAULT_TOOL_VARIANTS,
    };
  }

  const storedIds = JSON.parse(storedValue);

  const tool = Object.values(TOOLS).find(
    ({ id }) => id.description === storedIds.tool,
  );

  if (!tool) {
    throw new Error(`Tool not found: ${storedIds.tool}`);
  }

  const customToolVariants = customVariants?.get(tool.id) ?? new Set();
  const variant = storedIds.variant
    ? [...tool.variants, ...customToolVariants].find(
        ({ id }) => id.description === storedIds.variant,
      )
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
  return window.localStorage.getItem("color") || DEFAULT_COLOR;
}

export function storeTool(tool, variant) {
  window.localStorage.setItem(
    "tool",
    JSON.stringify({
      tool: tool.id.description,
      variant: variant?.id.description ?? null,
    }),
  );
}

export function storeColor(color) {
  window.localStorage.setItem("color", color);
}

export function loadCustomVariants() {
  const storedValue = window.localStorage.getItem("customVariants");

  if (!storedValue) {
    storeCustomVariants(DEFAULT_CUSTOM_VARIANTS);

    return DEFAULT_CUSTOM_VARIANTS;
  }

  return JSON.parse(storedValue, customVariantsDeserializer);
}

export function storeCustomVariants(variants) {
  window.localStorage.setItem(
    "customVariants",
    JSON.stringify(variants, customVariantsSerializer),
  );
}

function customVariantsSerializer(key, value) {
  if (value instanceof Map) {
    const obj = Object.fromEntries(value);
    for (const sym of Object.getOwnPropertySymbols(obj)) {
      return {
        [sym.description]: customVariantsSerializer(sym.description, obj[sym]),
      };
    }
  }

  if (value instanceof Set) {
    return Array.from(value).map(({ id, ...rest }) => ({
      id: id.description,
      ...rest,
    }));
  }

  if (value instanceof Symbol) {
    return value.description;
  }

  return value;
}

function findToolSymbol(description) {
  return Object.values(TOOLS).find(({ id }) => id.description === description)
    ?.id;
}

function findCustomVariantSymbol(description) {
  return Array.from(DEFAULT_CUSTOM_VARIANTS.values())
    .flatMap((variants) => Array.from(variants))
    .find(({ id }) => id.description === description)?.id;
}

function customVariantsDeserializer(key, value) {
  if (Array.isArray(value)) {
    return new Set(value);
  }

  if (value?.toString() === "[object Object]") {
    if (key === "") {
      return new Map(
        Object.entries(value).map(([mapKey, mapValue]) => [
          findToolSymbol(mapKey),
          mapValue,
        ]),
      );
    }

    return {
      ...value,
      id: findCustomVariantSymbol(value.id),
    };
  }

  return value;
}
