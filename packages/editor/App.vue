<i18n>
{
  "fr": {
    "components_library_title": "Composants",
    "assets_library_title": "Bibliothèque",
    "shared_assets_library_title": "Bibliothèque partagée",
    "component_form_title": "Attributs",
    "behaviors_form_title": "Comportements",
    "loading_indicator_label": "Chargement ...",
    "saving_indicator_label": "Sauvegarde en cours ...",
    "autosave": {
      "confirm_text": "Des données d'enregistrement automatique ont été trouvées pour cette application. Souhaitez-vous les récupérer ?",
      "submit_button": "Oui",
      "cancel_button": "Non",
    },
    "hotkey": {
      "group": "Général",
      "ctrl+h": "Afficher les raccourcis clavier",
    },
  },
  "en": {
    "components_library_title": "Components",
    "assets_library_title": "Library",
    "shared_assets_library_title": "Shared Library",
    "component_form_title": "Attributes",
    "behaviors_form_title": "Behaviors",
    "loading_indicator_label": "Loading...",
    "saving_indicator_label": "Saving...",
    "autosave": {
      "confirm_text": "Auto-save data were found for this application. Would you like to recover them?",
      "submit_button": "Yes",
      "cancel_button": "No",
    },
    "hotkey": {
      "group": "Général",
      "ctrl+h": "Show keyboard shortcuts",
    },
  },
}
</i18n>

<template>
  <div
    v-hotkey="hotkeys"
    :class="[
      'metaScore-editor',
      {
        preview,
        'app-title-focused': appTitleFocused,
        'libraries-expanded': librariesExpanded,
        'latest-revision': isLatestRevision,
      },
    ]"
    @contextmenu="onContextmenu"
  >
    <resizable-pane class="top">
      <nav class="main-menu">
        <div class="left">
          <styled-button
            :disabled="!dirty || !isLatestRevision"
            @click="onSaveClick"
          >
            <template #icon><save-icon /></template>
          </styled-button>
          <history-controller :disabled="!isLatestRevision" />
          <text-control
            v-model="appTitle"
            :lazy="true"
            :disabled="!isLatestRevision"
            class="app-title"
            @focusin="onAppTitleFocusin"
            @focusout="onAppTitleFocusout"
          />
        </div>
        <div class="center">
          <app-zoom-controller />
          <app-dimensions-controller />
          <app-preview-toggler :disabled="!isLatestRevision" />
        </div>
        <div class="right">
          <revision-selector
            v-model:active="activeRevision"
            :revisions="revisions"
            :latest="latestRevision"
            @restore="onRevisionSelectorRestore"
          />
        </div>
      </nav>
    </resizable-pane>

    <resizable-pane class="left" :right="{ collapse: true }">
      <tabs-container ref="libraries" v-model:activeTab="activeLibrariesTab">
        <tabs-item :title="$t('components_library_title')">
          <components-library />
        </tabs-item>
        <tabs-item :title="$t('assets_library_title')">
          <assets-library />
        </tabs-item>
        <tabs-item :title="$t('shared_assets_library_title')">
          <shared-assets-library @click:import="onSharedAssetsImportClick" />
        </tabs-item>
        <template v-if="activeLibrariesTab === 2" #tabs-end>
          <keep-alive>
            <shared-assets-toolbar />
          </keep-alive>
        </template>
      </tabs-container>
    </resizable-pane>

    <resizable-pane class="center">
      <app-preview
        :disable-component-interactions="disableComponentInteractions"
      />
    </resizable-pane>

    <resizable-pane class="right" :left="{ collapse: true }">
      <tabs-container>
        <tabs-item :title="$t('component_form_title')">
          <component-form
            :images="imageAssets"
            :first-level-components="firstLevelComponents"
          ></component-form>
        </tabs-item>
        <tabs-item :title="$t('behaviors_form_title')">
          <behaviors-form></behaviors-form>
        </tabs-item>
      </tabs-container>
    </resizable-pane>

    <resizable-pane class="bottom" :top="{ collapse: true }">
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
          :scenarios="scenarios"
          :active-id="activeScenario"
          @update:active-id="setActiveScenario"
          @add="onScnearioManagerAdd"
          @clone="onScnearioManagerClone"
          @delete="onScnearioManagerDelete"
        />
        <waveform-zoom-controller />
      </div>
    </resizable-pane>

    <progress-indicator v-if="loading" :text="$t('loading_indicator_label')" />
    <progress-indicator
      v-else-if="saving"
      :text="$t('saving_indicator_label')"
    />

    <confirm-dialog
      v-if="showAutoSaveRestoreConfirm"
      :submit-label="$t('autosave.submit_button')"
      :cancel-label="$t('autosave.cancel_button')"
      @submit="onAutoSaveRestoreSubmit"
      @cancel="onAutoSaveRestoreCancel"
    >
      <p>{{ $t("autosave.confirm_text") }}</p>
    </confirm-dialog>
    <auto-save-indicator v-else :enabled="isLatestRevision" />

    <hotkey-list v-if="showHotkeyList" @close="showHotkeyList = false" />

    <context-menu
      v-model:show="showContextmenu"
      :position="contextmenuPosition"
    >
      <template #footer>
        {{ `metaScore Editor ${version}` }}
      </template>
    </context-menu>
  </div>
