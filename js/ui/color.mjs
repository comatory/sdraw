import { COLOR } from "../state/constants.mjs";
import { UiButton } from "./button.mjs";

/**
 * Represents a button for selecting colors
 */
export class ColorButton extends HTMLElement {
  constructor({ onClick, color, signal, isActive }) {
    super();

    this.color = color;
    this.#isActive = isActive;
    this.#onClick = onClick;
    this.#signal = signal;
    this.attachShadow({ mode: "open" });
  }

  color = "#000000";
  #onClick = () => {};
  #signal = null;
  #isActive = false;

  connectedCallback() {
    const button = new UiButton({
      ariaLabel: `${Object.entries(COLOR)
        .find(([_, value]) => value === this.color)?.[0]
        ?.toLocaleLowerCase()} color`,
      dataset: {
        value: this.color,
      },
      backgroundColor: this.color,
      onClick: this.#onClick,
      signal: this.#signal,
    });

    this.shadowRoot.appendChild(button);
    this.isActive = this.#isActive;
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
}
