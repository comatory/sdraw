import { loadIcon } from "./utils.mjs";
/**
 * Represents tool/action button.
 */
export class ToolButton extends HTMLElement {
  constructor({ id, iconUrl, onClick }) {
    super();

    this.#description = id.description;
    this.#iconUrl = iconUrl;
    this.id = id;
    this.#onClick = onClick;
    this.attachShadow({ mode: "open" });
  }

  id = "";
  #iconUrl = "";
  #description = "";
  #onClick = () => {};

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
        data-id="${this.id.description}"
        data-value="${this.#description}"
        aria-label="${this.#description.toLocaleLowerCase()} tool"
        aria-pressed="${this.isActive ? "true" : "false"}"
      >
      </button>
    `;

    this.#button.addEventListener("click", this.#handleClick, true);
    this.isActive = false;

    loadIcon(this.#iconUrl)
      .then((icon) => {
        this.#button.innerHTML = icon;
      })
      .catch((error) => {
        console.error(error);
        this.#button.innerText = this.#description;
      });
  }

  click(e) {
    this.#button.dispatchEvent(e);
  }

  set isActive(value) {
    if (value) {
      this.#button.setAttribute("aria-pressed", "true");
    } else {
      this.#button.removeAttribute("aria-pressed", "false");
    }
  }

  get #button() {
    return this.shadowRoot.querySelector("button");
  }

  #handleClick = (e) => {
    this.#onClick(e);
  };

  static compare(id, description) {
    return id.description === description;
  }
}
