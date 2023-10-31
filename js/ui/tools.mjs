import { getPanelTools } from "../dom.mjs";
import { setTool } from "../state/actions/tool.mjs";
import { TOOL_LIST } from "../state/constants.mjs";
import { loadIcon, updateActivatedButton } from "./utils.mjs";
import { buildToolActions } from "./actions.mjs";
import { buildToolVariants } from "./variants.mjs";

export function createToolPanel({ state }) {
  const tools = getPanelTools();
  let disposeVariantsCallback = null;
  let disposeActionsCallback = null;

  state.addListener((updatedState, prevState) => {
    if (updatedState.tool === prevState.tool) {
      return;
    }

    if (disposeVariantsCallback) {
      disposeVariantsCallback();
      disposeVariantsCallback = null;
    }

    if (disposeActionsCallback) {
      disposeActionsCallback();
      disposeActionsCallback = null;
    }

    updateActivatedButton(tools, updatedState.tool.id.description);

    if (updatedState.tool.variants) {
      disposeVariantsCallback = buildToolVariants(updatedState.tool, state);
    }

    if (updatedState.tool.actions) {
      disposeActionsCallback = buildToolActions(updatedState.tool, state);
    }
  });

  TOOL_LIST.forEach((tool) => {
    const button = document.createElement("button");

    button.addEventListener(
      "click",
      () => {
        if (disposeVariantsCallback) {
          disposeVariantsCallback();
          disposeVariantsCallback = null;
        }

        if (disposeActionsCallback) {
          disposeActionsCallback();
          disposeActionsCallback = null;
        }

        setTool(tool, { state });
      },
      true,
    );

    button.dataset.value = tool.id.description;

    loadIcon(tool.iconUrl)
      .then((icon) => {
        button.innerHTML = icon;
      })
      .catch((error) => {
        console.error(error);
        button.innerText = tool.id.description;
      });

    tools.appendChild(button);
  });

  const selectedTool = state.get((prevState) => prevState.tool);

  if (selectedTool) {
    updateActivatedButton(tools, selectedTool.id.description);

    if (selectedTool.variants) {
      disposeVariantsCallback = buildToolVariants(selectedTool, state);
    }

    if (selectedTool.actions) {
      disposeActionsCallback = buildToolActions(selectedTool, state);
    }
  }
}
