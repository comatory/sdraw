import { TOOL_LIST, COLOR_LIST } from "../state/state.mjs";
import { setTool, setColor } from "../state/actions.mjs";
import { getPanel, getPanelTools, getPanelColors } from "../dom.mjs";

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

export function createToolPanel({ state }) {
  const tools = getPanelTools();

  state.addListener((state, prevState) => {
    if (state.tool === prevState.tool) {
      return;
    }

    updateActivatedButton(tools, state.tool.description);
  });

  TOOL_LIST.forEach((tool) => {
    const button = document.createElement("button");

    button.addEventListener(
      "click",
      () => {
        setTool(tool, { state });
      },
      true
    );

    button.dataset.value = tool.description;
    button.innerText = tool.description;

    tools.appendChild(button);
  });

  const selectedTool = state.get((state) => state.tool);

  if (selectedTool) {
    updateActivatedButton(tools, selectedTool.description);
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
