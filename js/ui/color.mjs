import { COLOR } from "../state/constants.mjs";
/**
 * Represents a button for selecting colors
 */
export class ColorButton extends HTMLElement {
  constructor({ onClick, color }) {
    super();

    this.color = color;
    this.#onClick = onClick;
    this.attachShadow({ mode: "open" });
  }

  color = "#000000";
  #onClick = () => {};

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        button {
          background-color: ${this.color};
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
        data-value="${this.color}"
        aria-label="${Object.entries(COLOR)
          .find(([_, value]) => value === this.color)?.[0]
          ?.toLocaleLowerCase()} color"
        aria-pressed="${this.isActive ? "true" : "false"}"
      >
      </button>
    `;

    this.#button.addEventListener("click", this.#handleClick);
    this.isActive = false;
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
}
