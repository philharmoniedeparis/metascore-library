<i18n>
{
  "fr": {
    "loading_indicator_label": "Chargement ...",
  },
  "en": {
    "loading_indicator_label": "Loading...",
  },
}
</i18n>

<template>
  <context-menu :class="['metaScore-editor', classes]">
    <resizable-pane class="top">
      <nav class="main-menu">
        <div class="left">
          <history-controller />
          <text-control
            v-model="appTitle"
            :lazy="true"
            class="app-title"
            @focusin="onAppTitleFocusin"
            @focusout="onAppTitleFocusout"
          />
        </div>
        <div class="center">
          <player-zoom-controller />
          <player-dimensions-controller />
          <player-preview-toggler />
        </div>
        <div class="right">
          <revision-selector
            v-model:active="activeRevision"
            :revisions="revisions"
            :latest="latestRevision"
          />
        </div>
      </nav>
    </resizable-pane>

    <resizable-pane class="left" :right="{ collapse: true }">
      <tabs-container ref="libraries" v-model:activeTab="activeLibrariesTab">
        <tabs-item title="Components"><components-library /></tabs-item>
        <tabs-item title="Library">
          <assets-library v-bind="configs.modules?.assets_library" />
        </tabs-item>
        <tabs-item title="Shared Library">
          <shared-assets-library
            v-bind="configs.modules?.shared_assets_library"
            @click:import="onSharedAssetsImportClick"
          />
        </tabs-item>
        <template v-if="activeLibrariesTab === 2" #tabs-right>
          <keep-alive>
            <shared-assets-toolbar />
          </keep-alive>
        </template>
      </tabs-container>
    </resizable-pane>

    <resizable-pane class="center">
      <player-preview
        :disable-component-interactions="disableComponentInteractions"
      />
    </resizable-pane>

    <resizable-pane class="right" :left="{ collapse: true }">
      <component-form
        :images="imageAssets"
        v-bind="configs.modules?.component_form"
      ></component-form>
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
        <scenario-manager
          v-model:activeId="activeScenario"
          :scenarios="scenarios"
          @add="onScnearioManagerAdd"
          @clone="onScnearioManagerClone"
          @delete="onScnearioManagerDelete"
        />
        <waveform-zoom-controller />
      </div>
    </resizable-pane>

    <progress-indicator v-if="loading" :text="$t('loading_indicator_label')" />

    <template #footer>
      {{ `metaScore Editor ${version}` }}
    </template>
  </context-menu>
</template>

<script>
import { computed, readonly } from "vue";
import useStore from "./store";
import { setDefaults as setAjaxDefaults } from "@metascore-library/core/services/ajax";
import { useModule } from "@metascore-library/core/services/module-manager";
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
    configs: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  setup() {
    const store = useStore();
    const componentsStore = useModule("app_components").useStore();
    const assetsStore = useModule("assets_library").useStore();
    const mediaStore = useModule("media_player").useStore();
    const playerPreviewStore = useModule("player_preview").useStore();
    const waveformStore = useModule("waveform").useStore();
    return {
      store,
      componentsStore,
      assetsStore,
      mediaStore,
      playerPreviewStore,
      waveformStore,
    };
  },
  data() {
    return {
      modalsTarget: null,
      version: packageInfo.version,
      classes: {},
      activeLibrariesTab: 0,
      cursorKeyframesRecording: false,
    };
  },
  computed: {
    loading() {
      return this.store.loading;
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
      return this.store.mediaSource;
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
    disableComponentInteractions() {
      return this.cursorKeyframesRecording;
    },
    imageAssets() {
      return this.assetsStore.filterByType("image").map(readonly);
    },
    scenarios() {
      return this.store.scenarios;
    },
    activeScenario: {
      get() {
        return this.componentsStore.activeScenario;
      },
      set(value) {
        this.componentsStore.activeScenario = value;
      },
    },
    revisions() {
      return this.store.revisions;
    },
    latestRevision() {
      return this.store.latestRevision;
    },
    activeRevision: {
      get() {
        return this.store.activeRevision;
      },
      set(value) {
        this.store.loadRevision(value);
      },
    },
  },
  watch: {
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
    activeLibrariesTab(index) {
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
  beforeMount() {
    if (this.configs.services?.ajax) {
      setAjaxDefaults(this.configs.services.ajax);
    }
  },
  mounted() {
    this.modalsTarget = this.$el;

    this.$eventBus.on("component_form:cursorkeyframesrecordstart", () => {
      this.cursorKeyframesRecording = true;
    });
    this.$eventBus.on("component_form:cursorkeyframesrecordstop", () => {
      this.cursorKeyframesRecording = false;
    });

    this.store.load(this.url);
  },
  methods: {
    onAppTitleFocusin() {
      this.classes["app-title-focused"] = true;
    },
    onAppTitleFocusout() {
      delete this.classes["app-title-focused"];
    },
    onSharedAssetsImportClick(asset) {
      this.activeLibrariesTab = 1;
      this.assetsStore.add(asset);
    },
    onScnearioManagerAdd(data) {
      const scenario = this.store.addComponent(
        this.store.createComponent({
          ...data,
          type: "Scenario",
        })
      );
      this.activeScenario = scenario.id;
    },
    onScnearioManagerClone({ scenario, data }) {
      const clone = this.store.cloneComponent(scenario, data);
      this.activeScenario = clone.id;
    },
    onScnearioManagerDelete(scenario) {
      this.store.deleteComponent(scenario);
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
    background: $darkgray;

    .main-menu {
      display: flex;
      height: 2.5em;
      padding: 0.25em 1em;
      justify-content: flex-start;
      gap: 1em;
      box-sizing: border-box;

      ::v-deep(button) {
        padding-top: 0;
        padding-bottom: 0;
        align-self: stretch;
      }

      ::v-deep(.form-group) {
        margin: 0;
        justify-content: center;

        input:not(:focus, :hover),
        select:not(:focus, :hover) {
          background-color: transparent;
          border-color: transparent;
        }
      }

      > .left,
      > .center,
      > .right {
        display: flex;
        flex-direction: row;
        flex: 1;
        justify-content: flex-start;
        align-items: stretch;
        gap: 1em;
      }

      > .center {
        justify-content: center;
      }

      > .right {
        justify-content: flex-end;
      }

      .app-title {
        flex: 1 1 auto;

        ::v-deep(input) {
          &:not(:focus) {
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
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
    min-height: 12.5em;
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
      > .left > :not(.app-title),
      > .center,
      > .right {
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