</template>

<script>
import { computed, unref, readonly } from "vue";
import useStore from "./store";
import { useModule } from "@metascore-library/core/services/module-manager";
import packageInfo from "../../package.json";
import SaveIcon from "./assets/icons/save.svg?inline";

export default {
  components: {
    SaveIcon,
  },
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
    const {
      getComponentsByType,
      getComponent,
      getComponentChildren,
      activeScenario,
      setActiveScenario,
      createComponent,
      addComponent,
      deleteComponent,
    } = useModule("app_components");
    const { getAssetsByType, addAsset } = useModule("assets_library");
    const { preview } = useModule("app_preview");
    const {
      maxScale: maxWaveformScale,
      scale: waveformScale,
      offset: waveformOffset,
      load: loadWaveform,
    } = useModule("waveform");

    const { source: mediaSource, duration: mediaDuration } =
      useModule("media_player");

    const { recordingCursorKeyframes, editingTextContent } =
      useModule("component_form");
    const disableComponentInteractions = computed(
      () => unref(recordingCursorKeyframes) || unref(editingTextContent)
    );

    const { isDataAvailable: isAutoSaveDataAvailable } = useModule("auto_save");

    return {
      store,
      getComponentsByType,
      getComponent,
      getComponentChildren,
      activeScenario,
      setActiveScenario,
      createComponent,
      addComponent,
      deleteComponent,
      getAssetsByType,
      addAsset,
      preview,
      maxWaveformScale,
      waveformScale,
      waveformOffset,
      loadWaveform,
      mediaSource,
      mediaDuration,
      disableComponentInteractions,
      isAutoSaveDataAvailable,
    };
  },
  data() {
    return {
      version: packageInfo.version,
      modalsTarget: null,
      appTitleFocused: false,
      activeLibrariesTab: 0,
      librariesExpanded: false,
      showAutoSaveRestoreConfirm: false,
      showHotkeyList: false,
      showContextmenu: false,
      contextmenuPosition: { x: 0, y: 0 },
    };
  },
  computed: {
    loading() {
      return this.store.loading;
    },
    saving() {
      return this.store.saving;
    },
    dirty() {
      return this.store.isDirty();
    },
    appTitle: {
      get() {
        return this.store.appTitle;
      },
      set(value) {
        this.store.setAppTitle(value);
      },
    },
    timelineScale() {
      return this.maxWaveformScale / this.waveformScale;
    },
    timelineOffset() {
      return this.waveformOffset.start / this.mediaDuration;
    },
    imageAssets() {
      return this.getAssetsByType("image").map(readonly);
    },
    scenarios() {
      return this.getComponentsByType("Scenario");
    },
    firstLevelComponents() {
      const scenario = this.activeScenario
        ? this.getComponent("Scenario", this.activeScenario)
        : null;
      return scenario ? this.getComponentChildren(scenario) : [];
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
    isLatestRevision() {
      return this.activeRevision === this.latestRevision;
    },
    hotkeys() {
      return {
        group: this.$t("hotkey.group"),
        keys: {
          // @todo: fix hotkeys code handling for ?
          "ctrl+h": {
            handler: () => {
              this.showHotkeyList = true;
            },
            description: this.$t("hotkey.ctrl+h"),
          },
        },
      };
    },
  },
  watch: {
    mediaSource(source) {
      if (source) {
        this.loadWaveform(source);
      }
    },
    activeLibrariesTab(index) {
      const tabs = this.$refs.libraries.$el.querySelector(".tabs-nav");

      if (index === 2) {
        const { width } = tabs.getBoundingClientRect();
        tabs.style.maxWidth = `${width}px`;
        this.librariesExpanded = true;
      } else {
        tabs.style.maxWidth = null;
        this.librariesExpanded = false;
      }
    },
  },
  async mounted() {
    this.modalsTarget = this.$el;

    const hasAutoSaveData = await this.isAutoSaveDataAvailable();
    if (hasAutoSaveData) {
      this.showAutoSaveRestoreConfirm = true;
    } else {
      await this.store.load(this.url);
    }
  },
  methods: {
    onSaveClick() {
      this.store.save(this.url).catch((e) => {
        // @todo: handle errors
        console.error(e);
      });
    },
    onAppTitleFocusin() {
      this.appTitleFocused = true;
    },
    onAppTitleFocusout() {
      this.appTitleFocused = false;
    },
    onRevisionSelectorRestore(vid) {
      this.store.restoreRevision(this.url, vid).catch((e) => {
        // @todo: handle errors
        console.error(e);
      });
    },
    async onSharedAssetsImportClick(asset) {
      this.activeLibrariesTab = 1;
      this.addAsset(asset);
    },
    async onScnearioManagerAdd(data) {
      const scenario = await this.createComponent({
        ...data,
        type: "Scenario",
      });
      await this.addComponent(scenario);
      this.setActiveScenario(scenario.id);
    },
    onScnearioManagerClone({ scenario, data }) {
      const clone = this.store.cloneComponent(scenario, data);
      this.setActiveScenario(clone.id);
    },
    onScnearioManagerDelete({ scenario }) {
      this.deleteComponent(scenario);
    },
    onAutoSaveRestoreSubmit() {
      this.showAutoSaveRestoreConfirm = false;
      this.store.restoreAutoSaveData();
    },
    onAutoSaveRestoreCancel() {
      this.showAutoSaveRestoreConfirm = false;
      this.store.deleteAutoSaveData();

      this.store.load(this.url);
    },
    onContextmenu(evt) {
      // Show the native menu if the Ctrl key is down.
      if (evt.ctrlKey) {
        return;
      }

      this.contextmenuPosition = {
        x: evt.pageX,
        y: evt.pageY,
      };
      this.showContextmenu = true;

      evt.preventDefault();
    },
  },
};
</script>

<style lang="scss" scoped>
@import "normalize.css";
@import "source-sans/source-sans-3VF.css";
@import "./scss/variables.scss";

.metaScore-editor {
  position: relative;
  height: 100%;
  display: grid;
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
  font-size: 14px;
  font-family: "Source Sans 3 VF", "Source Sans Variable", "Source Sans Pro",
    sans-serif;

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

  &.preview,
  &:not(.latest-revision) {
    > .left,
    > .right {
      display: none;
    }

    > .bottom {
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

  .auto-save-indicator {
    position: absolute;
    left: 50%;
    bottom: 0;
    border-radius: 0.5em 0.5em 0 0;
    box-shadow: 0 0 0.5em 0 rgba(0, 0, 0, 0.5);
    transform: translateX(-50%);
    opacity: 0.75;
    z-index: 1;
  }
}
</style>
