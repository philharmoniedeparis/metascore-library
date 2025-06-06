<i18n>
{
  "fr": {
    "save": "Enregistrer",
    "revert": "Revenir à la version précédente",
    "app_title": "Titre de l'application",
    "preferences": "Préférences",
    "scenario_default_title": "Scénario 1",
    "components_library_title": "Composants",
    "assets_library_title": "Bibliothèque",
    "shared_assets_library_title": "Bibliothèque partagée",
    "component_form_title": "Attributs",
    "behaviors_form_title": "Comportements",
    "loading_indicator_label": "Chargement ...",
    "saving_indicator_label": "Sauvegarde en cours ...",
    "revert_confirm": {
      "confirm_text": "Êtes-vous sûr de vouloir revenir à la dernière version enregistrée ? Toutes les données non sauvegardées seront perdues.",
      "submit_button": "Oui",
      "cancel_button": "Non",
    },
    "load_revision_confirm": {
      "confirm_text": "Êtes-vous sûr de vouloir charger une ancienne révision ? Toutes les données non sauvegardées seront perdues.",
      "submit_button": "Oui",
      "cancel_button": "Non",
    },
    "autosave_confirm": {
      "confirm_text": "Des données d’enregistrement automatique ont été trouvées pour cette application. Souhaitez-vous les récupérer ?",
      "submit_button": "Oui",
      "cancel_button": "Non",
    },
    "hotkey": {
      "group": "Général",
      "mod+s": "Enregistrer",
      "mod+r": "Revenir à la version précédente",
      "mod+p": "Modifier les préférences",
      "mod+h": "Afficher les raccourcis clavier",
    },
    "unload_dirty": "Les données non sauvegardées seront perdues.",
  },
  "en": {
    "save": "Save",
    "revert": "Revert",
    "app_title": "Application's title",
    "preferences": "Preferences",
    "scenario_default_title": "Scenario 1",
    "components_library_title": "Components",
    "assets_library_title": "Library",
    "shared_assets_library_title": "Shared Library",
    "component_form_title": "Attributes",
    "behaviors_form_title": "Behaviors",
    "loading_indicator_label": "Loading...",
    "saving_indicator_label": "Saving...",
    "revert_confirm": {
      "confirm_text": "Are you sure you want to revert back to the last saved version? Any unsaved data will be lost.",
      "submit_button": "Yes",
      "cancel_button": "No",
    },
    "load_revision_confirm": {
      "confirm_text": "Are you sure you want to load an old revision ? Any unsaved data will be lost.",
      "submit_button": "Yes",
      "cancel_button": "No",
    },
    "autosave_confirm": {
      "confirm_text": "Auto-save data were found for this application. Would you like to recover them?",
      "submit_button": "Yes",
      "cancel_button": "No",
    },
    "hotkey": {
      "group": "General",
      "mod+s": "Save",
      "mod+r": "Revert",
      "mod+p": "Edit preferences",
      "mod+h": "Show keyboard shortcuts",
    },
    "unload_dirty": "Any unsaved data will be lost.",
  },
}
</i18n>

