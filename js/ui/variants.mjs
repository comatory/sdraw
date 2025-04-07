import { setTool, setCustomVariant } from "../state/actions/tool.mjs";
import { TOOLS } from "../state/constants.mjs";
import { getPanelToolVariants } from "../dom.mjs";
import {
  isLeftTriggerGamepadButtonPressed,
  isRightTriggerGamepadButtonPressed,
  getGamepad,
} from "../controls/gamepad.mjs";
import { updateActivatedButton } from "./utils.mjs";
import {
  createSvgDataUri,
  serializeSvg,
  deserializeSvgFromDataURI,
  normalizeSvgSize,
} from "../svg-utils.mjs";
import { VariantButton } from "./variant.mjs";

const GAMEPAD_BUTTON_ACTIVATION_DELAY_IN_MS = 300;

function readUploadedSVG(event, fileInput) {
  const file = event.target.files[0];
  const failureEvent = new CustomEvent("stamp-custom-slot-failure");

  if (!file) {
    fileInput.dispatchEvent(failureEvent);
    throw new Error("No file selected!");
  }

  const fileReader = new FileReader();
  fileReader.addEventListener("load", (fileEvent) => {
    const parsedSvgElement = deserializeSvgFromDataURI(
      fileEvent.srcElement.result,
    );
    const iconSvgDocument = parsedSvgElement.documentElement.cloneNode(true);
    const stampSvgDocument = parsedSvgElement.documentElement.cloneNode(true);
    const iconSvgElement = normalizeSvgSize(iconSvgDocument);
    const stampSvgElement = normalizeSvgSize(stampSvgDocument, 50);

    fileInput.dispatchEvent(
      new CustomEvent("stamp-custom-slot-success", {
        detail: {
          iconDataUri: createSvgDataUri(serializeSvg(iconSvgElement)),
          dataUri: createSvgDataUri(serializeSvg(stampSvgElement)),
        },
      }),
    );
  });
  fileReader.addEventListener("error", () => {
    fileInput.dispatchEvent(failureEvent);
  });

  fileReader.readAsDataURL(file);
}

function createFileInputForUpload() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/svg+xml";
  fileInput.style.display = "none";

  return fileInput;
}

function customStampOnClick({ tool, variant, state }) {
  const fileInput = createFileInputForUpload();

  function handleFileUpload(event) {
    readUploadedSVG(event, fileInput);
  }

  fileInput.addEventListener("stamp-custom-slot-success", async (event) => {
    fileInput.removeEventListener("change", handleFileUpload);
    fileInput.remove();

    const updatedVariant = {
      ...variant,
      iconUrl: event.detail.iconDataUri,
      value: event.detail.dataUri,
    };
    updateActivatedButton(
      getPanelToolVariants(),
      updatedVariant.id.description,
    );
    setTool(tool, { state, variant: updatedVariant });
    setCustomVariant(tool, updatedVariant, { state });
  });
  fileInput.addEventListener("stamp-custom-slot-failure", () => {
    alert("Something went wrong with uploading the image!");
  });
  fileInput.addEventListener("change", handleFileUpload);

  fileInput.click();
}

function defaultOnClick({ tool, variant, state }) {
  setTool(tool, { state, variant });
  updateActivatedButton(getPanelToolVariants(), variant.id.description);
}

function getVariantButtons(container) {
  return Array.from(container.querySelectorAll("button,variant-button"));
}

// do not bubble event to avoid clicks on canvas
function dispatchButtonClick(element) {
  element.dispatchEvent(
    new MouseEvent("click", {
      view: window,
      bubbles: false,
    }),
  );
}

function getNextButton(buttons, index) {
  return index + 1 < buttons.length ? buttons[index + 1] : buttons[0];
}

function getPreviousButton(buttons, index) {
  return index - 1 >= 0 ? buttons[index - 1] : buttons[buttons.length - 1];
}

