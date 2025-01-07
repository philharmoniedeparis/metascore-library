import { Msg, dialog, Blocks, Variables, utils } from "blockly/core";

export const LIST_TYPE = "Array";

/**
 * Handles "Create List" button in the lists toolbox category.
 * It will prompt the user for a list name, including re-prompts if a name
 * is already in use among the workspace's lists.
 *
 * @param workspace The workspace on which to create the variable.
 */
export function createListButtonHandler(workspace) {
  // This function needs to be named so it can be called recursively.
  function promptAndCheckWithAlert(defaultName) {
    Variables.promptName(Msg["NEW_LIST_TITLE"], defaultName, function (name) {
      if (!name) {
        // User canceled prompt.
        return;
      }

      const existing = workspace.getVariable(name);
      if (!existing) {
        // No conflict
        workspace.createVariable(name, LIST_TYPE);
        return;
      }

      const msg = Msg["VARIABLE_ALREADY_EXISTS"].replace("%1", existing.name);
      dialog.alert(msg, function () {
        promptAndCheckWithAlert(name);
      });
    });
  }
  promptAndCheckWithAlert("");
}

function flyoutCategory(workspace) {
  let xmlList = Variables.flyoutCategory(workspace);

  xmlList.at(-1)?.setAttribute("gap", "24");

  const button = document.createElement("button");
  button.setAttribute("text", "%{BKY_NEW_LIST}");
  button.setAttribute("callbackKey", "CREATE_LIST");

  workspace.registerButtonCallback("CREATE_LIST", function (button) {
    createListButtonHandler(button.getTargetWorkspace());
  });

  xmlList.push(button);

  const blockList = flyoutCategoryBlocks(workspace);
  xmlList = xmlList.concat(blockList);

  return xmlList;
}

function flyoutCategoryBlocks(workspace) {
  const variableModelList = workspace.getVariablesOfType(LIST_TYPE);

  const xmlList = [];

  if (variableModelList.length > 0) {
    // New variables are added to the end of the variableModelList.
    const mostRecentVariable = variableModelList[variableModelList.length - 1];

    if (Blocks["lists_set"]) {
      const block = utils.xml.createElement("block");
      block.setAttribute("type", "lists_set");
      block.setAttribute("gap", "5");
      block.appendChild(Variables.generateVariableFieldDom(mostRecentVariable));
      xmlList.push(block);
    }

    if (Blocks["lists_add"]) {
      const block = utils.xml.createElement("block");
      block.setAttribute("type", "lists_add");
      block.setAttribute("gap", "5");
      block.appendChild(Variables.generateVariableFieldDom(mostRecentVariable));
      xmlList.push(block);
    }

    if (Blocks["lists_empty"]) {
      const block = utils.xml.createElement("block");
      block.setAttribute("type", "lists_empty");
      block.appendChild(Variables.generateVariableFieldDom(mostRecentVariable));
      xmlList.push(block);
    }

    if (Blocks["lists_get"]) {
      const block = utils.xml.createElement("block");
      block.setAttribute("type", "lists_get");
      block.appendChild(Variables.generateVariableFieldDom(mostRecentVariable));
      xmlList.push(block);
    }

    if (Blocks["lists_isEmpty"]) {
      const block = utils.xml.createElement("block");
      block.setAttribute("type", "lists_isEmpty");
      xmlList.push(block);
    }
  }

  return xmlList;
}

export function registerCallbacks(workspace) {
  workspace.registerToolboxCategoryCallback(
    Variables.CATEGORY_NAME,
    flyoutCategory
  );
}
