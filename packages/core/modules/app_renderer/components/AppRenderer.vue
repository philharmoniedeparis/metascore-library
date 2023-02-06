<template>
  <Transition name="fade">
    <div v-show="ready" class="metaScore-app" tabindex="-1" :style="style">
      <media-player
        v-show="false"
        v-if="mediaSource"
        :source="mediaSource"
        type="video"
      />
      <template v-for="scenario in scenarios" :key="scenario.id">
        <scenario-component
          v-if="scenario.id === activeScenario"
          :component="scenario"
          @action="onComponentAction"
        />
      </template>
    </div>
  </Transition>
</template>

<script>
import { debounce } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "../store";

const BLOCK_TOGGLE_LINKS_OVERRIDES_KEY = "app_renderer:block_toggle_links";
const BLOCK_TOGGLE_LINKS_OVERRIDES_PRIORITY = 100;

export default {
  props: {
    responsive: {
      type: Boolean,
      default: false,
    },
    allowUpscaling: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const store = useStore();
    const {
      getComponent,
      getComponentsByType,
      activeScenario,
      setActiveScenario,
      setBlockActivePage,
      setOverrides: setComponentOverrides,
    } = useModule("app_components");
    const {
      source: mediaSource,
      play: playMedia,
      pause: pauseMedia,
      stop: stopMedia,
      seekTo: seekMediaTo,
    } = useModule("media_player");
    const { setGlobalCuepoint, removeCuepoint } = useModule("media_cuepoints");
    return {
      store,
      mediaSource,
      playMedia,
      pauseMedia,
      stopMedia,
      seekMediaTo,
      getComponent,
      getComponentsByType,
      activeScenario,
      setActiveScenario,
      setBlockActivePage,
      setComponentOverrides,
      setGlobalCuepoint,
      removeCuepoint,
    };
  },
  data() {
    return {
      containerWidth: null,
      containerHeight: null,
    };
  },
  computed: {
    width() {
      return this.store.width;
    },
    height() {
      return this.store.height;
    },
    css() {
      return this.store.css;
    },
    ready: {
      get() {
        return this.store.ready;
      },
      set(value) {
        this.store.ready = value;
      },
    },
    scenarios() {
      return this.getComponentsByType("Scenario");
    },
    style() {
      if (this.responsive) {
        let scale = Math.min(
          this.containerWidth / this.width,
          this.containerHeight / this.height
        );

        if (!this.allowUpscaling) {
          scale = Math.min(1, scale);
        }

        return {
          width: `${this.width}px`,
          height: `${this.height}px`,
          transformOrigin: "left top 0px",
          transform: `scale(${scale})`,
          marginRight: `${this.width * scale - this.width}px`,
          marginBottom: `${this.height * scale - this.height}px`,
        };
      }

      return {
        width: `${this.width}px`,
        height: `${this.height}px`,
      };
    },
  },
  watch: {
    css(value) {
      this.ready = !value;

      if (!this._sheet) {
        const doc = this.$el.ownerDocument;
        this._sheet = doc.createElement("link");
        this._sheet.addEventListener("load", this.onSheetLoad);
        this._sheet.addEventListener("error", this.onSheetError);
        doc.head.appendChild(this._sheet);
      }

      this._sheet.setAttribute("rel", "stylesheet");
      this._sheet.setAttribute("type", "text/css");
      this._sheet.setAttribute("href", value);
    },
    responsive(value) {
      if (value) {
        this.setupResizeObserver();
      } else {
        this.destroyResizeObserver();
      }
    },
  },
  mounted() {
    if (this.responsive) {
      this.setupResizeObserver();

      const win = this.$el.ownerDocument.defaultView;
      win.addEventListener("orientationchange", this.onWindowOrientationChange);
    }

    this.$nextTick(function () {
      this.store.el = this.$el;
    });
  },
  beforeUnmount() {
    if (this.responsive) {
      this.destroyResizeObserver();

      const win = this.$el.ownerDocument.defaultView;
      win.removeEventListener(
        "orientationchange",
        this.onWindowOrientationChange
      );
    }

    this.store.el = null;
  },
  methods: {
    setupResizeObserver() {
      if (this._resize_observer) {
        return;
      }

      const container = this.$el.parentNode;
      this.containerWidth = container.clientWidth;
      this.containerHeight = container.clientHeight;

      this._resize_observer = new ResizeObserver(
        debounce(() => {
          this.containerWidth = container.clientWidth;
          this.containerHeight = container.clientHeight;
        }, 500)
      );
      this._resize_observer.observe(container);
    },
    destroyResizeObserver() {
      if (this._resize_observer) {
        this._resize_observer.disconnect();
      }
    },
    onWindowOrientationChange() {
      const container = this.$el.parentNode;
      this.containerWidth = container.clientWidth;
      this.containerHeight = container.clientHeight;
    },
    onComponentAction({ type, ...args }) {
      switch (type) {
        case "play":
          if ("excerpt" in args && args.excerpt) {
            const { start = null, end = null, scenario = null } = args;
            const cuepoint_config = {
              startTime: start,
              endTime: end,
              onStop: () => {
                this.pauseMedia();
              },
              onSeekout: ({ cuepoint }) => {
                this.removeCuepoint(cuepoint);
              },
            };

            if (
              scenario !== null &&
              this.getComponent("Scenario", scenario) &&
              scenario !== this.activeScenario
            ) {
              const previous_scenario = this.activeScenario;
              cuepoint_config.onSeekout = ({ cuepoint }) => {
                this.setActiveScenario(previous_scenario);
                this.removeCuepoint(cuepoint);
              };
              this.setActiveScenario(scenario);
            }

            this.setGlobalCuepoint(cuepoint_config);

            if (start !== null) {
              this.seekMediaTo(start);
            }
          }
          this.playMedia();
          break;

        case "pause":
          this.pauseMedia();
          break;

        case "stop":
          this.stopMedia();
          break;

        case "seek":
          if ("time" in args) {
            this.seekMediaTo(args?.time || 0);
          }
          break;

        case "page":
          if ("block" in args && "index" in args) {
            const block = this.getComponentsByType("Block").find(
              (c) => c.name === args.block
            );
            if (block) {
              this.setBlockActivePage(block, args.index);
            }
          }
          break;

        case "showBlock":
          if ("name" in args) {
            const block = this.getComponentsByType("Block").find(
              (c) => c.name === args.name
            );
            if (block) {
              this.setComponentOverrides(
                block,
                BLOCK_TOGGLE_LINKS_OVERRIDES_KEY,
                { hidden: false },
                BLOCK_TOGGLE_LINKS_OVERRIDES_PRIORITY
              );
            }
          }
          break;

        case "hideBlock":
          if ("name" in args) {
            const block = this.getComponentsByType("Block").find(
              (c) => c.name === args.name
            );
            if (block) {
              this.setComponentOverrides(
                block,
                BLOCK_TOGGLE_LINKS_OVERRIDES_KEY,
                { hidden: true },
                BLOCK_TOGGLE_LINKS_OVERRIDES_PRIORITY
              );
            }
          }
          break;

        case "toggleBlock":
          if ("name" in args) {
            const block = this.getComponentsByType("Block").find(
              (c) => c.name === args.name
            );
            if (block)
              this.setComponentOverrides(
                block,
                BLOCK_TOGGLE_LINKS_OVERRIDES_KEY,
                { hidden: !block.hidden },
                BLOCK_TOGGLE_LINKS_OVERRIDES_PRIORITY
              );
          }
          break;

        case "scenario":
          if ("id" in args) {
            const scenario = this.getComponent("Scenario", args.id);
            if (scenario) this.setActiveScenario(scenario.id);
          }
          break;

        case "enterFullscreen":
          this.store.toggleFullscreen(true);
          break;

        case "exitFullscreen":
          this.store.toggleFullscreen(false);
          break;

        case "toggleFullscreen":
          this.store.toggleFullscreen();
          break;
      }
    },
    onSheetLoad() {
      this.ready = true;
    },
    onSheetError() {
      this.ready = true;
    },
  },
};
</script>

<style lang="scss">
html,
body {
  width: 100%;
  height: 100%;
}

body {
  margin: 0;
  overflow: hidden;
}
</style>

<style lang="scss" scoped>
.metaScore-app {
  position: relative;
  width: 100%;
  height: 100%;
  font-size: 11px;
  font-family: Verdana, Arial, Helvetica, sans-serif;
  background: var(--metascore-color-white);

  :deep(.sr-only) {
    @include sr-only;
  }

  :deep(button) {
    background: none;
    border: none;
    cursor: pointer;
  }

  /* @todo: allow other modules to add CSS */
  :deep(a.metaScore-auto-highlight) {
    color: rgb(238, 0, 0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
