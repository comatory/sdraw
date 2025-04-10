import { loadIcon } from "./utils.mjs";
import { serializeSvg, deserializeSvgFromDataURI } from "../svg-utils.mjs";
import { isDataUri } from "../state/utils.mjs";

/**
 * This is a base UI button with square shape.
 */
export class UiButton extends HTMLElement {
  // Can be built also declaratively with HTML.
  constructor(options = {}) {
    const {
      isActive,
      id,
      ariaLabel,
      dataset,
      iconUrl,
      backgroundColor,
      onClick,
      signal,
    } = options;

    super();

    this.#isActive = isActive ?? false;
    this.#id = id;
    this.#onClick = onClick;
    this.#signal = signal;
    this.#ariaLabel = ariaLabel;
    this.#dataset = dataset;
    this.#iconUrl = iconUrl;
    this.#backgroundColor = backgroundColor;

    this.attachShadow({ mode: "open" });
  }

  #isActive = false;
  #id = "";
  #iconUrl = null;
  #ariaLabel = "";
  #dataset = {};
  #backgroundColor = "#000000";
  #onClick = () => {};
  #signal = null;

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
    this.iconUrl = this.#iconUrl || this.getAttribute("icon-url");
    this.isActive = false;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    switch (name) {
      case "icon-url":
        if (oldValue === newValue) {
          break;
        }
        this.iconUrl = newValue;
        break;
    }
  }

  click(e) {
    this.button.dispatchEvent(e);
  }

  addClickListener(listener) {
    this.button.addEventListener("click", listener, {
      signal: this.#signal,
    });
  }

  removeClickListener(listener) {
    this.button.removeEventListener("click", listener);
  }

  get button() {
    return this.shadowRoot.querySelector("button");
  }

  set isActive(value) {
    this.#isActive = value;
    this.button.setAttribute("aria-pressed", value ? "true" : "false");
  }

  get isActive() {
    return this.#isActive;
  }

  set iconUrl(value) {
    if (!value) {
      return;
    }

    const dataset = this.#dataset ?? this.dataset;

    if (isDataUri(value)) {
      this.button.innerHTML = serializeSvg(deserializeSvgFromDataURI(value));
    } else {
      loadIcon(value)
        .then((icon) => {
          this.button.innerHTML = icon;
        })
        .catch((error) => {
          console.error(error);
          this.button.innerText = UiButton.#getContentFallback(dataset);
        });
    }
  }

  static observedAttributes = ["icon-url"];

  static #createDataSetAttributesString(dataset) {
    return Object.entries(dataset ?? {})
      .map(([key, value]) => `data-${key}="${value}"`)
      .join(" ");
  }

  static #getContentFallback(dataset) {
    return dataset?.id?.description ?? "";
  }
}
