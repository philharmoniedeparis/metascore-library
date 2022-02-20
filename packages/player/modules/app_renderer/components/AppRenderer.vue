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
import { mapState, mapGetters, mapActions } from "vuex";

export default {
  inject: ["$postMessage"],
  props: {
    url: {
      type: String,
      required: true,
    },
    api: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(["css"]),
    ...mapState("media", {
      mediaSource: "source",
    }),
    ...mapState("app-components", ["activeScenario"]),
    ...mapGetters("app-components", { getComponent: "get" }),
    scenario() {
      return this.getComponent(this.activeScenario);
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
  async mounted() {
    await this.load(this.url);
  },
  unmounted() {
    if (this.api) {
      this.$postMessage.off(this.onAPIMessage);
    }
  },
  methods: {
    ...mapActions({ load: "app-renderer/load" }),

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
