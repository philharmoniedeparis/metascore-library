import { defineStore } from "pinia";

export default defineStore("app-renderer", {
  state: () => {
    return {
      el: null,
      width: null,
      height: null,
      css: null,
    };
  },
  actions: {
    init({ width, height, css }) {
      this.width = width;
      this.height = height;
      this.css = css;
    },
    setWidth(value) {
      this.width = value;
    },
    setHeight(value) {
      this.height = value;
    },
    setCSS(value) {
      this.css = value;
    },
  },
  history(context) {
    const {
      name, // Invoked action's name.
      after, // Hook called after the action executes.
      push, // Method to push an undo/redo item to the history.
    } = context;

    switch (name) {
      case "setWidth":
      case "setHeight":
        {
          const key = name === "setWidth" ? "width" : "height";
          const oldValue = this[key];
          after(() => {
            const newValue = this[key];
            push({
              undo: () => {
                this[name](oldValue);
              },
              redo: () => {
                this[name](newValue);
              },
            });
          });
        }
        break;
    }
  },
});
