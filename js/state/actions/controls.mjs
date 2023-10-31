export function setGamepadIndex(index, { state }) {
  state.set(() => ({
    gamepad: index,
  }));
}
