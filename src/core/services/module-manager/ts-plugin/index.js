/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("path");

const REGISTRY_FILE_PATH = path.resolve(__dirname, "../types/generated/module-registry.ts");

/** Serialize a signature (call or construct) */
function serializeSignature(ts, checker, signature) {
  return {
    parameters: signature.parameters.map(param => serializeSymbol(ts, checker, param)),
    returnType: checker.typeToString(signature.getReturnType()),
    documentation: ts.displayPartsToString(signature.getDocumentationComment(checker))
  };
}

/** Serialize a symbol into a json object */
function serializeSymbol(ts, checker, symbol) {
  return {
    name: symbol.getName(),
    documentation: ts.displayPartsToString(symbol.getDocumentationComment(checker)),
    type: checker.typeToString(
      checker.getTypeOfSymbolAtLocation(symbol, symbol.valueDeclaration)
    )
  };
}

/** Serialize a class symbol information */
function serializeClass(ts, checker, symbol) {
  const details = serializeSymbol(ts, checker, symbol);

  // Get the construct signatures
  const constructorType = checker.getTypeOfSymbolAtLocation(
    symbol,
    symbol.valueDeclaration
  );
  details.constructors = constructorType
    .getConstructSignatures()
    .map((signature) => serializeSignature(ts, checker, signature));
  return details;
}

function updateRegistry(ts, info) {
  const program = info.languageService.getProgram();
  if (!program) return;

  const checker = program.getTypeChecker();
  
  const MODULE_REGISTRY = {};

  for (const sourceFile of program.getSourceFiles()) {
    if (!sourceFile.fileName.endsWith(".ts")) continue;

    ts.forEachChild(sourceFile, (node) => {
      if (ts.isClassDeclaration(node) && node.heritageClauses) {
        for (const heritageClause of node.heritageClauses) {
          if (heritageClause.token === ts.SyntaxKind.ExtendsKeyword) {
            const baseClass = heritageClause.types[0]?.expression.getText(sourceFile);
            if (baseClass === "AbstractModule" && node.name) {
              const symbol = checker.getSymbolAtLocation(node.name);
              if (symbol) MODULE_REGISTRY["y"] = serializeClass(ts, checker, symbol);
              else MODULE_REGISTRY["z"] = node.name.text;
            }
          }
        }
      }
    });
  }

  info.project.projectService.logger.info(`Updated module registry: ${REGISTRY_FILE_PATH}`);
  info.project.projectService.logger.info(JSON.stringify(MODULE_REGISTRY, undefined, 2));
}

module.exports = function ({ typescript: ts }) {
  return {
    create: (info) => {
      info.project.projectService.logger.info("Module Manager TS Plugin Loaded");

      const proxy = { ...info.languageService };

      // Hook into program updates (e.g., file changes)
      proxy.getSemanticDiagnostics = (fileName) => {
        updateRegistry(ts, info); // Regenerate the registry on each call
    
        return info.languageService.getSemanticDiagnostics(fileName);
      };

      return proxy;
    }
  }
}