import { javascriptGenerator as JavaScript } from "blockly/javascript";

JavaScript["links_click"] = function (block) {
  const id = block.getFieldValue("TRIGGER");
  const statement = JavaScript.statementToCode(block, "STATEMENT");

  let code = "";

  if (JavaScript.STATEMENT_PREFIX) {
    // Automatic prefix insertion is switched off for this block.  Add manually.
    code += JavaScript.injectId(JavaScript.STATEMENT_PREFIX, block);
  }

  code += `Links.addEventListener("${id}", "click", function () {\n`;
  code += statement;
  code += "});\n";

  if (JavaScript.STATEMENT_SUFFIX) {
    code =
      JavaScript.prefixLines(
        JavaScript.injectId(JavaScript.STATEMENT_SUFFIX, block),
        JavaScript.INDENT
      ) + code;
  }

  // Add auto highlighting.
  block
    .getChildren()
    .filter(({ type }) => type === "media_play_excerpt")
    .forEach((child) => {
      const highlight_link = child.getFieldValue("HIGHLIGHT_LINK") || "FALSE";
      if (highlight_link === "TRUE") {
        const from = JavaScript.valueToCode(
          child,
          "FROM",
          JavaScript.ORDER_ASSIGNMENT
        );
        const to = JavaScript.valueToCode(
          child,
          "TO",
          JavaScript.ORDER_ASSIGNMENT
        );
        code += `Links.autoHighlight("${id}", ${from}, ${to});\n`;
      }
    });

  return code;
};

JavaScript["links_open_url"] = function (block) {
  const url =
    JavaScript.valueToCode(block, "URL", JavaScript.ORDER_ASSIGNMENT) || "";
  const code = `Links.openUrl(${url});`;
  return code;
};
