import { takePhoto, removePhoto } from "../state/actions/cam.mjs";
import { getPanelToolActions } from "../dom.mjs";
import { UiButton } from "./button.mjs";

export function buildToolActions(tool, { state, signal }) {
  const actionsContainer = getPanelToolActions();

  tool.actions.forEach((action) => {
    function onCamTakePhotoClick() {
      takePhoto({ state });
    }

    function onCamCancelClick() {
      removePhoto({ state });
    }

    let button = null;

    switch (action.id.description) {
      case "cam-take-photo": {
        button = new UiButton({
          ariaLabel: action.id.description,
          dataset: {
            value: action.id.description,
          },
          iconUrl: action.iconUrl,
          onClick: onCamTakePhotoClick,
          signal,
        });

        break;
      }
      case "cam-cancel": {
        button = new UiButton({
          ariaLabel: action.id.description,
          dataset: {
            value: action.id.description,
          },
          iconUrl: action.iconUrl,
          onClick: onCamCancelClick,
          signal,
        });
        break;
      }
    }

    actionsContainer.appendChild(button);
  });

  function dispose() {
    Array.from(actionsContainer.querySelectorAll("button")).forEach(
      (button) => {
        button.remove();
      },
    );

    actionsContainer.innerHTML = "";
  }

  signal.addEventListener("abort", dispose, { once: true });
}
