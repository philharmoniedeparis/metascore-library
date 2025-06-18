import { javascriptGenerator as Generator, Order } from "blockly/javascript";
import { Variables, Names } from "blockly/core";

const init = Generator.init;

Generator.init = function (workspace) {
  init.call(this, workspace);

  // Override the variable definitions.
  this.definitions_["variables"] = "";
  // Add developer variables (not created or named by the user).
  const devVarList = Variables.allDeveloperVariables(workspace);
  for (let i = 0; i < devVarList.length; i++) {
    const varId = devVarList[i];
    this.definitions_["variables"] += `Variables.store.value.set('${varId}', null);\n`;
  }
  // Add user variables as reactive variables, but only ones that are being used.
  const variables = Variables.allUsedVarModels(workspace);
  for (let i = 0; i < variables.length; i++) {
    const varId = variables[i].getId();
    this.definitions_["variables"] += `Variables.store.value.set('${varId}', null);\n`;
  }
};

Generator.forBlock["variables_get"] = function (block) {
  // Variable getter.
  const varId = block.getFieldValue("VAR")
  const code = `Variables.store.value.get('${varId}')`;
  return [code, Order.ATOMIC];
};

Generator.forBlock["variables_set"] = function (block) {
  // Variable setter.
  const argument0 =
    Generator.valueToCode(block, "VALUE", Order.ASSIGNMENT) || "0";
  const varId = block.getFieldValue("VAR")
  const varName = Generator.nameDB_.getName(varId,  Names.NameType.VARIABLE);

  let code = "";
  code += `if (Variables.store.value.has('${varId}')) Variables.store.value.set('${varId}', ${argument0});\n`;
  code += `else ${varName} = ${argument0};\n`;

  return code;
};

Generator.forBlock["reactivity_when"] = function (block) {
  const conditionCode =
    Generator.valueToCode(block, "CONDITION", Order.NONE) || "false";
  const statement = Generator.statementToCode(block, "STATEMENT");

  let code = "";

  if (Generator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Generator.injectId(Generator.STATEMENT_PREFIX, block);
  }

  code += "Reactivity.watchEffect(function () {\n";
  code += `if (${conditionCode}) {\n`;
  code += statement;
  code += "}\n";

  if (block.getInput("ELSE")) {
    const statement = Generator.statementToCode(block, "ELSE");
    code += `else {\n`;
    code += statement;
    code += "}\n";
  }

  code += "});\n";

  if (Generator.STATEMENT_SUFFIX) {
    code =
      Generator.prefixLines(
        Generator.injectId(Generator.STATEMENT_SUFFIX, block),
        Generator.INDENT
      ) + code;
  }

  return code;
};
