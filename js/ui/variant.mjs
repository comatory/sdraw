import { UiButton } from "./button.mjs";

export class VariantButton extends HTMLElement {
  constructor({ id, onClick, iconUrl, signal, isActive }) {
    super();

    this.#isActive = isActive;
    this.id = id;
    this.#onClick = onClick;
    this.#iconUrl = iconUrl;
    this.#signal = signal;

    this.attachShadow({ mode: "open" });
  }

  #isActive = false;
  id = "";
  #onClick = () => {};
  #iconUrl = "";
  #signal = null;

  connectedCallback() {
    const button = new UiButton({
      ariaLabel: `${this.id.description.toLocaleLowerCase()} variant}`,
      dataset: {
        value: this.id.description,
      },
      iconUrl: this.#iconUrl,
      onClick: this.#onClick,
      signal: this.#signal,
    });

    this.shadowRoot.appendChild(button);
    this.isActive = this.#isActive;
  }

  click(e) {
    this.#button.click(e);
  }

  get #button() {
    return this.shadowRoot.querySelector("ui-button").button;
  }

  get button() {
    return this.#button;
  }

  set isActive(value) {
    this.shadowRoot.querySelector("ui-button").isActive = value;
  }

  get isActive() {
    return this.shadowRoot.querySelector("ui-button").isActive;
  }

  static compare(id, value) {
    return id.description === value;
  }
}
