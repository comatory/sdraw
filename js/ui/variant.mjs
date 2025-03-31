import { isDataUri } from "../state/utils.mjs";
import { loadIcon } from "./utils.mjs";
import { serializeSvg, deserializeSvgFromDataURI } from "../svg-utils.mjs";

export class VariantButton extends HTMLElement {
  constructor({ id, onClick, iconUrl }) {
    super();

    this.id = id;
    this.#onClick = onClick;
    this.#iconUrl = iconUrl;

    this.attachShadow({ mode: "open" });
  }

  id = "";
  #onClick = () => {};
  #iconUrl = "";

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        button {
          width: var(--button-size);
          height: var(--button-size);
          border: 2px solid black;
          border-radius: 6px;
        }

        button[aria-pressed="true"] {
          border: 2px solid white;
          box-shadow: 0px 0px 0px 4px orange;
        }
      </style>
      <button
        data-value="${this.id.description}"
        aria-label="${this.id.description.toLocaleLowerCase()} variant"
        aria-pressed="${this.isActive ? "true" : "false"}"
      >
      </button>
    `;

    this.#button.addEventListener("click", this.#handleClick, true);
    this.isActive = false;

    if (isDataUri(this.#iconUrl)) {
      this.#button.innerHTML = serializeSvg(
        deserializeSvgFromDataURI(this.#iconUrl),
      );
    } else {
      loadIcon(this.#iconUrl)
        .then((icon) => {
          this.#button.innerHTML = icon;
        })
        .catch((error) => {
          console.error(error);
          this.#button.innerText = this.id.description;
        });
    }
  }

  click(e) {
    this.#button.dispatchEvent(e);
  }

  get #button() {
    return this.shadowRoot.querySelector("button");
  }

  get button() {
    return this.#button;
  }

  set isActive(value) {
    this.#button.setAttribute("aria-pressed", value ? "true" : "false");
  }

  #handleClick = (event) => {
    this.#onClick(event);
  };

  static compare(id, value) {
    return id.description === value;
  }
}
