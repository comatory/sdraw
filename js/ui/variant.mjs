import { UiButton } from "./button.mjs";
import { setTool } from "../state/actions/tool.mjs";

export class VariantButton extends HTMLElement {
  constructor({ id, iconUrl, signal, isActive, tool, state, variant }) {
    super();

    this.#isActive = isActive;
    this.id = id;
    this.#tool = tool;
    this.#state = state;
    this.#variant = variant;
    this.#iconUrl = iconUrl;
    this.#signal = signal;

    this.attachShadow({ mode: "open" });
  }

  #isActive = false;
  id = "";
  #iconUrl = "";
  #signal = null;
  #tool = null;
  #state = null;
  #variant = null;

  connectedCallback() {
    const button = new UiButton({
      ariaLabel: `${this.id.description.toLocaleLowerCase()} variant}`,
      dataset: {
        value: this.id.description,
      },
      iconUrl: this.#iconUrl,
      onClick: this.click,
      signal: this.#signal,
    });

    this.shadowRoot.appendChild(button);
    this.isActive = this.#isActive;
  }

  click = () => {
    setTool(this.#tool, { state: this.#state, variant: this.#variant });
  };

  get button() {
    return this.shadowRoot.querySelector("ui-button").button;
  }

  get uiButton() {
    return this.shadowRoot.querySelector("ui-button");
  }

  set isActive(value) {
    this.shadowRoot.querySelector("ui-button").isActive = value;
  }

  get isActive() {
    return this.shadowRoot.querySelector("ui-button").isActive;
  }
}
