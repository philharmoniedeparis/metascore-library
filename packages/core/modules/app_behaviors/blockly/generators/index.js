import JavaScript from "blockly/javascript";
import { Variables, Names } from "blockly/core";

export * from "./components";
export * from "./keyboard";
export * from "./links";
export * from "./mediatime";
export * from "./reactivity";

const init = JavaScript.init;

JavaScript.init = function (workspace) {
  init.call(this, workspace);

  // Override the variable definitions.
  this.definitions_["variables"] = "";
  // Add developer variables (not created or named by the user).
  const devVarList = Variables.allDeveloperVariables(workspace);
  for (let i = 0; i < devVarList.length; i++) {
    const name = this.nameDB_.getName(
      devVarList[i],
      Names.NameType.DEVELOPER_VARIABLE
    );
    this.definitions_["variables"] += `var ${name};\n`;
  }
  // Add user variables as reactive variables, but only ones that are being used.
  const variables = Variables.allUsedVarModels(workspace);
  for (let i = 0; i < variables.length; i++) {
    const name = this.nameDB_.getName(
      variables[i].getId(),
      Names.NameType.VARIABLE
    );
    this.definitions_["variables"] += `var ${name} = ref();\n`;
  }
};
