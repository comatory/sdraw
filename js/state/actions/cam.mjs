import {
  getCam,
  getCanvas,
  insertCountdown,
  removeCountdown,
  getCountdownAnimationLengthInSeconds,
  getFlashAnimationLengthInSeconds,
} from "../../dom.mjs";

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

  const videoSettings = cam.srcObject.getVideoTracks()[0]?.getSettings();
  const height = canvas.height;
  const width = (height / videoSettings?.height) * videoSettings?.width;

  setTimeout(() => {
    ctx.drawImage(cam, canvas.width / 2 - width / 2, 0, width, height);
    memorizePhoto({ state });
    removeCountdown();
  }, countdownAnimationLength + flashAnimationLength);
}

export function removePhoto({ state }) {
  const canvas = getCanvas();
  const ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  unsetPhoto({ state });
}
