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
import { createSvgDataUri, serializeSvg, deserializeSvgFromDataURI, normalizeSvgSize } from "../svg-utils.mjs";

function readUploadedSVG(event, fileInput) {
  const file = event.target.files[0];
  const failureEvent = new CustomEvent("stamp-custom-slot-failure");

  if (!file) {
    fileInput.dispatchEvent(failureEvent);
    throw new Error("No file selected!");
  }

  const fileReader = new FileReader();
  fileReader.addEventListener("load", (fileEvent) => {
    const parsedSvgElement = deserializeSvgFromDataURI(fileEvent.srcElement.result);
    const svgElement = normalizeSvgSize(parsedSvgElement.documentElement);

    fileInput.dispatchEvent(
      new CustomEvent("stamp-custom-slot-success", {
        detail: {
          dataUri: createSvgDataUri(serializeSvg(svgElement)),
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

function customStampOnClick({ tool, variant, state }) {
  const fileInput = createFileInputForUpload();

  function handleFileUpload(event) {
    readUploadedSVG(event, fileInput);
  }

  fileInput.addEventListener("stamp-custom-slot-success", async (event) => {
    fileInput.removeEventListener("change", handleFileUpload);
    fileInput.remove();

    const updatedVariant = {
      ...variant,
      iconUrl: event.detail.dataUri,
      value: event.detail.dataUri,
    };
    updateActivatedButton(
      getPanelToolVariants(),
      updatedVariant.id.description
    );
    setTool(tool, { state, variant: updatedVariant });
    storeCustomVariant(tool, updatedVariant, { state });
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

function renderToolVariants(tool, state) {
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
            if (!variant.value) {
              customStampOnClick({ tool, variant, state });
            } else {
              defaultOnClick({ tool, variant, state });
            }
          }
          break;
        default:
          defaultOnClick({ tool, variant, state });
          break;
      }
    }

    button.addEventListener("click", onClick);

    button.dataset.value = variant.id.description;

    if (isDataUri(variant.iconUrl)) {
      button.innerHTML = serializeSvg(deserializeSvgFromDataURI(variant.iconUrl));
    } else {
      loadIcon(variant.iconUrl)
        .then((icon) => {
          button.innerHTML = icon;
        })
        .catch((error) => {
          console.error(error);
          button.innerText = variant.id.description;
        });
    }

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

export function buildToolVariants(tool, state) {
  let disposeVariantsCallback = null;

  function onToolChange(nextState, prevState) {
    if (nextState.customVariants === prevState.customVariants) {
      return;
    }

    if (disposeVariantsCallback) {
      disposeVariantsCallback();
      disposeVariantsCallback = null;
    }

    disposeVariantsCallback = renderToolVariants(tool, state);
  }

  disposeVariantsCallback = renderToolVariants(tool, state);

  state.addListener(onToolChange);

  return function dispose() {
    state.removeListener(onToolChange);

    if (disposeVariantsCallback) {
      disposeVariantsCallback();
      disposeVariantsCallback = null;
    }
  }
}
