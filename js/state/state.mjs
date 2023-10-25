import { loadTool, loadColor } from "./storage.mjs";

export const TOOLS = Object.freeze({
  PEN: {
    id: Symbol("pen"),
    iconUrl: "img/tools/pen.svg",
    activeVariant: null,
    variants: [
      {
        id: Symbol("pen-stroke-width-1"),
        iconUrl: "img/tools/pen-stroke-width-1.svg",
        value: 1,
      },
      {
        id: Symbol("pen-stroke-width-2"),
        iconUrl: "img/tools/pen-stroke-width-2.svg",
        value: 5,
      },
      {
        id: Symbol("pen-stroke-width-3"),
        iconUrl: "img/tools/pen-stroke-width-3.svg",
        value: 9,
      },
    ],
  },
  FILL: {
    id: Symbol("fill"),
    iconUrl: "img/tools/fill.svg",
    activeVariant: null,
    variants: [],
  },
  CAM: {
    id: Symbol("cam"),
    iconUrl: "img/tools/cam.svg",
    activeVariant: null,
    variants: [
      {
        id: Symbol("cam-take-photo"),
      },
      {
        id: Symbol("cam-cancel"),
      },
    ],
  },
  STAMP: {
    id: Symbol("stamp"),
    iconUrl: "img/tools/stamp.svg",
    activeVariant: null,
    variants: [
      {
        id: Symbol("stamp-star"),
        iconUrl: "img/stamps/star.svg",
        value: "star.svg",
      },
    ],
  },
});

export const TOOL_LIST = Object.freeze([
  TOOLS.PEN,
  TOOLS.FILL,
  TOOLS.CAM,
  TOOLS.STAMP,
]);

export const COLOR = Object.freeze({
  RED: "#ff0000",
  ORANGE: "#ff8200",
  YELLOW: "#fffb00",
  LIME: "#00fb00",
  GREEN: "#008242",
  AZURE: "#00fbff",
  BLUE: "#0000ff",
  BURGUNDY: "#c64121",
  BROWN: "#846100",
  PEACH: "#ffc384",
  PINK: "#c600c6",
  BLACK: "#000000",
  GRAY: "#848284",
  SILVER: "#c6c3c6",
  WHITE: "#fffbff",
});

export const COLOR_LIST = Object.freeze([
  COLOR.BLACK,
  COLOR.RED,
  COLOR.ORANGE,
  COLOR.YELLOW,
  COLOR.LIME,
  COLOR.GREEN,
  COLOR.AZURE,
  COLOR.BLUE,
  COLOR.BURGUNDY,
  COLOR.BROWN,
  COLOR.PEACH,
  COLOR.PINK,
  COLOR.GRAY,
  COLOR.SILVER,
  COLOR.WHITE,
]);

export const DEFAULT_TOOL = TOOLS.PEN;
export const DEFAULT_COLOR = COLOR.BLACK;

export function createState() {
  const callbacks = [];

  let state = {
    tool: loadTool(),
    color: loadColor(),
    gamepad: null,
  };

  function addListener(callback) {
    callbacks.push(callback);
  }

  function removeListener(callback) {
    const index = callbacks.indexOf(callback);

    if (index === -1) {
      throw new Error("Callback not found");
    }

    callbacks.splice(index, 1);
  }

  function emit(nextState, prevState) {
    for (const callback of callbacks) {
      callback(nextState, prevState);
    }
  }

  function get(fn) {
    return fn(state);
  }

  function set(fn) {
    const nextPartialState = fn(state);

    const nextState = {
      ...state,
      ...nextPartialState,
    };

    emit(nextState, state);

    state = nextState;
  }

  return {
    addListener,
    removeListener,
    emit,
    get,
    set,
    _callbacks: callbacks,
  };
}
