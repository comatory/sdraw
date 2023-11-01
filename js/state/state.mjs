import {
  loadToolWithVariants,
  loadColor,
  loadCustomVariants,
} from "./storage.mjs";

export function createState() {
  const callbacks = [];

  const customVariants = loadCustomVariants();
  const { tool, activatedVariants } = loadToolWithVariants(customVariants);

  let state = {
    tool,
    activatedVariants,
    customVariants,
    color: loadColor(),
    gamepad: null,
    photoMemorized: false,
    blockedInteractions: false,
    gamepadBlocked: false,
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

    const prevState = { ...state };
    const nextState = {
      ...prevState,
      ...nextPartialState,
    };

    state = nextState;

    emit(nextState, prevState);
  }

  return {
    addListener,
    removeListener,
    emit,
    get,
    set,
  };
}
