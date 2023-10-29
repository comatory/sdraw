import { getClearButton, getSaveButton, getInfoButton } from "../dom.mjs"
import { resetCanvas, exportImage } from "../state/actions.mjs";

export function createGlobalActionsPanel({ state }) {
  const clearButton = getClearButton();
  const saveButton = getSaveButton();
  const infoButton = getInfoButton();

  function handleClearClick() {
    const confirm = window.confirm("Are you sure you want to clear the canvas?");

    if (!confirm) {
      return;
    }

    resetCanvas();
  }

  function handleSaveClick() {
    exportImage();
  }

  clearButton.addEventListener("click", handleClearClick);
  saveButton.addEventListener("click", handleSaveClick);

  return function dispose() {
    clearButton.removeEventListener("click", handleClearClick);
    saveButton.removeEventListener("click", handleSaveClick);
  }
}
