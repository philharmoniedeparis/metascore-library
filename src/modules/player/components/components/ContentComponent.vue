<i18n>
{
}
</i18n>

<template>
  <component-wrapper :model="model" class="content">
    <div v-dompurify-html="model.text"></div>
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
};
</script>

<style lang="scss" scoped>
.content {
  overflow: hidden;
}
</style>
