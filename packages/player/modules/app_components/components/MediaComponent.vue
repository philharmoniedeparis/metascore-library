<template>
  <component-wrapper :component="component" class="media">
    <component :is="tag" :src="src" controls playsinline></component>
  </component-wrapper>
</template>

<script>
export default {
  props: {
    /**
     * The associated component
     */
    component: {
      type: Object,
      required: true,
    },
  },
  computed: {
    tag() {
      return this.component.tag;
    },
    src() {
      return this.component.src;
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
