export default class HistoryGroup {
  constructor(coalesce = false) {
    this._coalesce = coalesce;
    this._items = [];
  }

  get items() {
    return this._items;
  }

  get undo() {
    return async () => {
      for (const item of [...this._items].reverse()) {
        await item.undo();
      }
    };
  }

  get redo() {
    return async () => {
      for (const item of this._items) {
        await item.redo();
      }
    };
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
