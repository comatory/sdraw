import { getPanelTools, getToolButtons, getToolButtonById } from "../dom.mjs";
import { setTool } from "../state/actions/tool.mjs";
import { TOOL_LIST } from "../state/constants.mjs";
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

    const prevActiveButton = Array.from(getToolButtons()).find(
      (b) => b.isActive,
    );
    prevActiveButton.isActive = false;

    const toolId = updatedState.tool.id;
    const nextActiveButton = getToolButtonById(toolId);

    if (!nextActiveButton) {
      throw new Error(`Tool button not found for tool: ${toolId}`);
    }

    nextActiveButton.isActive = true;

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

  const selectedTool = state.get((prevState) => prevState.tool);

  TOOL_LIST.forEach((tool) => {
    const button = new ToolButton({
      ...tool,
      onClick: () => setTool(tool, { state }),
      isActive: selectedTool.id === tool.id,
    });

    tools.appendChild(button);
  });

  if (selectedTool) {
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
