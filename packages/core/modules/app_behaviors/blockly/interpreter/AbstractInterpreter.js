import { javascriptGenerator as JavaScript } from "blockly/javascript";

export default class AbstractInterpreter {
  addToContext(context) {
    const name = this.getName();

    // Ensure context name does not conflict with variable names.
    JavaScript.addReservedWords(name);

    context[name] = this.getContext();
  }
  reset() {}
  getName() {
    return this.constructor.name;
  }
  getContext() {
    return {};
  }
}
