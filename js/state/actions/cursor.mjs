import { drawCursor } from "../../canvas-utils.mjs";

const MAXIMUM_CURSOR_ACCERATION = 20;

export function setCursor(cursor, { state }) {
  state.set(() => ({
    cursor,
  }));
}

export function moveCursor({ acceleration, state, keysPressed }) {
  const length = Math.min(
    acceleration && acceleration.key === event.key
      ? acceleration.acceleration
      : 1,
    MAXIMUM_CURSOR_ACCERATION,
  );

  const cursor = state.get((prevState) => prevState.cursor);
  const nextCursor = {
    ...cursor,
    x:
      cursor.x +
      ((keysPressed.right ? 1 + length : 0) +
        (keysPressed.left ? -1 - length : 0)),
    y:
      cursor.y +
      ((keysPressed.down ? 1 + length : 0) +
        (keysPressed.up ? -1 - length : 0)),
  };

  setCursor(nextCursor, { state });
  drawCursor(nextCursor.x, nextCursor.y);
}
