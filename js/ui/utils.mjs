import { ColorButton } from "./color.mjs";

export async function loadIcon(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load icon: ${response.status}`);
  }

  return response.text();
}

export function disposeCallback(button, listeners) {
  const callback = listeners[button.dataset.value];

  if (!callback) {
    throw new Error("No callback registered!");
  }

  button.removeEventListener("click", callback);

  delete listeners[button.dataset.value];
}

export function ensureCallbacksRemoved(listeners) {
  if (Object.keys(listeners).length === 0) {
    return;
  }
  throw new Error("Not all listeners were removed!");
}

export function updateActivatedButton(buttonContainer, value) {
  const buttons = buttonContainer.querySelectorAll("button,color-button");

  Array.from(buttons).forEach((button) => {
    const isColorButton = button instanceof ColorButton;
    const buttonColor = isColorButton ? button.color : button.dataset.value;
    const isActive = buttonColor === value;

    if (isColorButton) {
      button.isActive = isActive;

      return;
    } else {
      if (button.dataset.value === value) {
        button.classList.add("active");
      } else {
        button.classList.remove("active");
      }
    }
  });
}

/**
 * Is cursor located on UI panel?
 *
 * @param {number} x - Cursor x coordinate.
 * @param {number} y - Cursor y coordinate.
 * @param {DOMRect} rect - Panel bounds.
 *
 * @returns {boolean} - Is cursor located on UI panel?
 */
export function isCursorWithinPanelBounds(x, y, rect) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}
