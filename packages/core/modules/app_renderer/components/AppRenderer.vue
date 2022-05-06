<template>
  <div class="metaScore-app" :style="style">
    <media-player v-if="mediaSource" :source="mediaSource" type="video" />
    <template v-for="scenario in scenarios" :key="scenario.id">
      <scenario-component
        v-show="scenario.id === activeScenario"
        :component="scenario"
        @action="onComponentAction"
      />
    </template>
  </div>
</template>

<script>
import { debounce } from "lodash";
import { useModule } from "@metascore-library/core/services/module-manager";
import useStore from "../store";

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
      showComponent,
      hideComponent,
      toggleComponent,
    } = useModule("app_components");
    const {
      source: mediaSource,
      play: playMedia,
      pause: pauseMedia,
      stop: stopMedia,
      seekTo: seekMediaTo,
    } = useModule("media_player");
    const { addCuepoint, removeCuepoint } = useModule("media_cuepoints");
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
      showComponent,
      hideComponent,
      toggleComponent,
      addCuepoint,
      removeCuepoint,
    };
  },
  data() {
    return {
      containerWidth: null,
      containerHeight: null,
      sheet: null,
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
      if (!this.sheet) {
        const doc = this.$el.ownerDocument;
        this.sheet = doc.createElement("style");
        doc.head.appendChild(this.sheet);
      }

      this.sheet.innerHTML = value ?? "";
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
          if ("inTime" in args || "outTime" in args) {
            const { inTime = null, outTime = null, scenario = null } = args;
            const cuepoint_config = {
              startTime: inTime,
              endTime: outTime,
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

            this.addCuepoint(cuepoint_config);

            if (inTime !== null) {
              this.seekMediaTo(inTime);
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
          {
            if ("block" in args && "index" in args) {
              const block = this.getComponentsByType("Block").find(
                (c) => c.name === args.block
              );
              if (block) {
                // @todo: implement
              }
            }
          }
          break;

        case "showBlock":
          {
            if ("name" in args) {
              const block = this.getComponentsByType("Block").find(
                (c) => c.name === args.name
              );
              if (block) this.showComponent(block);
            }
          }
          break;

        case "hideBlock":
          {
            if ("name" in args) {
              const block = this.getComponentsByType("Block").find(
                (c) => c.name === args.name
              );
              if (block) this.hideComponent(block);
            }
          }
          break;

        case "toggleBlock":
          {
            if ("name" in args) {
              const block = this.getComponentsByType("Block").find(
                (c) => c.name === args.name
              );
              if (block) this.toggleComponent(block);
            }
          }
          break;

        case "scenario":
          {
            if ("id" in args) {
              const scenario = this.getComponent("Scenario", args.id);
              if (scenario) this.setActiveScenario(scenario.id);
            }
          }
          break;

        case "enterFullscreen":
          this.$el.requestFullscreen();
          break;

        case "exitFullscreen":
          document.exitFullscreen();
          break;

        case "toggleFullscreen":
          {
            if (document.fullscreenElement !== this.$el) {
              this.$el.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }
          break;
      }
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
  background: $white;

  ::v-deep(.sr-only) {
    @include sr-only;
  }

  ::v-deep(button) {
    background: none;
    border: none;
    cursor: pointer;
  }

  > ::v-deep(.media-player) {
    display: none;
  }
}
</style>
