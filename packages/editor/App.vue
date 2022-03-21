<template>
  <context-menu :class="['metaScore-editor', classes]">
    <resizable-pane class="top">
      <nav class="main-menu">
        <history-controller />
        <text-control
          v-model="appTitle"
          :lazy="true"
          class="app-title"
          @focusin="onAppTitleFocusin"
          @focusout="onAppTitleFocusout"
        />
        <player-zoom-controller />
        <player-dimensions-controller />
        <player-preview-toggler />
      </nav>
    </resizable-pane>

    <resizable-pane class="left" :right="{ collapse: true }">
      <tabs-container ref="libraries" v-model="selectedLibrariesTab">
        <tabs-item title="Components"><components-library /></tabs-item>
        <tabs-item title="Library"><assets-library /></tabs-item>
        <tabs-item title="Shared Library">
          <shared-assets-library
            url="./assets/shared-assets.json"
            @click:import="onSharedAssetsImportClick"
          />
        </tabs-item>
        <template v-if="selectedLibrariesTab === 2" #tabs-right>
          <keep-alive>
            <shared-assets-toolbar />
          </keep-alive>
        </template>
      </tabs-container>
    </resizable-pane>

    <resizable-pane class="center">
      <player-preview />
    </resizable-pane>

    <resizable-pane class="right" :left="{ collapse: true }">
      <component-form></component-form>
    </resizable-pane>

    <resizable-pane
      :class="['bottom', { collapsed: preview }]"
      :top="{ collapse: true }"
    >
      <div class="top">
        <playback-time />
        <buffer-indicator />
        <waveform-overview />
      </div>
      <div class="middle">
        <div class="sticky-top">
          <playback-controller />
          <media-selector />
          <waveform-zoom />
        </div>
        <components-timeline :scale="timelineScale" :offset="timelineOffset" />
      </div>
      <div class="bottom">
        <scenario-manager />
        <waveform-zoom-controller />
      </div>
    </resizable-pane>

    <template #footer>
      {{ `metaScore Editor ${version}` }}
    </template>
  </context-menu>
</template>

<script>
import useStore from "./store";
import { useModule } from "@metascore-library/core/services/module-manager";
import { computed } from "vue";
import packageInfo from "../../package.json";

