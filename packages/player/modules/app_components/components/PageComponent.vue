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
     * The associated component model
     */
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters("app-components", {
      getComponentChildren: "getChildren",
    }),
    children() {
      return this.getComponentChildren(this.model);
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
