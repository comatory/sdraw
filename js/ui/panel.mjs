import { TOOLS, TOOL_LIST, COLOR_LIST } from "../state/state.mjs";
import {
  setTool,
  setColor,
  takePhoto,
  removePhoto,
  storeCustomVariant,
} from "../state/actions.mjs";
import { isDataUri } from "../state/utils.mjs";
import {
  getPanel,
  getPanelTools,
  getPanelColors,
  getPanelToolVariants,
  getPanelToolActions,
} from "../dom.mjs";
import { loadIcon } from "./load-icon.mjs";
import { createSvgFromBlob, serializeSvg } from "./svg-utils.mjs";

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

  // do not bubble event
  const clickEvent = new MouseEvent("click", {
    view: window,
    bubbles: false,
  });

  button.dispatchEvent(clickEvent);
}

export function attachPanelListeners({ state }) {
  window.addEventListener("click", (event) => {
    activatePanelButtonOnCoordinates(event.clientX, event.clientY);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    const cursor = state.get((prevState) => prevState.cursor);

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

function buildToolActions(tool, state) {
  const actionsContainer = getPanelToolActions();

  const listeners = {};

  tool.actions.forEach((action) => {
    const button = document.createElement("button");

    function onCamTakePhotoClick() {
      takePhoto({ state });
    }

    function onCamCancelClick() {
      removePhoto({ state });
    }

    switch (action.id.description) {
      case "cam-take-photo": {
        listeners[action.id.description] = onCamTakePhotoClick;
        button.addEventListener("click", onCamTakePhotoClick);
        break;
      }
      case "cam-cancel": {
        listeners[action.id.description] = onCamCancelClick;
        button.addEventListener("click", onCamCancelClick);
        break;
      }
    }

    button.dataset.value = action.id.description;
    button.innerText = action.id.description;

    loadIcon(action.iconUrl)
      .then((icon) => {
        button.innerHTML = icon;
      })
      .catch((error) => {
        console.error(error);
        button.innerText = action.id.description;
      });

    actionsContainer.appendChild(button);
  });

  return function dispose() {
    Array.from(actionsContainer.querySelectorAll("button")).forEach(
      (button) => {
        disposeCallback(button, listeners);

        button.remove();
      }
    );

    ensureCallbacksRemoved(listeners);

    actionsContainer.innerHTML = "";
  };
}

function buildToolVariants(tool, state) {
  const variantsContainer = getPanelToolVariants();

  const listeners = {};

  const activatedVariant = state.get((prevState) =>
    prevState.activatedVariants.get(tool.id)
  );

  const customVariants = state.get(
    (prevState) => prevState.customVariants.get(tool.id) ?? new Set()
  );

  [...tool.variants, ...customVariants].forEach((variant) => {
    const button = document.createElement("button");

    function defaultOnClick() {
      setTool(tool, { state, variant });
      updateActivatedButton(variantsContainer, variant.id.description);
    }

    function customStampOnClick() {
      const fileInput = document.createElement("input");

      function handleFileUpload(event) {
        const file = event.target.files[0];
        const failureEvent = new CustomEvent("stamp-custom-slot-failure");

        if (!file) {
          fileInput.dispatchEvent(failureEvent);
          throw new Error("No file selected!");
        }

        const fileReader = new FileReader();
        fileReader.addEventListener("load", (fileEvent) => {
          fileInput.dispatchEvent(
            new CustomEvent("stamp-custom-slot-success", {
              detail: {
                dataUri: fileEvent.srcElement.result,
                svgString: serializeSvg(
                  createSvgFromBlob(fileEvent.srcElement.result)
                ),
              },
            })
          );
        });
        fileReader.addEventListener("error", () => {
          fileInput.dispatchEvent(failureEvent);
        });

        fileReader.readAsDataURL(file);
      }

      fileInput.type = "file";
      fileInput.accept = "image/svg+xml";
      fileInput.style.display = "none";

      fileInput.addEventListener("stamp-custom-slot-success", async (event) => {
        fileInput.removeEventListener("change", handleFileUpload);
        fileInput.remove();

        const updatedVariant = {
          ...variant,
          value: event.detail.dataUri,
        };
        button.innerHTML = event.detail.svgString;
        storeCustomVariant(tool, updatedVariant, { state });
        setTool(tool, { state, variant: updatedVariant });
        updateActivatedButton(variantsContainer, updatedVariant.id.description);
      });
      fileInput.addEventListener("stamp-custom-slot-failure", () => {
        alert("Something went wrong with uploading the image!");
      });
      fileInput.addEventListener("change", handleFileUpload);

      fileInput.click();
    }

    function onClick() {
      switch (tool.id) {
        case TOOLS.STAMP.id:
          {
            if (!variant.value || isDataUri(variant.value)) {
              customStampOnClick();
            } else {
              defaultOnClick();
            }
          }
          break;
        default:
          defaultOnClick();
          break;
      }
    }

    button.addEventListener("click", onClick);

    button.dataset.value = variant.id.description;

    loadIcon(variant.iconUrl)
      .then((icon) => {
        button.innerHTML = icon;
      })
      .catch((error) => {
        console.error(error);
        button.innerText = variant.id.description;
      });

    variantsContainer.appendChild(button);

    if (variant.id === activatedVariant.id) {
      updateActivatedButton(variantsContainer, variant.id.description);
    }

    listeners[button.dataset.value] = onClick;
  });

  return function dispose() {
    Array.from(variantsContainer.querySelectorAll("button")).forEach(
      (button) => {
        disposeCallback(button, listeners);

        button.remove();
      }
    );

    ensureCallbacksRemoved(listeners);

    variantsContainer.innerHTML = "";
  };
}

export function createToolPanel({ state }) {
  const tools = getPanelTools();
  let disposeVariantsCallback = null;
  let disposeActionsCallback = null;

  state.addListener((updatedState, prevState) => {
    if (updatedState.tool === prevState.tool) {
      return;
    }

    if (disposeVariantsCallback) {
      disposeVariantsCallback();
      disposeVariantsCallback = null;
    }

    if (disposeActionsCallback) {
      disposeActionsCallback();
      disposeActionsCallback = null;
    }

    updateActivatedButton(tools, updatedState.tool.id.description);

    if (updatedState.tool.variants) {
      disposeVariantsCallback = buildToolVariants(updatedState.tool, state);
    }

    if (updatedState.tool.actions) {
      disposeActionsCallback = buildToolActions(updatedState.tool, state);
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

        if (disposeActionsCallback) {
          disposeActionsCallback();
          disposeActionsCallback = null;
        }

        setTool(tool, { state });
      },
      true
    );

    button.dataset.value = tool.id.description;

    loadIcon(tool.iconUrl)
      .then((icon) => {
        button.innerHTML = icon;
      })
      .catch((error) => {
        console.error(error);
        button.innerText = tool.id.description;
      });

    tools.appendChild(button);
  });

  const selectedTool = state.get((prevState) => prevState.tool);

  if (selectedTool) {
    updateActivatedButton(tools, selectedTool.id.description);

    if (selectedTool.variants) {
      disposeVariantsCallback = buildToolVariants(selectedTool, state);
    }

    if (selectedTool.actions) {
      disposeActionsCallback = buildToolActions(selectedTool, state);
    }
  }
}

export function createColorPanel({ state }) {
  const colors = getPanelColors();

  state.addListener((nextState, prevState) => {
    if (nextState.color === prevState.color) {
      return;
    }

    updateActivatedButton(colors, nextState.color);
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

  const selectedColor = state.get((prevState) => prevState.color);

  if (selectedColor) {
    updateActivatedButton(colors, selectedColor);
  }
}

function disposeCallback(button, listeners) {
  const callback = listeners[button.dataset.value];

  if (!callback) {
    throw new Error("No callback registered!");
  }

  button.removeEventListener("click", callback);

  delete listeners[button.dataset.value];
}

function ensureCallbacksRemoved(listeners) {
  if (Object.keys(listeners).length === 0) {
    return;
  }
  throw new Error("Not all listeners were removed!");
}
