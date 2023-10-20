import { drawCursor } from "../cursor.mjs";
import { activatePen } from "../tools/pen.mjs";
import { activateFill } from '../tools/fill.mjs';
import { TOOLS, COLOR_LIST } from "./state.mjs";
import { storeTool, storeColor } from "./storage.mjs";

let disposeCallback;
const MAXIMUM_CURSOR_ACCERATION = 20;

export function setTool(tool, { state }) {
  if (disposeCallback) {
    disposeCallback();
    disposeCallback = null;
  }

  state.set((state) => ({
    tool,
  }));

  storeTool(tool);

  switch (state.get((state) => state.tool)) {
    case TOOLS.PEN:
      disposeCallback = activatePen({ state });
      break;
    case TOOLS.FILL:
      disposeCallback = activateFill({ state });
      break;
    default:
      break;
  }
}

export function setColor(color, { state }) {
  state.set((state) => ({
    color,
  }));

  storeColor(color);
}

export function setNextColor({ state }) {
  const currentColor = state.get((state) => state.color);
  const nextColor = COLOR_LIST.at(
    (COLOR_LIST.indexOf(currentColor) + 1) % COLOR_LIST.length,
  );

  setColor(nextColor, { state });
}

export function setPreviousColor({ state }) {
  const currentColor = state.get((state) => state.color);
  const nextColor = COLOR_LIST.at(
    (COLOR_LIST.indexOf(currentColor) - 1) % COLOR_LIST.length,
  );

  setColor(nextColor, { state });
}

export function setCursor(cursor, { state }) {
  state.set((state) => ({
    cursor,
  }));
}

export function moveCursor({
  acceleration,
  state,
  keysPressed,
}) {
  const length = Math.min(
    acceleration && acceleration.key === event.key
      ? acceleration.acceleration
      : 1,
    MAXIMUM_CURSOR_ACCERATION
  );

  const cursor = state.get((state) => state.cursor);
  const nextCursor = {
    ...cursor,
    x: cursor.x + ((keysPressed.right ? 1 + length : 0) + (keysPressed.left ? -1 - length : 0)),
    y: cursor.y + ((keysPressed.down ? 1 + length : 0) + (keysPressed.up ? -1 - length : 0)),
  };

  setCursor(nextCursor, { state });
  drawCursor(nextCursor.x, nextCursor.y);
}

export function setGamepadIndex(index, { state }) {
  state.set((state) => ({
    gamepad: index,
  }));
}
