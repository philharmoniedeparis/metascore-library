import { Interpreter } from "js-interpreter-npm";

let stopped = true;
let timeout = null;

function step(interpreter) {
  if (interpreter.step()) {
    stopped = false;
    timeout = window.setTimeout(() => {
      step(interpreter);
    }, 0);
  } else {
    stopped = true;
  }
}

export function run(code, init) {
  const interpreter = new Interpreter(code, init);
  step(interpreter);
}

export function stop() {
  clearTimeout(timeout);
  timeout = null;
  stopped = true;
}

export function append(code, interpreter) {
  interpreter.appendCode(code);

  if (stopped) {
    step(interpreter);
  }
}
