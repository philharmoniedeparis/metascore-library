<template>
  <div class="metaScore-app">
    <media-player
      v-if="mediaSource"
      :source="mediaSource"
      type="video"
      :use-request-animation-frame="true"
    />

    <scenario-component v-if="scenario" :model="scenario" />
  </div>
</template>

<script>
import { useStore } from "@metascore-library/core/module-manager";

export default {
  inject: ["$postMessage"],
  props: {
    api: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const store = useStore("app-renderer");
    const mediaStore = useStore("media");
    const componentsStore = useStore("components");
    return { store, mediaStore, componentsStore };
  },
  computed: {
    css() {
      return this.store.css;
    },
    mediaSource() {
      return this.mediaStore.source;
    },
    scenario() {
      if (!this.componentsStore.activeScenario) {
        return null;
      }

      return this.componentsStore.get(
        this.componentsStore.activeScenario.schema,
        this.componentsStore.activeScenario.id
      );
    },
  },
  watch: {
    css(value) {
      if (!this.sheet) {
        this.sheet = document.createElement("style");
        document.head.appendChild(this.sheet);
      }

      this.sheet.innerHTML = value ?? "";
    },
  },
  created() {
    if (this.api) {
      this.$postMessage.on(this.onAPIMessage);
    }
  },
  unmounted() {
    if (this.api) {
      this.$postMessage.off(this.onAPIMessage);
    }
  },
  methods: {
    onAPIMessage(evt) {
      console.log(evt.data);
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