<template>
  <div
    v-hotkey.prevent="hotkeys"
    :class="[
      'metaScore-editor',
      {
        loading,
        preview,
        'preview-persistant': previewPersistant,
        'app-title-focused': appTitleFocused,
        'libraries-expanded': librariesExpanded,
        'behaviors-open': behaviorsOpen,
        'latest-revision': isLatestRevision,
      },
    ]"
    @contextmenu="onContextmenu"
  >
    <div class="top">
      <nav class="main-menu">
        <div class="left">
          <base-button
            v-tooltip
            :disabled="preview || !dirty || !isLatestRevision"
            class="save"
            :title="`${$t('save')} [${formatHotkey('mod+s')}]`"
            @click="save"
          >
            <template #icon><save-icon /></template>
          </base-button>
          <base-button
            v-tooltip
            :disabled="preview || !dirty || !isLatestRevision"
            class="revert"
            :title="`${$t('revert')} [${formatHotkey('mod+r')}]`"
            @click="revert"
          >
            <template #icon><revert-icon /></template>
          </base-button>
          <history-controller :disabled="preview || !isLatestRevision" />
          <text-control
            v-model="appTitle"
            v-tooltip
            :lazy="true"
            :title="$t('app_title')"
            :disabled="preview || !isLatestRevision"
            class="app-title"
            @focusin="onAppTitleFocusin"
            @focusout="onAppTitleFocusout"
          />
        </div>
        <div class="center">
          <app-zoom-controller :disabled="preview && !previewPersistant" />
          <app-preview-toggler :disabled="!isLatestRevision" />
          <app-dimensions-controller :disabled="preview" />
        </div>
        <div class="right">
          <revision-selector
            :active="activeRevision"
            :revisions="revisions"
            :latest="latestRevision"
            :disabled="preview"
            @update:active="loadRevision"
            @restore="onRevisionSelectorRestore"
          />
          <base-button
            v-tooltip
            :disabled="preview || !isLatestRevision"
            class="user-preferences"
            :title="`${$t('preferences')} [${formatHotkey('mod+p')}]`"
            @click="showPreferencesForm = true"
          >
            <template #icon><user-preferences-icon /></template>
          </base-button>
        </div>
      </nav>
    </div>

    <resizable-pane class="left" :right="{ collapse: true }">
      <tabs-container ref="libraries" v-model:active-tab="activeLibrariesTab">
        <tabs-item :title="$t('components_library_title')" :keep-alive="true">
          <components-library />
        </tabs-item>
        <tabs-item :title="$t('assets_library_title')" :keep-alive="true">
          <assets-library />
        </tabs-item>
        <tabs-item
          :title="$t('shared_assets_library_title')"
          :keep-alive="true"
        >
          <shared-assets-library @click:import="onSharedAssetsImportClick" />
        </tabs-item>
        <template v-if="activeLibrariesTab === 2" #tabs-end>
          <shared-assets-toolbar />
        </template>
      </tabs-container>
    </resizable-pane>

    <div class="center">
      <app-preview
        :grid-color="userPreferences?.['workspace.grid-color']"
        :grid-step="userPreferences?.['workspace.grid-step']"
        :snap-to-grid="userPreferences?.['workspace.snap-to-grid']"
        :snap-to-siblings="userPreferences?.['workspace.snap-to-siblings']"
        :snap-range="userPreferences?.['workspace.snap-range']"
        :disable-component-interactions="disableComponentInteractions"
      />
      <components-breadcrumb />
    </div>

    <resizable-pane class="right" :left="{ collapse: true }">
      <tabs-container v-model:active-tab="activeFormsTab">
        <tabs-item :title="$t('component_form_title')">
          <component-form
            :assets="assets"
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
        <scenario-manager />
        <waveform-zoom-controller />
      </div>
    </resizable-pane>

    <progress-indicator v-if="loading" :text="$t('loading_indicator_label')" />
    <progress-indicator
      v-else-if="saving"
      :text="$t('saving_indicator_label')"
    />

    <confirm-dialog
      v-if="showRevertConfirm"
      :submit-label="$t('revert_confirm.submit_button')"
      :cancel-label="$t('revert_confirm.cancel_button')"
      @submit="onRevertSubmit"
      @cancel="onRevertCancel"
    >
      <p>{{ $t("revert_confirm.confirm_text") }}</p>
    </confirm-dialog>

    <confirm-dialog
      v-if="showLoadRevisionConfirm"
      :submit-label="$t('load_revision_confirm.submit_button')"
      :cancel-label="$t('load_revision_confirm.cancel_button')"
      @submit="onLoadRevisionSubmit"
      @cancel="onLoadRevisionCancel"
    >
      <p>{{ $t("revert_confirm.confirm_text") }}</p>
    </confirm-dialog>

    <confirm-dialog
      v-if="showAutoSaveRestoreConfirm"
      :submit-label="$t('autosave_confirm.submit_button')"
      :cancel-label="$t('autosave_confirm.cancel_button')"
      @submit="onAutoSaveRestoreSubmit"
      @cancel="onAutoSaveRestoreCancel"
    >
      <p>{{ $t("autosave_confirm.confirm_text") }}</p>
    </confirm-dialog>
    <auto-save-indicator v-else :enabled="isLatestRevision" />

    <user-preferences-form
      v-if="showPreferencesForm"
      @submit="onPreferencesSubmit"
      @close="onPreferencesClose"
    />

    <hotkey-list v-if="showHotkeyList" @close="showHotkeyList = false" />

    <context-menu
      v-model:show="showContextmenu"
      :position="contextmenuPosition"
    >
      <template #footer>
        {{ `metaScore Editor ${version}` }}
      </template>
    </context-menu>

    <intro-tour v-if="!loading && isLatestRevision" :context="$el" />
  </div>
