import { setTool, setCustomVariant } from "../state/actions/tool.mjs";
import { TOOLS } from "../state/constants.mjs";
import {
  getPanelToolVariants,
  getVariantButtons,
  getVariantButtonById,
} from "../dom.mjs";
import {
  isLeftTriggerGamepadButtonPressed,
  isRightTriggerGamepadButtonPressed,
  getGamepad,
} from "../controls/gamepad.mjs";
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
  const variantButtons = Array.from(buttons);
  return index + 1 < buttons.length
    ? variantButtons[index + 1]
    : variantButtons[0];
}

function getPreviousButton(buttons, index) {
  const variantButtons = Array.from(buttons);
  return index - 1 >= 0
    ? variantButtons[index - 1]
    : variantButtons[buttons.length - 1];
}

function getButtonIndex(variantButtons, { state, tool }) {
  const activatedVariant = state.get((prevState) =>
    prevState.activatedVariants.get(tool.id),
  );

  const index = Array.from(variantButtons).findIndex(
    (variantButton) =>
      variantButton.button.dataset.value === activatedVariant.id.description,
  );

  return index;
}

function attachGamepadListeners(tool, { state }) {
  let frame = null;
  let buttonPressedTimestamp = null;

  function activateVariantCycleOnShoulderButtonPresses(timestamp) {
    const gamepad = getGamepad(state);

    if (!gamepad) {
      requestGamepadAnimationFrame();
      return;
    }

    const buttonPressedDelta = timestamp - buttonPressedTimestamp;

    const index = getButtonIndex(getVariantButtons(), {
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
      const prevButton = getPreviousButton(getVariantButtons(), index);
      dispatchButtonClick(prevButton);
      buttonPressedTimestamp = timestamp;
    } else if (
      isRightTriggerGamepadButtonPressed(gamepad) &&
      buttonPressedDelta > GAMEPAD_BUTTON_ACTIVATION_DELAY_IN_MS
    ) {
      const nextButton = getNextButton(getVariantButtons(), index);
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

function attachKeyboardListeners(tool, { state, signal }) {
  const buttons = getVariantButtons();

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
    signal,
  });
}

export function buildToolVariants(tool, { state, signal }) {
  const variantsContainer = getPanelToolVariants();

  state.addListener((updatedState, prevState) => {
    if (
      prevState.activatedVariants.get(tool.id) ===
      updatedState.activatedVariants.get(tool.id)
    ) {
      return;
    }

    const variantButtons = Array.from(getVariantButtons());
    const prevActiveVariantButton = variantButtons.find((b) => b.isActive);

    if (prevActiveVariantButton) {
      prevActiveVariantButton.isActive = false;
    }

    const nextActiveVariantButton =
      getVariantButtonById(updatedState.activatedVariants.get(tool.id)?.id) ||
      variantButtons?.[0];

    if (!nextActiveVariantButton) {
      throw new Error(
        `Variant button not found for variant: ${updatedState.tool.activatedVariant.id}`,
      );
    }

    nextActiveVariantButton.isActive = true;
  });

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

    const activatedVariant = state.get((prevState) =>
      prevState.activatedVariants.get(tool.id),
    );
    const variantButton = new VariantButton({
      ...variant,
      isActive: activatedVariant?.id.description === variant.id.description,
      onClick,
      signal,
    });

    variantsContainer.appendChild(variantButton);
  });

  attachKeyboardListeners(tool, { state, signal });

  attachGamepadListeners(tool, { state });

  function dispose() {
    Array.from(getVariantButtons()).forEach((variantButton) => {
      variantButton.remove();
    });

    variantsContainer.innerHTML = "";
  }

  signal.addEventListener("abort", dispose, { once: true });
}
