import { getInfoDialog } from "../../dom.mjs";

export function blockInteractions({ state }) {
  state.set(() => ({
    blockedInteractions: true,
  }));
}

export function unblockInteractions({ state }) {
  state.set(() => ({
    blockedInteractions: false,
  }));
}

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
