import { setTool, storeCustomVariant } from "../state/actions.mjs";
import { TOOLS } from "../state/state.mjs";
import { isDataUri } from "../state/utils.mjs";
import { getPanelToolVariants } from "../dom.mjs";
import {
  loadIcon,
  disposeCallback,
  ensureCallbacksRemoved,
  updateActivatedButton,
} from "./utils.mjs";
import { createSvgFromBlob, serializeSvg } from "./svg-utils.mjs";

function readUploadedSVG(event, fileInput) {
  const file = event.target.files[0];
  const failureEvent = new CustomEvent("stamp-custom-slot-failure");

  if (!file) {
    fileInput.dispatchEvent(failureEvent);
    throw new Error("No file selected!");
  }

  const fileReader = new FileReader();
  fileReader.addEventListener("load", (fileEvent) => {
    fileInput.dispatchEvent(
      new CustomEvent("stamp-custom-slot-success", {
        detail: {
          dataUri: fileEvent.srcElement.result,
          svgString: serializeSvg(
            createSvgFromBlob(fileEvent.srcElement.result)
          ),
        },
      })
    );
  });
  fileReader.addEventListener("error", () => {
    fileInput.dispatchEvent(failureEvent);
  });

  fileReader.readAsDataURL(file);
}

function createFileInputForUpload() {
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = "image/svg+xml";
  fileInput.style.display = "none";

  return fileInput;
}

function customStampOnClick({ tool, variant, state, button }) {
  const fileInput = createFileInputForUpload();

  function handleFileUpload(event) {
    readUploadedSVG(event, fileInput);
  }

  fileInput.addEventListener("stamp-custom-slot-success", async (event) => {
    fileInput.removeEventListener("change", handleFileUpload);
    fileInput.remove();

    const updatedVariant = {
      ...variant,
      value: event.detail.dataUri,
    };
    button.innerHTML = event.detail.svgString;
    storeCustomVariant(tool, updatedVariant, { state });
    setTool(tool, { state, variant: updatedVariant });
    updateActivatedButton(
      getPanelToolVariants(),
      updatedVariant.id.description
    );
  });
  fileInput.addEventListener("stamp-custom-slot-failure", () => {
    alert("Something went wrong with uploading the image!");
  });
  fileInput.addEventListener("change", handleFileUpload);

  fileInput.click();
}

function defaultOnClick({ tool, variant, state }) {
  setTool(tool, { state, variant });
  updateActivatedButton(getPanelToolVariants(), variant.id.description);
}

export function buildToolVariants(tool, state) {
  const variantsContainer = getPanelToolVariants();

  const listeners = {};

  const activatedVariant = state.get((prevState) =>
    prevState.activatedVariants.get(tool.id)
  );

  const customVariants = state.get(
    (prevState) => prevState.customVariants.get(tool.id) ?? new Set()
  );

  [...tool.variants, ...customVariants].forEach((variant) => {
    const button = document.createElement("button");

    function onClick() {
      switch (tool.id) {
        case TOOLS.STAMP.id:
          {
            if (!variant.value || isDataUri(variant.value)) {
              customStampOnClick({ tool, variant, state, button });
            } else {
              defaultOnClick({ tool, variant, state });
            }
          }
          break;
        default:
          defaultOnClick();
          break;
      }
    }

    button.addEventListener("click", onClick);

    button.dataset.value = variant.id.description;

    loadIcon(variant.iconUrl)
      .then((icon) => {
        button.innerHTML = icon;
      })
      .catch((error) => {
        console.error(error);
        button.innerText = variant.id.description;
      });

    variantsContainer.appendChild(button);

    if (variant.id === activatedVariant.id) {
      updateActivatedButton(variantsContainer, variant.id.description);
    }

    listeners[button.dataset.value] = onClick;
  });

  return function dispose() {
    Array.from(variantsContainer.querySelectorAll("button")).forEach(
      (button) => {
        disposeCallback(button, listeners);

        button.remove();
      }
    );

    ensureCallbacksRemoved(listeners);

    variantsContainer.innerHTML = "";
  };
}