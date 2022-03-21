const stack = [];
let index = 0;

function push(value) {
  stack.splice(index);
  stack.push(value);
  index++;
}

function canUndo() {
  return index > 0;
}

function canRedo() {
  return index < stack.length;
}

function undo() {
  if (this.canUndo()) {
    return stack[--index];
  }
}

function redo() {
  if (canRedo()) {
    return stack[index++];
  }
}

export { push, canUndo, canRedo, undo, redo };
