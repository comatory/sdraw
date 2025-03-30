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

