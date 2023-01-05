export default class HistoryItem {
  constructor({ undo, redo } = {}) {
    this._undo = undo;
    this._redo = redo;
  }

  set undo(undo) {
    this._undo = undo;
  }

  set redo(redo) {
    this._redo = redo;
  }

  get undo() {
    return this._undo;
  }

  get redo() {
    return this._redo;
  }
}