</template>

<script>
import { computed, unref } from "vue";
import useStore from "./store";
import { useModule } from "@core/services/module-manager";
import packageInfo from "../../package.json";
import SaveIcon from "./assets/icons/save.svg?inline";
import RevertIcon from "./assets/icons/revert.svg?inline";
import UserPreferencesIcon from "./assets/icons/user-preferences.svg?inline";

export default {
  components: {
    SaveIcon,
    RevertIcon,
    UserPreferencesIcon,
  },
  provide() {
    return {
      overlaysTarget: computed(() => this.overlaysTarget),
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
      createComponent,
      addComponent,
      deleteComponent,
      cloneComponent,
    } = useModule("app_components");

    const { assets, addAsset } = useModule("assets_manager");

    const { preview, previewPersistant } = useModule("app_preview");

    const { ready: appRendererReady } = useModule("app_renderer");

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

    const { data: userPreferences } = useModule("user_preferences");

    const { isDataAvailable: isAutoSaveDataAvailable } = useModule("auto_save");

    const { format: formatHotkey } = useModule("hotkey");

    const { install: installTooltip } = useModule("tooltip");

    return {
      store,
      getComponentsByType,
      getComponent,
      getComponentChildren,
      activeScenario,
      createComponent,
      addComponent,
      deleteComponent,
      cloneComponent,
      assets,
      addAsset,
      preview,
      previewPersistant,
      appRendererReady,
      maxWaveformScale,
      waveformScale,
      waveformOffset,
      loadWaveform,
      mediaSource,
      mediaDuration,
      disableComponentInteractions,
      userPreferences,
      isAutoSaveDataAvailable,
      formatHotkey,
      installTooltip,
    };
  },
  data() {
    return {
      version: packageInfo.version,
      overlaysTarget: null,
      appTitleFocused: false,
      activeLibrariesTab: 0,
      librariesExpanded: false,
      activeFormsTab: 0,
      behaviorsOpen: false,
      showRevertConfirm: false,
      showLoadRevisionConfirm: false,
      showAutoSaveRestoreConfirm: false,
      showPreferencesForm: false,
      showHotkeyList: false,
      showContextmenu: false,
      contextmenuPosition: { x: 0, y: 0 },
    };
  },
  computed: {
    loading() {
      return this.store.loading || !this.appRendererReady;
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
    activeRevision() {
      return this.store.activeRevision;
    },
    isLatestRevision() {
      return this.activeRevision === this.latestRevision;
    },
    hotkeys() {
      return {
        group: this.$t("hotkey.group"),
        keys: {
          "mod+s": {
            handler: this.save,
            description: this.$t("hotkey.mod+s"),
          },
          "mod+r": {
            handler: () => {
              this.showRevertConfirm = true;
            },
            description: this.$t("hotkey.mod+r"),
          },
          "mod+p": {
            handler: () => {
              this.showPreferencesForm = true;
            },
            description: this.$t("hotkey.mod+p"),
          },
          "mod+h": {
            // @todo: fix hotkeys code handling for ?
            handler: () => {
              this.showHotkeyList = true;
            },
            description: this.$t("hotkey.mod+h"),
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
    activeFormsTab(index) {
      this.behaviorsOpen = index === 1;
    },
  },
  async mounted() {
    this.overlaysTarget = this.$el;

    this.installTooltip(this.$el);

    const hasAutoSaveData = await this.isAutoSaveDataAvailable();
    if (hasAutoSaveData) {
      this.showAutoSaveRestoreConfirm = true;
    } else {
      await this.store.load(this.url);
      window.addEventListener("beforeunload", this.onWindowBeforeunload);
    }
  },
  beforeUnmount() {
    window.removeEventListener("beforeunload", this.onWindowBeforeunload);
  },
  methods: {
    save() {
      this.store.save(this.url).catch((e) => {
        // @todo: handle errors
        console.error(e);
      });
    },
    revert(confirm = true) {
      if (confirm) {
        this.showRevertConfirm = true;
        return;
      }

      this.showRevertConfirm = false;
      this.store.load(this.url);
    },
    loadRevision(vid, confirm = true) {
      if (confirm && this.dirty) {
        this.showLoadRevisionConfirm = vid;
        return;
      }

      this.showLoadRevisionConfirm = false;
      this.store.loadRevision(vid);
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
    onSharedAssetsImportClick(asset) {
      this.activeLibrariesTab = 1;
      this.addAsset(asset);
    },
    onRevertSubmit() {
      this.revert(false);
    },
    onRevertCancel() {
      this.showRevertConfirm = false;
    },
    onLoadRevisionSubmit() {
      this.loadRevision(this.showLoadRevisionConfirm, false);
    },
    onLoadRevisionCancel() {
      this.showLoadRevisionConfirm = false;
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
    onPreferencesSubmit() {
      this.showPreferencesForm = false;
    },
    onPreferencesClose() {
      this.showPreferencesForm = false;
    },
    onContextmenu(evt) {
      // Show the native menu if the shift key is down.
      if (evt.shiftKey) {
        return;
      }

      this.contextmenuPosition = {
        x: evt.pageX,
        y: evt.pageY,
      };
      this.showContextmenu = true;

      evt.preventDefault();
    },
    onWindowBeforeunload(evt) {
      if (this.dirty) {
        evt.preventDefault();
        return (evt.returnValue = this.$t("unload_dirty"));
      }
    },
  },
};
</script>

<style lang="scss">
@import "normalize.css";
@import "source-sans/source-sans-3VF.css";
@import "./scss/theme.scss";
</style>

<style lang="scss" scoped>
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
  font-size: 14px;
  font-family: "Source Sans 3 VF", "Source Sans Variable", "Source Sans Pro",
    sans-serif;
  color: var(--metascore-color-white);

  &,
  :deep(*) {
    scrollbar-width: thin;
    scrollbar-color: var(--metascore-scrollbar-thumb-color)
      var(--metascore-scrollbar-track-color);

    ::-webkit-scrollbar {
      appearance: none;
      width: var(--metascore-scrollbar-width);
      height: var(--metascore-scrollbar-width);
    }

    ::-webkit-scrollbar-track {
      background-color: var(--metascore-scrollbar-track-color);
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 0;
      min-width: var(--metascore-scrollbar-thumb-min-height);
      min-height: var(--metascore-scrollbar-thumb-min-height);
      background-color: var(--metascore-scrollbar-thumb-color);
    }
  }

  :deep(.sr-only) {
    @include sr-only;
  }

  > .top {
    grid-area: top;
    background: var(--metascore-color-bg-tertiary);

    .main-menu {
      display: flex;
      height: 2.5em;
      padding: 0.25em 1em;
      justify-content: flex-start;
      gap: 1em;
      box-sizing: border-box;

      :deep(button) {
        padding-top: 0;
        padding-bottom: 0;
        align-self: stretch;
      }

      :deep(.form-group) {
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

        :deep(input) {
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
    display: flex;
    grid-area: center;
    flex-direction: column;
    overflow: hidden;
    background: #777;

    .components-breadcrumb {
      border-top: 1px solid var(--metascore-color-bg-tertiary);
    }
  }

  > .right {
    grid-area: right;
    width: 20em;
    min-width: 20em;
    max-width: 50vw;
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
      grid-template-columns: var(--metascore-controller-left-width) 1fr;
      grid-template-rows: 15% 1fr;
      flex: 0 0 var(--metascore-controller-top-height);
      background: var(--metascore-color-bg-secondary);
      border-bottom: 2px solid var(--metascore-color-bg-tertiary);
      z-index: 1;

      .playback-time {
        display: flex;
        grid-area: 1 / 1 / span 2 / 1;
        box-sizing: border-box;
        border-right: 2px solid var(--metascore-color-bg-tertiary);

        :deep(input) {
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
        overflow-y: scroll;
      }
    }

    > .middle {
      flex: 1 1 auto;
      overflow: hidden;
      position: relative;
      overflow-y: scroll;
      scroll-behavior: smooth;
      scroll-padding-top: var(--metascore-controller-bottom-sticky-top-height);

      > .sticky-top {
        position: sticky;
        top: 0;
        left: 0;
        width: 100%;
        height: var(--metascore-controller-bottom-sticky-top-height);
        display: grid;
        grid-template-columns: var(--metascore-controller-left-width) 1fr;
        grid-template-rows: 1fr auto;
        background: var(--metascore-color-bg-primary);
        border-bottom: 2px solid var(--metascore-color-bg-tertiary);
        z-index: 4;

        .playback-controller {
          grid-area: 1 / 1;
          box-sizing: border-box;
          border-right: 2px solid var(--metascore-color-bg-tertiary);
        }

        .media-selector {
          grid-area: 2 / 1;
          padding: 0.25em 0.5em;
          box-sizing: border-box;
          border-right: 2px solid var(--metascore-color-bg-tertiary);
        }

        .waveform--zoom {
          grid-area: 1 / 2 / span 2 / auto;
        }
      }
    }

    > .bottom {
      display: flex;
      flex-direction: row;
      flex: 0 0 var(--metascore-controller-bottom-sticky-bottom-height);
      background: var(--metascore-color-bg-secondary);
      border-top: 1px solid var(--metascore-color-bg-tertiary);
      z-index: 1;

      .scenario-manager {
        flex: 1 1 auto;
      }

      .waveform--zoom-controller {
        flex: 0 0 auto;
        background: var(--metascore-color-bg-tertiary);
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

  &.behaviors-open {
    > .right {
      min-width: 60em;
      max-width: 80vw;
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

      :deep(.tabs-nav) {
        border-color: transparent;
      }
    }

    > .center,
    > .right,
    > .bottom {
      display: none;
    }
  }

  &.preview:not(.preview-persistant) {
    > .left,
    > .right,
    > .bottom .media-selector :deep(button),
    > .bottom .timeline,
    > .bottom > .bottom {
      pointer-events: none;
      opacity: 0.25;
    }
  }

  &.preview.preview-persistant,
  &:not(.latest-revision) {
    grid-template-columns: auto 1fr auto;

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
            padding: 0;
            align-items: stretch;

            > :deep(.center) {
              flex: 1 0 100%;
            }

            :deep(.rewind),
            :deep(.playback-rate) {
              display: none;
            }

            :deep(.play),
            :deep(.pause) {
              width: 100%;
              height: 100%;
              margin-right: 0;
              padding: 0;
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
