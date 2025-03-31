import { UiButton } from "./button.mjs";

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
    const button = new UiButton({
      ariaLabel: `${this.id.description.toLocaleLowerCase()} variant}`,
      dataset: {
        value: this.id.description,
      },
      iconUrl: this.#iconUrl,
      onClick: this.#onClick,
    });

    this.shadowRoot.appendChild(button);
  }

  click(e) {
    this.#button.dispatchEvent(e);
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

  static compare(id, value) {
    return id.description === value;
  }
}
