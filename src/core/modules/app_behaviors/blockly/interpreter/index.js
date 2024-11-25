import { compileCode } from "@nx-js/compiler-util";
import { isEmpty } from "lodash";
import App from "./App";
import Components from "./Components";
import Keyboard from "./Keyboard";
import Links from "./Links";
import Media from "./Media";
import Reactivity from "./Reactivity";

const interpreters = new Set([
  new App(),
  new Components(),
  new Keyboard(),
  new Links(),
  new Media(),
  new Reactivity(),
]);

export function exec(code) {
  reset();

  if (isEmpty(code)) return;

  let context = {};
  interpreters.forEach((interpreter) => {
    context = {
      ...context,
      ...interpreter.context,
    };
  });

  try {
    const compiled = compileCode(code);
    compiled(context);
  } catch (e) {
    console.error(e);
  }
}

export function reset() {
  interpreters.forEach((interpreter) => {
    interpreter.reset();
  });
}
