import { takePhoto, removePhoto } from "../state/actions/cam.mjs";
import { getPanelToolActions } from "../dom.mjs";
import { disposeCallback, ensureCallbacksRemoved, loadIcon } from "./utils.mjs";

export function buildToolActions(tool, state) {
  const actionsContainer = getPanelToolActions();

  const listeners = {};

  tool.actions.forEach((action) => {
    const button = document.createElement("button");

    function onCamTakePhotoClick() {
      takePhoto({ state });
    }

    function onCamCancelClick() {
      removePhoto({ state });
    }

    switch (action.id.description) {
      case "cam-take-photo": {
        listeners[action.id.description] = onCamTakePhotoClick;
        button.addEventListener("click", onCamTakePhotoClick);
        break;
      }
      case "cam-cancel": {
        listeners[action.id.description] = onCamCancelClick;
        button.addEventListener("click", onCamCancelClick);
        break;
      }
    }

    button.dataset.value = action.id.description;
    button.innerText = action.id.description;

    loadIcon(action.iconUrl)
      .then((icon) => {
        button.innerHTML = icon;
      })
      .catch((error) => {
        console.error(error);
        button.innerText = action.id.description;
      });

    actionsContainer.appendChild(button);
  });

  return function dispose() {
    Array.from(actionsContainer.querySelectorAll("button")).forEach(
      (button) => {
        disposeCallback(button, listeners);

        button.remove();
      },
    );

    ensureCallbacksRemoved(listeners);

    actionsContainer.innerHTML = "";
  };
}
