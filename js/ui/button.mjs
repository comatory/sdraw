import { loadIcon } from "./utils.mjs";
import { serializeSvg, deserializeSvgFromDataURI } from "../svg-utils.mjs";
import { isDataUri } from "../state/utils.mjs";

/**
 * This is a base UI button with square shape.
 */
export class UiButton extends HTMLElement {
  constructor({ ariaLabel, dataset, iconUrl, backgroundColor, onClick }) {
    super();

    this.#onClick = onClick;
    this.#ariaLabel = ariaLabel;
    this.#dataset = dataset;
    this.#iconUrl = iconUrl;
    this.#backgroundColor = backgroundColor;

    this.attachShadow({ mode: "open" });
  }

  #ariaLabel = "";
  #dataset = {};
  #iconUrl = "";
  #backgroundColor = "#000000";
  #onClick = () => {};

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        button {
          width: var(--button-size);
          height: var(--button-size);
          ${
            this.#backgroundColor
              ? `background-color: ${this.#backgroundColor};`
              : ""
          }
          border: 2px solid black;
          border-radius: 6px;
        }

        button[aria-pressed="true"] {
          border: 2px solid white;
          box-shadow: 0px 0px 0px 4px orange;
        }
      </style>
      <button
        aria-pressed="${this.isActive ? "true" : "false"}"
        aria-label="${this.#ariaLabel}"
        ${UiButton.#createDataSetAttributesString(this.#dataset)}
      >
      </button>
    `;

    this.button.addEventListener("click", this.#onClick);
    this.isActive = false;
    this.#setContents();
  }

  #setContents() {
    if (!this.#iconUrl) {
      return;
    }

    if (isDataUri(this.#iconUrl)) {
      this.button.innerHTML = serializeSvg(
        deserializeSvgFromDataURI(this.#iconUrl),
      );
    } else {
      loadIcon(this.#iconUrl)
        .then((icon) => {
          this.button.innerHTML = icon;
        })
        .catch((error) => {
          console.error(error);
          this.button.innerText = UiButton.#getContentFallback(this.#dataset);
        });
    }
  }

  get button() {
    return this.shadowRoot.querySelector("button");
  }

  set isActive(value) {
    this.button.setAttribute("aria-pressed", value ? "true" : "false");
  }

  static #createDataSetAttributesString(dataset) {
    return Object.entries(dataset)
      .map(([key, value]) => `data-${key}="${value}"`)
      .join(" ");
  }

  static #getContentFallback(dataset) {
    return dataset?.id?.description ?? "";
  }
}
