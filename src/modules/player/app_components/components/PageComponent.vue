<i18n>
{
}
</i18n>

<template>
  <component-wrapper :model="model" class="page">
    <template v-for="child in children" :key="child.id">
      <component :is="`${child.type}Component`" :model="child" />
    </template>
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
    children() {
      return this.model["page-children"];
    },
  },
};
</script>

<style lang="scss" scoped>
.page {
  width: 100%;
  height: 100%;
}
</style>
