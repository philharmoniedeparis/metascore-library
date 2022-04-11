<template>
  <div class="metaScore-player" @contextmenu.prevent="onContextmenu">
    <app-renderer
      :url="url"
      :responsive="responsive"
      :allow-upscaling="allowUpscaling"
    />

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
import packageInfo from "../../package.json";

export default {
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
  date() {
    return {
      version: packageInfo.version,
      showContextmenu: false,
      contextmenuPosition: { x: 0, y: 0 },
    };
  },
  async mounted() {
    await this.editorStore.load(this.url);
  },
  methods: {
    onContextmenu(evt) {
      this.contextmenuPosition = {
        x: evt.pageX,
        y: evt.pageY,
      };
      this.showContextmenu = true;
    },
  },
};
</script>

<style lang="scss" scoped>
@import "normalize.css";

.metaScore-player {
  position: relative;
}
</style>
