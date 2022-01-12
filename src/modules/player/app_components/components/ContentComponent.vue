<i18n>
{
}
</i18n>

<template>
  <component-wrapper :model="model" class="content">
    <div v-dompurify-html="text"></div>
  </component-wrapper>
</template>

<script>
// @TODO: add link auto-highlighting

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
    text() {
      return this.model["content-text"];
    },
  },
};
</script>

<style lang="scss" scoped>
.content {
  ::v-deep(p) {
    margin: 1em 0;
  }
}
</style>
