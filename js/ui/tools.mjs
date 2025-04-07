import { getPanelTools } from "../dom.mjs";
import { setTool } from "../state/actions/tool.mjs";
import { TOOL_LIST } from "../state/constants.mjs";
import { updateActivatedButton } from "./utils.mjs";
import { buildToolActions } from "./actions.mjs";
import { buildToolVariants } from "./variants.mjs";
import { ToolButton } from "./tool.mjs";

export function createToolPanel({ state }) {
  const tools = getPanelTools();
  let actionsController = new AbortController();
  let variantsController = new AbortController();

  state.addListener((updatedState, prevState) => {
    if (updatedState.tool === prevState.tool) {
      return;
    }

    if (!variantsController.signal.aborted) {
      variantsController.abort();
    }

    if (!actionsController.signal.aborted) {
      actionsController.abort();
    }

    variantsController = new AbortController();
    actionsController = new AbortController();

    updateActivatedButton(tools, updatedState.tool.id.description);

    if (updatedState.tool.variants) {
      buildToolVariants(updatedState.tool, {
        state,
        signal: variantsController.signal,
      });
    }

    if (updatedState.tool.actions) {
      buildToolActions(updatedState.tool, {
        state,
        signal: actionsController.signal,
      });
    }
  });

  TOOL_LIST.forEach((tool) => {
    const button = new ToolButton({
      ...tool,
      onClick: () => setTool(tool, { state }),
    });

    tools.appendChild(button);
  });

  const selectedTool = state.get((prevState) => prevState.tool);

  if (selectedTool) {
    updateActivatedButton(tools, selectedTool.id.description);

    if (selectedTool.variants) {
      buildToolVariants(selectedTool, {
        state,
        signal: variantsController.signal,
      });
    }

    if (selectedTool.actions) {
      buildToolActions(selectedTool, {
        state,
        signal: actionsController.signal,
      });
    }
  }
}
