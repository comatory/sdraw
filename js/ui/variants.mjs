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
import { VariantButton } from "./variant.mjs";
import { VariantStampButton } from "./variant-stamp.mjs";

const GAMEPAD_BUTTON_ACTIVATION_DELAY_IN_MS = 300;

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

  for (const variant of allVariants) {
    const activatedVariant = state.get((prevState) =>
      prevState.activatedVariants.get(tool.id),
    );

    const options = {
      ...variant,
      isActive: activatedVariant?.id.description === variant.id.description,
      signal,
      tool,
      state,
      variant,
    };

    switch (tool.id) {
      case TOOLS.STAMP.id:
        variantsContainer.appendChild(new VariantStampButton(options));
        break;
      default:
        variantsContainer.appendChild(new VariantButton(options));
        break;
    }
  }

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
