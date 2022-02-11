<template>
  <component-wrapper :model="model" class="media">
    <component :is="tag" :src="src" controls playsinline></component>
  </component-wrapper>
</template>

<script>
export default {
  props: {
    /**
     * The associated vuex-orm model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    tag() {
      return this.model.tag;
    },
    src() {
      return this.model.src;
    },
  },
};
</script>

<style lang="scss" scoped>
.media {
  > .metaScore-component--inner {
    display: flex;
    align-items: center;

    video,
    audio {
      width: 100%;
      object-fit: contain;
    }

    video {
      height: 100%;
    }
  }
}
</style>
