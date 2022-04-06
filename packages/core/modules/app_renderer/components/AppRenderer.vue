<template>
  <div class="metaScore-app" :style="style">
    <media-player v-if="mediaSource" :source="mediaSource" type="video" />
    <template v-for="scenario in scenarios" :key="scenario.id">
      <scenario-component
        v-show="scenario.id === activeScenario"
        :component="scenario"
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
    const mediaStore = useModule("media_player").useStore();
    const componentsStore = useModule("app_components").useStore();
    return { store, mediaStore, componentsStore };
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
    mediaSource() {
      return this.mediaStore.source;
    },
    scenarios() {
      return this.componentsStore.getByType("Scenario");
    },
    activeScenario() {
      return this.componentsStore.activeScenario;
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
    }
  },
  beforeUnmount() {
    this.destroyResizeObserver();
  },
  methods: {
    setupResizeObserver() {
      if (this._resize_observer) {
        return;
      }

      const container = this.$el.parentNode;
      this.containerWidth = container.clientWidth;
      this.containerHeight = container.clientWidth;

      this._resize_observer = new ResizeObserver(
        debounce(() => {
          this.containerWidth = container.clientWidth;
          this.containerHeight = container.clientWidth;
        }, 500)
      );
      this._resize_observer.observe(container);
    },
    destroyResizeObserver() {
      if (this._resize_observer) {
        this._resize_observer.disconnect();
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
@import "normalize.css";

.metaScore-app {
  position: relative;
  width: 100%;
  height: 100%;
  font-size: 11px;
  font-family: Verdana, Arial, Helvetica, sans-serif;
  transform-origin: "top left";

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
