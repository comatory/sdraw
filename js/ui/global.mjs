import { getClearButton, getSaveButton, getInfoButton } from "../dom.mjs";
import { resetCanvas, exportImage } from "../state/actions/canvas.mjs";
import { showInfo } from "../state/actions/ui.mjs";

export function createGlobalActionsPanel() {
  const controller = new AbortController();
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

  clearButton.addClickListener(handleClearClick, {
    once: true,
    signal: controller.signal,
  });
  saveButton.addClickListener(handleSaveClick, {
    once: true,
    signal: controller.signal,
  });
  infoButton.addClickListener(handleInfoClick, {
    once: true,
    signal: controller.signal,
  });

  return function dispose() {
    // TODO: in case these need to be disposed call `controller.abort()`
  };
}
