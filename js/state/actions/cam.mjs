import {
  getCam,
  getCanvas,
  insertCountdown,
  removeCountdown,
  getCountdownAnimationLengthInSeconds,
  getFlashAnimationLengthInSeconds,
} from "../../dom.mjs";
import { blockInteractions, unblockInteractions } from "../actions/ui.mjs";

function memorizePhoto({ state }) {
  state.set(() => ({
    photoMemorized: true,
  }));
}

function unsetPhoto({ state }) {
  state.set(() => ({
    photoMemorized: false,
  }));
}

export function takePhoto({ state }) {
  const cam = getCam();
  const canvas = getCanvas();
  const ctx = canvas.getContext("2d");
  const countdownAnimationLength =
    getCountdownAnimationLengthInSeconds() * 1000;
  const flashAnimationLength = getFlashAnimationLengthInSeconds() * 1000;

  insertCountdown();
  blockInteractions({ state });

  const videoSettings = cam.srcObject.getVideoTracks()[0]?.getSettings();

  setTimeout(() => {
    ctx.drawImage(
      cam,
      canvas.width / 2 - (videoSettings?.width ? videoSettings.width / 2 : 0),
      0,
      videoSettings?.width,
      videoSettings?.height
    );
    memorizePhoto({ state });
    removeCountdown();
    unblockInteractions({ state });
  }, countdownAnimationLength + flashAnimationLength);
}

export function removePhoto({ state }) {
  const canvas = getCanvas();
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  unsetPhoto({ state });
}
