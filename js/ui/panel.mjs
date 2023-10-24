import { TOOL_LIST, COLOR_LIST } from "../state/state.mjs";
import { setTool, setColor } from "../state/actions.mjs";
import {
  getPanel,
  getPanelTools,
  getPanelColors,
  getPanelToolVariants,
} from "../dom.mjs";

function isCursorWithinPanelBounds(x, y, rect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function getPanelButtonByCoordinates(x, y, panel) {
  const buttons = panel.querySelectorAll("button");

  for (let i = 0; i < buttons.length; i++) {
    const button = buttons[i];
    const buttonRect = button.getBoundingClientRect();

    if (
      x >= buttonRect.left &&
      x <= buttonRect.right &&
      y >= buttonRect.top &&
      y <= buttonRect.bottom
    ) {
      return button;
    }
  }
}

function activatePanelButtonOnCoordinates(x, y) {
  const panel = getPanel();
  const rect = panel.getBoundingClientRect();

  if (!isCursorWithinPanelBounds(x, y, rect)) {
    return;
  }

  const button = getPanelButtonByCoordinates(x, y, panel);

  if (!button) {
    return;
  }

  button.click();
}

export function attachPanelListeners({ state }) {
  window.addEventListener("click", (event) => {
    activatePanelButtonOnCoordinates(event.clientX, event.clientY);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const cursor = state.get((state) => state.cursor);

    activatePanelButtonOnCoordinates(cursor.x, cursor.y);
  });
}

function updateActivatedButton(buttonContainer, value) {
  const buttons = buttonContainer.querySelectorAll("button");

  Array.from(buttons).forEach((button) => {
    if (button.dataset.value === value) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

function buildToolVariants(tool, state) {
  const variantsContainer = getPanelToolVariants();

  const listeners = {};

  tool.variants.forEach((variant) => {
    const button = document.createElement("button");

    function onClick() {
      setTool(tool, { state, variant });
    }

    button.addEventListener("click", onClick);

    button.dataset.value = variant.id.description;
    button.innerText = variant.id.description;

    variantsContainer.appendChild(button);

    listeners[button.dataset.value] = onClick;
  });

  return function dispose() {
    Array.from(variantsContainer.querySelectorAll("button")).forEach(
      (button) => {
        const callback = listeners[button.dataset.value];

        if (!callback) {
          throw new Error("No callback registered!");
        }

        button.removeEventListener("click", callback);

        delete listeners[button.dataset.value];

        button.remove();
      }
    );

    if (Object.keys(listeners).length > 0) {
      throw new Error("Not all listeners were removed!");
    }

    variantsContainer.innerHTML = "";
  };
}

export function createToolPanel({ state }) {
  const tools = getPanelTools();
  let disposeVariantsCallback = null;

  state.addListener((updatedState, prevState) => {
    if (updatedState.tool === prevState.tool) {
      return;
    }

    if (disposeVariantsCallback) {
      disposeVariantsCallback();
      disposeVariantsCallback = null;
    }

    updateActivatedButton(tools, updatedState.tool.id.description);

    if (updatedState.tool.variants) {
      disposeVariantsCallback = buildToolVariants(updatedState.tool, state);
    }
  });

  TOOL_LIST.forEach((tool) => {
    const button = document.createElement("button");

    button.addEventListener(
      "click",
      () => {
        if (disposeVariantsCallback) {
          disposeVariantsCallback();
          disposeVariantsCallback = null;
        }

        setTool(tool, { state });
      },
      true
    );

    button.dataset.value = tool.id.description;
    button.innerText = tool.id.description;

    tools.appendChild(button);
  });

  const selectedTool = state.get((state) => state.tool);

  if (selectedTool) {
    updateActivatedButton(tools, selectedTool.id.description);

    if (selectedTool.variants) {
      disposeVariantsCallback = buildToolVariants(selectedTool, state);
    }
  }
}

export function createColorPanel({ state }) {
  const colors = getPanelColors();

  state.addListener((state, prevState) => {
    if (state.color === prevState.color) {
      return;
    }

    updateActivatedButton(colors, state.color);
  });

  COLOR_LIST.forEach((color) => {
    const button = document.createElement("button");
    button.style.backgroundColor = color;

    button.addEventListener("click", () => {
      setColor(color, { state });
    });

    button.dataset.value = color;
    button.style.backgroundColor = color;

    colors.appendChild(button);
  });

  const selectedColor = state.get((state) => state.color);

  if (selectedColor) {
    updateActivatedButton(colors, selectedColor);
  }
}
