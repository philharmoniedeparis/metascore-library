import { watch } from "vue";
import { defineStore, storeToRefs } from "pinia";
import { kebabCase } from "lodash";
import { useModule } from "@core/services/module-manager";

const IDLE_TRACKIG_EVENTS = [
  "mousemove",
  "mousedown",
  "touchstart",
  "touchmove",
  "keydown",
  "scroll",
  "wheel",
];
const IDLE_TIME_UPDATE_DELAY = 1000;

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
      idleTime: 0,
      idleTimeTracking: false,
      idleTimeTrackStart: null,
      idleTimeTimeoutId: null,
      idleTimeWatchers: new Map(),
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
    startIdleTimeTracking() {
      this.idleTimeTracking = true;

      const { playing } = useModule("media_player");
      const unwatch = watch(
        playing,
        (value) => {
          if (value) this.suspendIdleTimeTracking();
          else this.resumeIdleTimeTracking();
        },
        { immediate: true }
      );
      this.idleTimeWatchers.set("playing", unwatch);
    },
    suspendIdleTimeTracking(el = this.el) {
      this.resetIdleTime();

      if (this.idleTimeTimeoutId) {
        clearTimeout(this.idleTimeTimeoutId);
        this.idleTimeTimeoutId = null;
      }

      if (el) {
        IDLE_TRACKIG_EVENTS.forEach((event) => {
          el.removeEventListener(event, this.resetIdleTime, true);
        });
      }

      if (this.idleTimeWatchers.has("el")) {
        const unwatch = this.idleTimeWatchers.get("el");
        unwatch();
        this.idleTimeWatchers.delete("el");
      }
    },
    resumeIdleTimeTracking() {
      this.resetIdleTime();

      if (this.el) {
        IDLE_TRACKIG_EVENTS.forEach((event) => {
          this.el.addEventListener(event, this.resetIdleTime, true);
        });
        this.updateIdleTime();
      }

      const unwatch = watch(storeToRefs(this).el, (value, oldValue) => {
        this.suspendIdleTimeTracking(oldValue);
        this.resumeIdleTimeTracking();
      });
      this.idleTimeWatchers.set("el", unwatch);
    },
    stopIdleTimeTracking(el = this.el) {
      this.idleTimeTracking = false;
      this.resetIdleTime();

      this.suspendIdleTimeTracking(el);

      this.idleTimeWatchers.forEach((unwatch) => {
        unwatch();
      });
      this.idleTimeWatchers.clear();
    },
    updateIdleTime() {
      this.idleTimeTimeoutId = setTimeout(() => {
        this.updateIdleTime();
        this.idleTime = (Date.now() - this.idleTimeTrackStart) / 1000;
      }, IDLE_TIME_UPDATE_DELAY);
    },
    resetIdleTime() {
      this.idleTime = 0;
      this.idleTimeTrackStart = Date.now();
    },
    reset() {
      const { stop: stopMedia } = useModule("media_player");
      const {
        clearOverrides: clearComponentsOverrides,
        resetBlocksActivePage,
        getSortedScenarios,
        setActiveScenario,
      } = useModule("app_components");

      stopMedia();
      clearComponentsOverrides();
      resetBlocksActivePage();
      setActiveScenario(getSortedScenarios()[0].id);
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
