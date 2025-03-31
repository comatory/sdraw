import { loadIcon } from "./utils.mjs";
import { serializeSvg, deserializeSvgFromDataURI } from "../svg-utils.mjs";
import { isDataUri } from "../state/utils.mjs";

/**
 * This is a base UI button with square shape.
 */
export class UiButton extends HTMLElement {
  // Can be built also declaratively with HTML.
  constructor(options = {}) {
    const { id, ariaLabel, dataset, iconUrl, backgroundColor, onClick } =
      options;

    super();

    this.#id = id;
    this.#onClick = onClick;
    this.#ariaLabel = ariaLabel;
    this.#dataset = dataset;
    this.#iconUrl = iconUrl;
    this.#backgroundColor = backgroundColor;

    this.attachShadow({ mode: "open" });
  }

  #id = "";
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
        id="${this.#id ?? this.getAttribute("id")}"
        aria-pressed="${this.isActive ? "true" : "false"}"
        aria-label="${this.#ariaLabel}"
        ${UiButton.#createDataSetAttributesString(this.#dataset)}
      >
      </button>
    `;

    if (this.#onClick) {
      this.addClickListener(this.#onClick);
    }
    this.isActive = false;
    this.#setContents();
  }

  click(e) {
    this.button.dispatchEvent(e);
  }

  addClickListener(listener) {
    this.button.addEventListener("click", listener);
  }

  removeClickListener(listener) {
    this.button.removeEventListener("click", listener);
  }

  get button() {
    return this.shadowRoot.querySelector("button");
  }

  set isActive(value) {
    this.button.setAttribute("aria-pressed", value ? "true" : "false");
  }

  #setContents() {
    const iconUrl = this.#iconUrl ?? this.getAttribute("icon-url");
    const dataset = this.#dataset ?? this.dataset;

    if (!iconUrl) {
      return;
    }

    if (isDataUri(iconUrl)) {
      this.button.innerHTML = serializeSvg(deserializeSvgFromDataURI(iconUrl));
    } else {
      loadIcon(iconUrl)
        .then((icon) => {
          this.button.innerHTML = icon;
        })
        .catch((error) => {
          console.error(error);
          this.button.innerText = UiButton.#getContentFallback(dataset);
        });
    }
  }

  static #createDataSetAttributesString(dataset) {
    return Object.entries(dataset ?? {})
      .map(([key, value]) => `data-${key}="${value}"`)
      .join(" ");
  }

  static #getContentFallback(dataset) {
    return dataset?.id?.description ?? "";
  }
}
