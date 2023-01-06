import HistoryItem from "./HistoryItem";

export default class HistoryGroup extends HistoryItem {
  constructor({ coalesce = false, ...rest } = {}) {
    super(rest);

    this._coalesce = coalesce;
    this._items = [];
  }

  set undo(value) {
    super.undo = value;
  }

  set redo(value) {
    super.redo = value;
  }

  get items() {
    return this._items;
  }

  get undo() {
    return (
      super.undo ||
      (async () => {
        for (const item of [...this._items].reverse()) {
          await item.undo();
        }
      })
    );
  }

  get redo() {
    return (
      super.redo ||
      (async () => {
        for (const item of this._items) {
          await item.redo();
        }
      })
    );
  }

  push(item) {
    if (this._closed) {
      return false;
    }

    if (this._coalesce && this._items.length > 0) {
      this._items[0].redo = item.redo;
    } else {
      this.items.push(item);
    }
  }
}
