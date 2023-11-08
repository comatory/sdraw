function getUpgradeToast() {
  return document.getElementById("upgrade-toast");
}

export function showUpgradeToast(registration) {
  const toast = getUpgradeToast();

  function hideUpgradeToast() {
    updateButton.removeEventListener("click", updateServiceWorker);
    closeButton.removeEventListener("click", hideUpgradeToast);

    toast.setAttribute("aria-hidden", true);
  }

  function updateServiceWorker() {
    if (!registration.waiting) {
      return;
    }

    registration.waiting.postMessage({ type: "SKIP_WAITING" });
    hideUpgradeToast();
  }

  const updateButton = toast.querySelector("#upgrade");
  const closeButton = toast.querySelector("#dismiss-upgrade");

  closeButton.addEventListener("click", hideUpgradeToast);
  updateButton.addEventListener("click", updateServiceWorker);

  toast.setAttribute("aria-hidden", false);
}
