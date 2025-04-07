import { UiButton } from "./button.mjs";

/**
 * Represents tool/action button.
 */
export class ToolButton extends HTMLElement {
  constructor({ id, iconUrl, onClick, signal, isActive }) {
    super();

    this.#isActive = isActive;
    this.#description = id.description;
    this.#iconUrl = iconUrl;
    this.id = id;
    this.#onClick = onClick;
    this.#signal = signal;
    this.attachShadow({ mode: "open" });
  }

  #isActive = false;
  id = "";
  #iconUrl = "";
  #description = "";
  #onClick = () => {};
  #signal = null;

  connectedCallback() {
    const button = new UiButton({
      ariaLabel: this.#description,
      dataset: {
        id: this.id.description,
        value: this.#description,
      },
      iconUrl: this.#iconUrl,
      onClick: this.#onClick,
      signal: this.#signal,
    });

    this.shadowRoot.appendChild(button);
    button.isActive = this.#isActive;
  }

  click(e) {
    this.#button.click(e);
  }

  set isActive(value) {
    this.shadowRoot.querySelector("ui-button").isActive = value;
  }

  get isActive() {
    return this.shadowRoot.querySelector("ui-button").isActive;
  }

  get #button() {
    return this.shadowRoot.querySelector("ui-button").button;
  }

  static compare(id, description) {
    return id.description === description;
  }
}
