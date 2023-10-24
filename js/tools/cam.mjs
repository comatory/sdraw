import { getCam, getCanvas } from "../dom.mjs";

function getVideoStream() {
  return navigator.mediaDevices.getUserMedia({ video: true });
}

export async function activateCam() {
  const cam = getCam();
  cam.style.display = "block";

  function closeCam() {
    cam.style.display = "none";
    cam.pause();
    cam.currentTime = 0;
  }

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
    const canvas = getCanvas();
    const ctx = canvas.getContext("2d");
    ctx.drawImage(cam, 0, 0, canvas.width, canvas.height);
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
