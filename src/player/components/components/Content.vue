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
import ComponentWrapper from "../ComponentWrapper.vue";

export default {
  components: {
    ComponentWrapper,
  },
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
