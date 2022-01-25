<template>
  <component-wrapper :model="model" class="page">
    <template v-for="child in children" :key="child.id">
      <component :is="`${child.type}Component`" :model="child" />
    </template>
  </component-wrapper>
</template>

<script>
import { mapGetters } from "vuex";

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
    ...mapGetters("app-components", { filterComponentsByIds: "filterByIds" }),
    children() {
      return this.filterComponentsByIds(this.model.children);
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
