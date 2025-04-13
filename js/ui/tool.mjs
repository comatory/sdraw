import { UiButton } from "./button.mjs";
import { setTool } from "../state/actions/tool.mjs";

/**
 * Represents tool/action button.
 */
export class ToolButton extends HTMLElement {
  constructor({ tool, state, isActive }) {
    super();

    this.id = tool.id;
    this.#isActive = isActive;
    this.#tool = tool;
    this.#state = state;
    this.attachShadow({ mode: "open" });
  }

  #isActive = false;
  id = "";
  #state = null;
  #tool = null;

  connectedCallback() {
    const button = new UiButton({
      ariaLabel: this.#tool.id.description,
      dataset: {
        id: this.id.description,
        value: this.#tool.id.description,
      },
      iconUrl: this.#tool.iconUrl,
      onClick: this.#onClick,
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

  #onClick = () => {
    setTool(this.#tool, { state: this.#state });
  }
}
