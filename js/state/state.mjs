export const TOOLS = {
  PEN: Symbol('pen'),
  FILL: Symbol('fill'),
}

const DEFAULT_TOOL = TOOLS.PEN;

function loadTool() {
  return window.sessionStorage.getItem('tool') || DEFAULT_TOOL;
}

function createState() {
  const callbacks = [];

  let state = {
    tool: loadTool(),
  }

  function addListener(callback) {
    callbacks.push(callback);
  }

  function removeListener(callback) {
    const index = callbacks.indexOf(callback);

    if (index === -1) {
      throw new Error('Callback not found')
    }

    callbacks.splice(index, 1);
  }

  function emit() {
    for (const callback in callbacks) {
      callback(state);
    }
  }

  function get(fn) {
    return fn(state);
  }

  function set(fn) {
    const nextState = fn(state);

    state = {
      ...state,
      ...nextState,
    }

    emit();
  }

  return {
    addListener,
    removeListener,
    emit,
    get,
    set,
  }
}

export const state = createState();
