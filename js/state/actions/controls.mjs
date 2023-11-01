export function setGamepadIndex(index, { state }) {
  state.set(() => ({
    gamepad: index,
  }));
}

export function blockGamepad({ state }) {
  state.set(() => ({
    gamepadBlocked: true,
  }));
}

export function unblockGamepad({ state }) {
  state.set(() => ({
    gamepadBlocked: false,
  }));
}
