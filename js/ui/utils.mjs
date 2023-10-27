export async function loadIcon(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load icon: ${response.status}`);
  }

  return response.text();
}

export function disposeCallback(button, listeners) {
  const callback = listeners[button.dataset.value];

  if (!callback) {
    throw new Error("No callback registered!");
  }

  button.removeEventListener("click", callback);

  delete listeners[button.dataset.value];
}

export function ensureCallbacksRemoved(listeners) {
  if (Object.keys(listeners).length === 0) {
    return;
  }
  throw new Error("Not all listeners were removed!");
}

export function updateActivatedButton(buttonContainer, value) {
  const buttons = buttonContainer.querySelectorAll("button");

  Array.from(buttons).forEach((button) => {
    if (button.dataset.value === value) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}
