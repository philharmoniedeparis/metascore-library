<i18n>
{
  "fr": {
    "import_button": "Importer",
  },
  "en": {
    "import_button": "Import",
  },
}
</i18n>

<template>
  <div class="assets-item">
    <figure>
      <img v-if="['image', 'svg'].includes(type)" :src="file.url" />
      <lottie-animation-icon
        v-else-if="type === 'lottie_animation'"
        :src="file.url"
      />

      <styled-button type="button" @click="onImportClick">
        {{ $t("import_button") }}
      </styled-button>

      <figcaption>{{ label }}</figcaption>
    </figure>
  </div>
</template>

<script>
import { useStore } from "@metascore-library/core/module-manager";
import LottieAnimationIcon from "./LottieAnimationIcon.vue";

export default {
  components: {
    LottieAnimationIcon,
  },
  props: {
    asset: {
      type: Object,
      required: true,
    },
  },
  emits: ["click:import"],
  setup() {
    const store = useStore("shared-assets");
    const assetsStore = useStore("shared-assets");
    return { store, assetsStore };
  },
  computed: {
    label() {
      return this.store.getName(this.asset);
    },
    file() {
      return this.store.getFile(this.asset);
    },
    type() {
      return this.store.getType(this.asset);
    },
  },
  methods: {
    onImportClick() {
      this.$emit("click:import", this.asset);
    },
  },
};
</script>

<style lang="scss" scoped>
.assets-item {
  position: relative;

  figure {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    margin: 0;

    img,
    svg {
      width: 100%;
      height: 100%;
      padding: 1em 1em 3em 1em;
      background: #606060;
      box-sizing: border-box;
      object-fit: contain;
    }

    figcaption {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      text-align: center;
      line-height: 2em;
      background: $lightgray;
      box-sizing: border-box;
    }

    ::v-deep(button) {
      position: absolute;
      top: 0;
      left: 0;
      bottom: 2em;
      width: 100%;
      padding: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      pointer-events: none;

      .content {
        min-width: 50%;
        padding: 0.5em;
        background: $white;
        border-radius: 5em;
        box-shadow: 0 0 0.25em 0 rgba(0, 0, 0, 0.5);
        pointer-events: auto;
      }
    }
  }

  &::before {
    content: "";
    position: relative;
    display: block;
    padding-top: 100%;
    padding-bottom: 2em;
  }

  &:not(:hover) {
    ::v-deep(button) {
      display: none;
    }
  }
}
</style>