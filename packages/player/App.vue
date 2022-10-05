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
  <div class="metaScore-player" @contextmenu="onContextmenu">
    <app-renderer
      :url="url"
      :responsive="responsive"
      :allow-upscaling="allowUpscaling"
    />

    <progress-indicator v-if="loading" :text="$t('loading_indicator_label')" />

    <context-menu
      v-model:show="showContextmenu"
      :position="contextmenuPosition"
    >
      <template #footer>
        {{ `metaScore Player ${version}` }}
      </template>
    </context-menu>
  </div>
</template>

<script>
import { computed } from "vue";
import useStore from "./store";
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
    keyboard: {
      type: Boolean,
      default: true,
    },
    responsive: {
      type: Boolean,
      default: false,
    },
    allowUpscaling: {
      type: Boolean,
      default: false,
    },
    api: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const store = useStore();
    const { ready: appRendererReady } = useModule("app_renderer");
    return { store, appRendererReady };
  },
  data() {
    return {
      version: packageInfo.version,
      modalsTarget: null,
      showContextmenu: false,
      contextmenuPosition: { x: 0, y: 0 },
    };
  },
  computed: {
    loading() {
      return this.store.loading || !this.appRendererReady;
    },
  },
  mounted() {
    this.modalsTarget = this.$el;
    this.store.load(this.url);
  },
  methods: {
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

.metaScore-player {
  position: relative;
  display: flex;
  height: 100%;
  margin: 0;
  padding: 0;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-family: "Source Sans 3 VF", "Source Sans Variable", "Source Sans Pro",
    sans-serif;
}
</style>
