export const TOOLS = Object.freeze({
  PEN: {
    id: Symbol("pen"),
    iconUrl: "img/tools/pen.svg",
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
    variants: [],
  },
  CAM: {
    id: Symbol("cam"),
    iconUrl: "img/tools/cam.svg",
    actions: [
      {
        id: Symbol("cam-take-photo"),
        iconUrl: "img/tools/cam-take-photo.svg",
      },
      {
        id: Symbol("cam-cancel"),
        iconUrl: "img/tools/cam-cancel.svg",
      },
    ],
  },
  STAMP: {
    id: Symbol("stamp"),
    iconUrl: "img/tools/stamp.svg",
    variants: [
      {
        id: Symbol("stamp-girl"),
        iconUrl: "img/stamps/girl.svg",
        value: "girl.svg",
        size: { w: 100, h: 100 },
      },
      {
        id: Symbol("stamp-boy"),
        iconUrl: "img/stamps/boy.svg",
        value: "boy.svg",
        size: { w: 85, h: 85 },
      },
      {
        id: Symbol("stamp-baby"),
        iconUrl: "img/stamps/baby.svg",
        value: "baby.svg",
        size: { w: 100, h: 100 },
      },
      {
        id: Symbol("stamp-woman"),
        iconUrl: "img/stamps/woman.svg",
        value: "woman.svg",
        size: { w: 150, h: 150 },
      },
      {
        id: Symbol("stamp-man"),
        iconUrl: "img/stamps/man.svg",
        value: "man.svg",
        size: { w: 135, h: 135 },
      },
      {
        id: Symbol("stamp-star"),
        iconUrl: "img/stamps/star.svg",
        value: "star.svg",
      },
      {
        id: Symbol("stamp-house"),
        iconUrl: "img/stamps/house.svg",
        value: "house.svg",
        size: { w: 200, h: 200 },
      },
      {
        id: Symbol("stamp-tree"),
        iconUrl: "img/stamps/tree.svg",
        value: "tree.svg",
        size: { w: 200, h: 200 },
      },
      {
        id: Symbol("stamp-truck"),
        iconUrl: "img/stamps/truck.svg",
        value: "truck.svg",
        size: { w: 160, h: 160 },
      },
    ],
  },
});

export const TOOL_LIST = Object.freeze([
  TOOLS.PEN,
  TOOLS.FILL,
  TOOLS.STAMP,
  TOOLS.CAM,
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

export const DEFAULT_TOOL_VARIANTS = new Map([
  [TOOLS.PEN.id, TOOLS.PEN.variants[0]],
  [TOOLS.STAMP.id, TOOLS.STAMP.variants[0]],
]);

export const DEFAULT_CUSTOM_VARIANTS = new Map([
  [
    TOOLS.STAMP.id,
    new Set([
      {
        id: Symbol("stamp-custom-slot-1"),
        iconUrl: "img/stamps/slot.svg",
        value: null,
      },
      {
        id: Symbol("stamp-custom-slot-2"),
        iconUrl: "img/stamps/slot.svg",
        value: null,
      },
      {
        id: Symbol("stamp-custom-slot-3"),
        iconUrl: "img/stamps/slot.svg",
        value: null,
      },
      {
        id: Symbol("stamp-custom-slot-4"),
        iconUrl: "img/stamps/slot.svg",
        value: null,
      },
      {
        id: Symbol("stamp-custom-slot-5"),
        iconUrl: "img/stamps/slot.svg",
        value: null,
      },
    ]),
  ],
]);
