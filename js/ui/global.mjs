import { getClearButton, getSaveButton, getInfoButton } from "../dom.mjs";
import { resetCanvas, exportImage } from "../state/actions/canvas.mjs";
import { showInfo } from "../state/actions/ui.mjs";

export function createGlobalActionsPanel() {
  const clearButton = getClearButton();
  const saveButton = getSaveButton();
  const infoButton = getInfoButton();

  function handleClearClick() {
    const confirm = window.confirm(
      "Are you sure you want to clear the canvas?",
    );

    if (!confirm) {
      return;
    }

    resetCanvas();
  }

  function handleSaveClick() {
    exportImage();
  }

  function handleInfoClick() {
    showInfo();
  }

  clearButton.addClickListener(handleClearClick);
  saveButton.addClickListener(handleSaveClick);
  infoButton.addClickListener(handleInfoClick);

  return function dispose() {
    clearButton.removeClickListener(handleClearClick);
    saveButton.removeClickListener(handleSaveClick);
    infoButton.removeClickListener(handleInfoClick);
  };
}
