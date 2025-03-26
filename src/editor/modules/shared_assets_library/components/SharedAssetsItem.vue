<i18n>
{
  "fr": {
    "import_button": "Importer"
  },
  "en": {
    "import_button": "Import"
  }
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

      <base-button type="button" @click="onImportClick">
        {{ $t("import_button") }}
      </base-button>

      <figcaption>{{ label }}</figcaption>
    </figure>
  </div>
</template>

<script>
import useStore from "../store";
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
    const store = useStore();
    return { store };
  },
  computed: {
    label() {
      return this.store.getName(this.asset);
    },
    file() {
      return this.store.getFile(this.asset);
    },
    type() {
      return this.asset.type;
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
    svg,
    .lottie-animation-icon {
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
      background: var(--metascore-color-bg-primary);
      box-sizing: border-box;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    :deep(button) {
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
      color: var(--metascore-color-black);
      pointer-events: none;

      .content {
        min-width: 50%;
        padding: 0.5em;
        background: var(--metascore-color-white);
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
    :deep(button) {
      display: none;
    }
  }
}
</style>