function getButtonIndex(variantButtons, { state, tool }) {
  const activatedVariant = state.get((prevState) =>
    prevState.activatedVariants.get(tool.id),
  );

  const index = variantButtons.findIndex(
    (variantButton) =>
      variantButton.button.dataset.value === activatedVariant.id.description,
  );

  return index;
}

function attachGamepadListeners(container, tool, { state }) {
  let frame = null;
  let buttonPressedTimestamp = null;

  function activateVariantCycleOnShoulderButtonPresses(timestamp) {
    const gamepad = getGamepad(state);

    if (!gamepad) {
      requestGamepadAnimationFrame();
      return;
    }

    const buttonPressedDelta = timestamp - buttonPressedTimestamp;

    const index = getButtonIndex(getVariantButtons(container), {
      state,
      tool,
    });

    if (index === -1) {
      return;
    }

    if (
      isLeftTriggerGamepadButtonPressed(gamepad) &&
      buttonPressedDelta > GAMEPAD_BUTTON_ACTIVATION_DELAY_IN_MS
    ) {
      const prevButton = getPreviousButton(getVariantButtons(container), index);
      dispatchButtonClick(prevButton);
      buttonPressedTimestamp = timestamp;
    } else if (
      isRightTriggerGamepadButtonPressed(gamepad) &&
      buttonPressedDelta > GAMEPAD_BUTTON_ACTIVATION_DELAY_IN_MS
    ) {
      const nextButton = getNextButton(getVariantButtons(container), index);
      dispatchButtonClick(nextButton);
      buttonPressedTimestamp = timestamp;
    }

    requestGamepadAnimationFrame();
  }

  function requestGamepadAnimationFrame() {
    if (frame) {
      cancelAnimationFrame(frame);
      frame = null;
    }

    frame = requestAnimationFrame(activateVariantCycleOnShoulderButtonPresses);
  }

  requestGamepadAnimationFrame();
}

function attachKeyboardListeners(container, tool, { state, signal }) {
  const buttons = getVariantButtons(container);

  function onKeyDown(event) {
    const index = getButtonIndex(buttons, { state, tool });

    if (index === -1) {
      return;
    }

    switch (event.key) {
      case ".": {
        const nextButton = getNextButton(buttons, index);
        dispatchButtonClick(nextButton.button);
        break;
      }
      case ",": {
        const prevButton = getPreviousButton(buttons, index);
        dispatchButtonClick(prevButton.button);
        break;
      }
      default:
        return;
    }
  }

  window.addEventListener("keydown", onKeyDown, {
    once: true,
    signal,
  });
}

export function buildToolVariants(tool, { state, signal }) {
  const variantsContainer = getPanelToolVariants();

  const activatedVariant = state.get((prevState) =>
    prevState.activatedVariants.get(tool.id),
  );

  const customVariants = state.get(
    (prevState) => prevState.customVariants.get(tool.id) ?? new Set(),
  );

  const allVariants = [...tool.variants, ...customVariants];

  allVariants.forEach((variant) => {
    function onClick() {
      switch (tool.id) {
        case TOOLS.STAMP.id:
          {
            if (!variant.value) {
              customStampOnClick({ tool, variant, state });
            } else {
              defaultOnClick({ tool, variant, state });
            }
          }
          break;
        default:
          defaultOnClick({ tool, variant, state });
          break;
      }
    }

    const variantButton = new VariantButton({
      ...variant,
      onClick,
      signal,
    });

    variantsContainer.appendChild(variantButton);

    if (variant.id === activatedVariant.id) {
      updateActivatedButton(variantsContainer, variant.id.description);
    }
  });

  attachKeyboardListeners(variantsContainer, tool, { state, signal });

  attachGamepadListeners(variantsContainer, tool, { state });

  function dispose() {
    getVariantButtons(variantsContainer).forEach((variantButton) => {
      variantButton.remove();
    });

    variantsContainer.innerHTML = "";
  }

  signal.addEventListener("abort", dispose, { once: true });
}
