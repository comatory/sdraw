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
