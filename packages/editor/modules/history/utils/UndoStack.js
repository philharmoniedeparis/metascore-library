export default class {
  constructor(initial_value) {
    this.stack = [initial_value];
    this.index = 1;
  }

  push(value) {
    this.stack.splice(this.index);
    this.stack.push(value);
    this.index++;
  }

  canUndo() {
    return this.index > 1;
  }

  canRedo() {
    return this.index < this.stack.length;
  }

  undo() {
    if (this.canUndo()) {
      return this.stack[--this.index - 1];
    }
  }

  redo() {
    if (this.canRedo()) {
      return this.stack[++this.index - 1];
    }
  }
}
