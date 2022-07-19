import { useModule } from "@metascore-library/core/services/module-manager";
import Interpreter from "js-interpreter-npm";

const init = (interpreter, globalObject) => {
  // Add an API function for useModule.
  var wrapper = function (id) {
    id = String(id || "");
    return interpreter.createPrimitive(useModule(id));
  };
  interpreter.setProperty(
    globalObject,
    "useModule",
    interpreter.createNativeFunction(wrapper)
  );
};

export function run(code) {
  const interpreter = new Interpreter(code, init);
  return interpreter.run();
}
