import { COLOR } from "../state/constants.mjs";
import { UiButton } from "./button.mjs";

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
    const button = new UiButton({
      ariaLabel: `${Object.entries(COLOR)
        .find(([_, value]) => value === this.color)?.[0]
        ?.toLocaleLowerCase()} color`,
      dataset: {
        value: this.color,
      },
      backgroundColor: this.color,
      onClick: this.#onClick,
    });

    this.shadowRoot.appendChild(button);
  }

  click(e) {
    this.#button.click(e);
  }

  set isActive(value) {
    this.shadowRoot.querySelector("ui-button").isActive = value;
  }

  get #button() {
    return this.shadowRoot.querySelector("ui-button").button;
  }

  isColorEqual(color) {
    return this.color === color;
  }
}
