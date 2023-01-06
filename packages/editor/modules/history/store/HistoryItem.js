export default class HistoryItem {
  constructor({ undo, redo, coalesceId } = {}) {
    this._undo = undo;
    this._redo = redo;
    this._coalesceId = coalesceId;
  }

  set undo(value) {
    this._undo = value;
  }

  set redo(value) {
    this._redo = value;
  }

  set coalesceId(value) {
    this._coalesceId = value;
  }

  get undo() {
    return this._undo;
  }

  get redo() {
    return this._redo;
  }

  get coalesceId() {
    return this._coalesceId;
  }
}
