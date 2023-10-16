import { drawCursor } from "../cursor.mjs";
import { activatePen } from "../tools/pen.mjs";
import { TOOLS, COLOR_LIST } from "./state.mjs";
import { storeTool, storeColor } from "./storage.mjs";

let disposeCallback;

export function setTool(tool, { state }) {
  if (disposeCallback) {
    disposeCallback();
    disposeCallback = null;
  }

  state.set(state => ({
    tool,
  }));

  storeTool(tool);

  switch (state.get(state => state.tool)) {
    case TOOLS.PEN:
      disposeCallback = activatePen({ state });
      break;
    default:
      break;
  }
}

export function setColor(color, { state }) {
  state.set(state => ({
    color,
  }));

  storeColor(color);
}

export function setNextColor({ state }) {
  const currentColor = state.get(state => state.color);
  const nextColor = COLOR_LIST.at((COLOR_LIST.indexOf(currentColor) + 1) % COLOR_LIST.length);

  setColor(nextColor, { state });
}

export function setPreviousColor({ state }) {
  const currentColor = state.get(state => state.color);
  const nextColor = COLOR_LIST.at((COLOR_LIST.indexOf(currentColor) - 1) % COLOR_LIST.length);

  setColor(nextColor, { state });
}

export function setCursor(cursor, { state }) {
  state.set(state => ({
    cursor,
  }));
}

export function moveCursorUp(length, { state }) {
  const cursor = state.get(state => state.cursor);
  const nextCursor = {
    ...cursor,
    y: cursor.y - length,
  }
  setCursor(nextCursor, { state });
  drawCursor(nextCursor.x, nextCursor.y);
}

export function moveCursorDown(length, { state }) {
  const cursor = state.get(state => state.cursor);
  const nextCursor = {
    ...cursor,
    y: cursor.y + length,
  }
  setCursor(nextCursor, { state });
  drawCursor(nextCursor.x, nextCursor.y);
}

export function moveCursorLeft(length, { state }) {
  const cursor = state.get(state => state.cursor);
  const nextCursor = {
    ...cursor,
    x: cursor.x - length,
  }
  setCursor(nextCursor, { state });
  drawCursor(nextCursor.x, nextCursor.y);
}

export function moveCursorRight(length, { state }) {
  const cursor = state.get(state => state.cursor);
  const nextCursor = {
    ...cursor,
    x: cursor.x + length,
  }
  setCursor(nextCursor, { state });
  drawCursor(nextCursor.x, nextCursor.y);
}
