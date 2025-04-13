import { setCustomVariant, setTool } from "../state/actions/tool.mjs";
import { VariantButton } from "./variant.mjs";

import {
  createSvgDataUri,
  serializeSvg,
  deserializeSvgFromDataURI,
  normalizeSvgSize,
} from "../svg-utils.mjs";

export class VariantStampButton extends VariantButton {
  constructor(options) {
    super(options);

    const { variant, tool, state } = options;
    this.#variant = variant;
    this.#tool = tool;
    this.#state = state;
  }

  #variant = null;
  #tool = null;
  #state = null;

  connectedCallback() {
    super.connectedCallback();
  }

  click = () => {
    if (this.#variant.value) {
      setTool(this.#tool, { state: this.#state, variant: this.#variant });
      return;
    }

    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/svg+xml";
    fileInput.style.display = "none";

    const handleFileUpload = (event) => {
      this.#readUploadedSVG(event, fileInput);
    };

    fileInput.addEventListener("stamp-custom-slot-success", (event) => {
      fileInput.removeEventListener("change", handleFileUpload);
      fileInput.remove();

      const updatedVariant = {
        ...this.#variant,
        iconUrl: event.detail.iconDataUri,
        value: event.detail.dataUri,
      };
      setTool(this.#tool, { state: this.#state, variant: updatedVariant });
      setCustomVariant(this.#tool, updatedVariant, { state: this.#state });
      this.#variant = updatedVariant;
      super.uiButton.setAttribute("icon-url", event.detail.iconDataUri);
    });
    fileInput.addEventListener("stamp-custom-slot-failure", () => {
      alert("Something went wrong with uploading the image!");
    });
    fileInput.addEventListener("change", handleFileUpload);

    fileInput.click();
  };

  #readUploadedSVG = (event, fileInput) => {
    const file = event.target.files[0];
    const failureEvent = new CustomEvent("stamp-custom-slot-failure");

    if (!file) {
      fileInput.dispatchEvent(failureEvent);
      throw new Error("No file selected!");
    }

    const fileReader = new FileReader();
    fileReader.addEventListener("load", (fileEvent) => {
      const parsedSvgElement = deserializeSvgFromDataURI(
        fileEvent.srcElement.result,
      );
      const iconSvgDocument = parsedSvgElement.documentElement.cloneNode(true);
      const stampSvgDocument = parsedSvgElement.documentElement.cloneNode(true);
      const iconSvgElement = normalizeSvgSize(iconSvgDocument);
      const stampSvgElement = normalizeSvgSize(stampSvgDocument, 50);

      fileInput.dispatchEvent(
        new CustomEvent("stamp-custom-slot-success", {
          detail: {
            iconDataUri: createSvgDataUri(serializeSvg(iconSvgElement)),
            dataUri: createSvgDataUri(serializeSvg(stampSvgElement)),
          },
        }),
      );
    });
    fileReader.addEventListener("error", () => {
      fileInput.dispatchEvent(failureEvent);
    });

    fileReader.readAsDataURL(file);
  };
}
