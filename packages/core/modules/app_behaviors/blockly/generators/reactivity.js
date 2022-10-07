import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { Variables, Names } from "blockly/core";

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
    this.definitions_["variables"] += `var ${name} = Reactivity.ref();\n`;
  }
};

JavaScript["variables_get"] = function (block) {
  // Variable getter.
  const varName = JavaScript.nameDB_.getName(
    block.getFieldValue("VAR"),
    Names.NameType.VARIABLE
  );
  const code = `Reactivity.unref(${varName})\n`;
  return [code, JavaScript.ORDER_ATOMIC];
};

JavaScript["variables_set"] = function (block) {
  // Variable setter.
  const argument0 =
    JavaScript.valueToCode(block, "VALUE", JavaScript.ORDER_ASSIGNMENT) || "0";
  const varName = JavaScript.nameDB_.getName(
    block.getFieldValue("VAR"),
    Names.NameType.VARIABLE
  );

  let code = "";
  code += `if (Reactivity.isRef(${varName})) ${varName}.value = ${argument0};\n`;
  code += `else ${varName} = ${argument0};\n`;

  return code;
};

JavaScript["reactivity_when"] = function (block) {
  const conditionCode =
    JavaScript.valueToCode(block, "CONDITION", JavaScript.ORDER_NONE) ||
    "false";
  const statement = JavaScript.statementToCode(block, "STATEMENT");

  let code = "";

  if (JavaScript.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += JavaScript.injectId(JavaScript.STATEMENT_PREFIX, block);
  }

  code += "Reactivity.watchEffect(function () {\n";
  code += `if (${conditionCode}) {\n`;
  code += statement;
  code += "}\n";
  code += "});\n";

  if (JavaScript.STATEMENT_SUFFIX) {
    code =
      JavaScript.prefixLines(
        JavaScript.injectId(JavaScript.STATEMENT_SUFFIX, block),
        JavaScript.INDENT
      ) + code;
  }

  return code;
};
