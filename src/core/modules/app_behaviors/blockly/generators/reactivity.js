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
    const name = this.nameDB_.getName(
      devVarList[i],
      Names.NameType.DEVELOPER_VARIABLE
    );
    this.definitions_["variables"] += `Variables.store.value.set('${name}', null);\n`;
  }
  // Add user variables as reactive variables, but only ones that are being used.
  const variables = Variables.allUsedVarModels(workspace);
  for (let i = 0; i < variables.length; i++) {
    const name = this.nameDB_.getName(
      variables[i].getId(),
      Names.NameType.VARIABLE
    );
    this.definitions_["variables"] += `Variables.store.value.set('${name}', null);\n`;
  }
};

Generator.forBlock["variables_get"] = function (block) {
  // Variable getter.
  const varName = Generator.nameDB_.getName(
    block.getFieldValue("VAR"),
    Names.NameType.VARIABLE
  );
  const code = `Variables.store.value.get('${varName}')`;
  return [code, Order.ATOMIC];
};

Generator.forBlock["variables_set"] = function (block) {
  // Variable setter.
  const argument0 =
    Generator.valueToCode(block, "VALUE", Order.ASSIGNMENT) || "0";
  const varName = Generator.nameDB_.getName(
    block.getFieldValue("VAR"),
    Names.NameType.VARIABLE
  );

  let code = "";
  code += `if (Variables.store.value.has('${varName}')) Variables.store.value.set('${varName}', ${argument0});\n`;
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
