import { compileCode } from "@nx-js/compiler-util";
import { javascriptGenerator as JavaScript } from "blockly/javascript";
import { isEmpty } from "lodash";
import App from "./App";
import Components from "./Components";
import Keyboard from "./Keyboard";
import Links from "./Links";
import Media from "./Media";
import Variables from "./Variables";
import Reactivity from "./Reactivity";

const interpreters = new Map([
  ["App", new App()],
  ["Components", new Components()],
  ["Keyboard", new Keyboard()],
  ["Links", new Links()],
  ["Media", new Media()],
  ["Variables", new Variables()],
  ["Reactivity", new Reactivity()],
]);

let context = null;

export function exec(code) {
  reset();

  if (isEmpty(code)) return;

  context = interpreters.entries().reduce((acc, [key, interpreter]) => {
    // Ensure context name does not conflict with variable names.
    JavaScript.addReservedWords(key);

    acc[key] = interpreter.context;
    return acc;
  }, {});

  try {
    const compiled = compileCode(code);
    compiled(context);
  } catch (e) {
    console.error(e);
  }
}

export function reset() {
  context = null;

  interpreters.forEach((interpreter) => {
    interpreter.reset();
  });
}

export function getContext() {
  return context;
}