export default {
  provide() {
    return {
      modalsTarget: computed(() => this.modalsTarget),
    };
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
  setup() {
    const store = useStore();
    const mediaStore = useModule("media").useStore();
    const playerPreviewStore = useModule("player_preview").useStore();
    const waveformStore = useModule("waveform").useStore();
    const assetsStore = useModule("assets_library").useStore();
    const historyStore = useModule("history").useStore();
    return {
      store,
      mediaStore,
      playerPreviewStore,
      waveformStore,
      assetsStore,
      historyStore,
    };
  },
  data() {
    return {
      modalsTarget: null,
      version: packageInfo.version,
      classes: {},
      selectedLibrariesTab: 0,
    };
  },
  computed: {
    ready() {
      return this.store.ready;
    },
    appTitle: {
      get() {
        return this.store.appTitle;
      },
      set(value) {
        this.store.setAppTitle(value);
      },
    },
    mediaSource() {
      return this.mediaStore.source;
    },
    timelineScale() {
      return this.waveformStore.maxScale / this.waveformStore.scale;
    },
    timelineOffset() {
      return this.waveformStore.offset.start / this.mediaStore.duration;
    },
    preview() {
      return this.playerPreviewStore.preview;
    },
  },
  watch: {
    ready(value) {
      if (value) {
        this.setupHistoryTracking();
      } else {
        this.destroyHistoryTracking();
      }
    },
    mediaSource(source) {
      if (source) {
        this.waveformStore.load(source);
      }
    },
    preview(value) {
      if (value) {
        this.classes["preview"] = true;
      } else {
        delete this.classes["preview"];
      }
    },
    selectedLibrariesTab(index) {
      const tabs = this.$refs.libraries.$el.querySelector(".tabs-nav");

      if (index === 2) {
        const { width } = tabs.getBoundingClientRect();
        tabs.style.maxWidth = `${width}px`;
        this.classes["libraries-expanded"] = true;
      } else {
        tabs.style.maxWidth = null;
        delete this.classes["libraries-expanded"];
      }
    },
  },
  mounted() {
    this.modalsTarget = this.$el;
    this.store.load(this.url);
  },
  beforeUnmount() {
    this.destroyHistoryTracking();
  },
  methods: {
    onAppTitleFocusin() {
      this.classes["app-title-focused"] = true;
    },
    onAppTitleFocusout() {
      delete this.classes["app-title-focused"];
    },
    onSharedAssetsImportClick(asset) {
      this.selectedLibrariesTab = 1;
      this.assetsStore.add(asset);
    },
    setupHistoryTracking() {
      this.historyStore.track(this.store, ["setAppTitle"]);
      this.historyStore.track(this.mediaStore, ["setSource"]);
    },
    destroyHistoryTracking() {
      this.historyStore.untrackAll();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "normalize.css";
@import "source-sans/source-sans-3VF.css";
@import "./scss/variables.scss";

.metaScore-editor {
  font-size: 14px;
  font-family: "Source Sans 3 VF", "Source Sans Variable", "Source Sans Pro",
    sans-serif;
  display: grid;
  height: 100%;
  margin: 0;
  padding: 0;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: min-content 1fr auto;
  grid-template-areas:
    "top top top"
    "left center right"
    "bottom bottom bottom";
  align-items: stretch;
  flex-wrap: nowrap;

  &,
  ::v-deep(*) {
    scrollbar-color: $scrollbar-thumb-color $scrollbar-track-color;
    scrollbar-width: thin;

    ::-webkit-scrollbar {
      appearance: none;
      background-color: $scrollbar-track-color;
      width: $scrollbar-width;
      height: $scrollbar-thumb-min-height;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 0;
      background-color: $scrollbar-thumb-color;

      &:active,
      &:hover {
        background-color: $scrollbar-thumb-active-color;
      }
    }
  }

  ::v-deep(.sr-only) {
    @include sr-only;
  }

  ::v-deep(button) {
    background: none;
    border: none;
    opacity: 0.5;
    cursor: pointer;

    &:hover {
      opacity: 1;
    }
  }

  ::v-deep(input, select) {
    font-family: inherit;
    color: inherit;
  }

  ::v-deep(.icon) {
    display: block;
  }

  > .top {
    grid-area: top;
    height: 2.5em;
    background: $darkgray;

    .main-menu {
      display: flex;
      height: 100%;
      padding: 0 1em;
      justify-content: flex-start;
      align-items: center;

      .app-title {
        flex: 1 1 auto;
      }

      ::v-deep(.form-group) {
        margin: 0;

        &:not(:focus, :hover) {
          input,
          select {
            background-color: transparent;
            border-color: transparent;
          }
        }
      }
    }
  }

  > .left {
    grid-area: left;
    width: 20em;
    min-width: 15em;
    max-width: 25vw;
  }

  > .center {
    grid-area: center;
  }

  > .right {
    grid-area: right;
    width: 20em;
    min-width: 15em;
    max-width: 25vw;
  }

  > .bottom {
    grid-area: bottom;
    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;
    height: 300px;
    min-height: 150px;
    max-height: 75vh;
    overflow-y: hidden;

    > .top {
      display: grid;
      grid-template-columns: $controller-left-width 1fr;
      grid-template-rows: 15% 1fr;
      flex: 0 0 $controller-top-height;
      background: $mediumgray;
      border-bottom: 2px solid $darkgray;
      z-index: 1;

      .playback-time {
        display: flex;
        grid-area: 1 / 1 / span 2 / 1;
        box-sizing: border-box;
        border-right: 2px solid $darkgray;

        ::v-deep(input) {
          border-radius: 0;
        }
      }

      .buffer-indicator {
        grid-area: 1 / 2;
        box-sizing: border-box;
      }

      .waveform-overview {
        display: flex;
        flex-direction: column;
        grid-area: 2 / 2;
        box-sizing: border-box;
      }
    }

    > .middle {
      flex: 1 1 auto;
      overflow: hidden;
      position: relative;
      overflow-y: scroll;
      scroll-behavior: smooth;
      scroll-padding-top: $controller-bottom-sticky-top-height;

      > .sticky-top {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        height: $controller-bottom-sticky-top-height;
        display: grid;
        grid-template-columns: $controller-left-width 1fr;
        grid-template-rows: 1fr auto;
        background: $lightgray;
        border-bottom: 2px solid $darkgray;
        z-index: 4;

        .playback-controller {
          grid-area: 1 / 1;
          box-sizing: border-box;
          border-right: 2px solid $darkgray;
        }

        .media-selector {
          grid-area: 2 / 1;
          padding: 0.25em 0.5em;
          box-sizing: border-box;
          border-right: 2px solid $darkgray;
        }

        .waveform--zoom {
          grid-area: 1 / 2 / span 2 / auto;
        }
      }
    }

    > .bottom {
      display: flex;
      flex-direction: row;
      flex: 0 0 $controller-bottom-sticky-bottom-height;
      background: $mediumgray;
      border-top: 1px solid $darkgray;
      z-index: 1;

      .scenario-manager {
        flex: 1 1 auto;
      }

      .waveform--zoom-controller {
        flex: 0 0 auto;
        background: $darkgray;
      }
    }

    &.collapsed {
      display: grid;
      height: auto !important;
      min-height: 0;
      grid-template-columns: 2.5em 9.5em 1fr;
      grid-template-rows: 15% 1fr;
      z-index: 1;

      > .top {
        display: contents;

        .playback-time {
          grid-area: 1 / 2 / span 2 / 2;
        }
        .buffer-indicator {
          grid-area: 1 / 3;
        }
        .waveform-overview {
          grid-area: 2 / 3;
        }
      }

      > .middle {
        display: contents;

        .sticky-top {
          display: contents;

          .playback-controller {
            grid-area: 1 / 1 / span 2 / 1;
            ::v-deep(.rewind) {
              display: none;
            }

            ::v-deep(.play),
            ::v-deep(.pause) {
              width: 100%;
              height: 100%;
              margin-right: 0;
              border-radius: 0;
              box-shadow: none;

              .icon {
                width: 50%;
              }
            }
          }

          .media-selector {
            display: none;
          }
        }
      }

      .timeline,
      .waveform--zoom,
      > .bottom {
        display: none;
      }
    }
  }

  ::v-deep(.context-menu) {
    .footer {
      opacity: 0.5;
    }
  }

  &.app-title-focused {
    .main-menu {
      > :not(.app-title) {
        display: none;
      }
    }
  }

  &.libraries-expanded {
    grid-template-columns: auto;
    grid-template-rows: min-content auto;
    grid-template-areas: "top" "left";

    > .left {
      width: auto !important;
      max-width: none;
      padding: 0;

      ::v-deep(.tabs-nav) {
        border-color: transparent;
      }
    }

    > .center,
    > .right,
    > .bottom {
      display: none;
    }
  }

  &.preview {
    > .left,
    > .right {
      display: none;
    }
  }
}
</style>
