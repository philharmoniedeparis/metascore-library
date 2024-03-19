import { defineStore } from "pinia";
import { kebabCase } from "lodash";

export default defineStore("app-renderer", {
  state: () => {
    return {
      configs: {
        adaptSize: false,
        allowUpscaling: false,
      },
      ready: false,
      el: null,
      width: null,
      height: null,
      css: null,
      fullscreenElement: null,
    };
  },
  getters: {
    getComponentElement() {
      return (component) => {
        return this.el?.querySelector(
          `.metaScore-component.${kebabCase(component.type)}#${component.id}`
        );
      };
    },
  },
  actions: {
    configure(configs) {
      this.configs = {
        ...this.configs,
        ...configs,
      };
    },
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
    toggleFullscreen(force) {
      if (!this.el) return;

      if (typeof force === "undefined") {
        force = this.fullscreenElement === null;
      }

      if (force) {
        return this.el
          .requestFullscreen()
          .then(() => {
            this.fullscreenElement = document.fullscreenElement;

            // Add listener to unset fullscreenElement
            // when fullscreen is exited.
            const listener = () => {
              if (!document.fullscreenElement) {
                this.fullscreenElement = null;
                document.removeEventListener("fullscreenchange", listener);
              }
            };
            document.addEventListener("fullscreenchange", listener);
          })
          .catch((e) => {
            console.warn(e);
          });
      } else if (this.fullscreenElement) {
        try {
          document.exitFullscreen();
        } catch (e) {
          console.warn(e);
        }
      }
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
