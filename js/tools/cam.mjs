import { getCam } from "../dom.mjs";

function getVideoStream() {
  return navigator.mediaDevices.getUserMedia({ video: true });
}

export async function activateCam({ state }) {
  const cam = getCam();

  function hideCam() {
    cam.style.display = "none";
  }

  function showCam() {
    cam.style.display = "block";
  }

  showCam();

  function closeCam() {
    hideCam();
    cam.pause();
    cam.currentTime = 0;
  }

  function onPhotoMemorizedChange(nextState, prevState) {
    if (nextState.photoMemorized === prevState.photoMemorized) {
      return;
    }

    if (nextState.photoMemorized) {
      hideCam();
    } else {
      showCam();
    }
  }

  state.addListener(onPhotoMemorizedChange);

  let stream = null;

  try {
    stream = await getVideoStream();
    cam.srcObject = stream;
    cam.play();
  } catch (err) {
    alert("Could not activate camera");
    return closeCam();
  }

  return function dispose() {
    state.removeListener(onPhotoMemorizedChange);

    if (!stream) {
      return;
    }

    stream.getTracks().forEach((track) => {
      track.stop();
    });

    stream = null;

    closeCam();
  };
}
