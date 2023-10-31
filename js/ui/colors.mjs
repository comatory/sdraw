import { COLOR_LIST } from "../state/constants.mjs";
import { setColor } from "../state/actions/tool.mjs";
import { getPanelColors } from "../dom.mjs";
import { updateActivatedButton } from "./utils.mjs";

export function createColorPanel({ state }) {
  const colors = getPanelColors();

  state.addListener((nextState, prevState) => {
    if (nextState.color === prevState.color) {
      return;
    }

    updateActivatedButton(colors, nextState.color);
  });

  COLOR_LIST.forEach((color) => {
    const button = document.createElement("button");
    button.style.backgroundColor = color;

    button.addEventListener("click", () => {
      setColor(color, { state });
    });

    button.dataset.value = color;
    button.style.backgroundColor = color;

    colors.appendChild(button);
  });

  const selectedColor = state.get((prevState) => prevState.color);

  if (selectedColor) {
    updateActivatedButton(colors, selectedColor);
  }
}
