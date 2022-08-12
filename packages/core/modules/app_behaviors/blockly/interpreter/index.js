import { compileCode } from "@nx-js/compiler-util";
import { isEmpty } from "lodash";
import * as Components from "./components";
import * as Medai from "./media";
import * as Keyboard from "./keyboard";
import * as Reactivity from "./reactivity";

export function exec(code) {
  reset();

  if (isEmpty(code)) {
    return;
  }

  const context = {};
  Components.init(context);
  Medai.init(context);
  Keyboard.init(context);
  Reactivity.init(context);

  try {
    const compiled = compileCode(code);
    compiled(context);
  } catch (e) {
    console.error(e);
  }
}

export function reset() {
  Components.reset();
  Keyboard.reset();
  Reactivity.reset();
}
