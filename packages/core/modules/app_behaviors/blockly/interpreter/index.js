import { run, stop } from "./utils";
import * as Components from "./components";
import * as MedaiTime from "./mediatime";
import * as Keyboard from "./keyboard";

export function exec(code) {
  reset();

  run(code, (interpreter, globalObject) => {
    Components.init(interpreter, globalObject);
    MedaiTime.init(interpreter, globalObject);
    Keyboard.init(interpreter, globalObject);
  });
}

export function reset() {
  stop();
  Components.reset();
  Keyboard.reset();
}
