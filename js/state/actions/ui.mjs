import { getInfoDialog } from "../../dom.mjs";

export function showInfo() {
  const dialog = getInfoDialog();
  const closeButton = dialog.querySelector("#close-info");

  function closeDialog() {
    dialog.close();
    closeButton.removeEventListener("click", closeDialog);
  }

  dialog.showModal();

  closeButton.addEventListener("click", closeDialog);
}
