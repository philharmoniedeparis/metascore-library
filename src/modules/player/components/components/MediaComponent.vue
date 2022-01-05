<i18n>
{
}
</i18n>

<template>
  <component-wrapper :model="model" class="media">
    <component
      :is="model.tag"
      :src="model.src"
      controls
      playsinline
    ></component>
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
