import { javascriptGenerator as Generator, Order } from "blockly/javascript";

Generator.forBlock["links_click"] = function (block) {
  const trigger = Generator.valueToCode(block, "TRIGGER", Order.ATOMIC);
  const statement = Generator.statementToCode(block, "STATEMENT");

  let code = "";

  if (Generator.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += Generator.injectId(Generator.STATEMENT_PREFIX, block);
  }

  code += `Links.addEventListener(${trigger}, "click", function () {\n`;
  code += statement;
  code += "});\n";

  if (Generator.STATEMENT_SUFFIX) {
    code =
      Generator.prefixLines(
        Generator.injectId(Generator.STATEMENT_SUFFIX, block),
        Generator.INDENT
      ) + code;
  }

  // Add auto highlighting.
  block
    .getChildren()
    .filter(({ type }) => type === "media_play_excerpt")
    .forEach((child) => {
      const highlight_link = child.getFieldValue("HIGHLIGHT_LINK") || "FALSE";
      if (highlight_link === "TRUE") {
        const from = Generator.valueToCode(child, "FROM", Order.ASSIGNMENT);
        const to = Generator.valueToCode(child, "TO", Order.ASSIGNMENT);
        code += `Links.autoHighlight(${trigger}, ${from}, ${to});\n`;
      }
    });

  return code;
};

Generator.forBlock["links_open_url"] = function (block) {
  const url = Generator.valueToCode(block, "URL", Order.ASSIGNMENT) || "";
  const code = `Links.openUrl(${url});\n`;
  return code;
};
