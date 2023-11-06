import { blockGamepad, unblockGamepad } from "../state/actions/controls.mjs";
import { getGamepad, isGamepadDirectionPressed } from "./gamepad.mjs";

const GAMEPAD_INTERACTION_POLLING_INTERVAL_IN_MS = 100;

export function attachGamepadBlockListeners(state) {
  function handleKeyDown() {
    blockGamepad({ state });
  }

  function handleMouseMove() {
    blockGamepad({ state });
  }

  function handleMouseDown() {
    blockGamepad({ state });
  }

  function checkGamepadInteraction() {
    const gamepad = getGamepad(state);

    if (!gamepad) {
      return;
    }

    if (isGamepadDirectionPressed(gamepad)) {
      unblockGamepad({ state });
    }
  }

  window.setInterval(
    checkGamepadInteraction,
    GAMEPAD_INTERACTION_POLLING_INTERVAL_IN_MS,
  );

  window.addEventListener("keydown", handleKeyDown);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mousedown", handleMouseDown);
}
