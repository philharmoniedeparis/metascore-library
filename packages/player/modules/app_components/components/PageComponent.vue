<template>
  <component-wrapper :model="model" class="page">
    <template v-for="child in children" :key="child.id">
      <component :is="`${child.type}Component`" :model="child" />
    </template>
  </component-wrapper>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";

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
  setup() {
    const componentsStore = useModule("AppComponents").useStore();
    return { componentsStore };
  },
  computed: {
    children() {
      return this.componentsStore.getChildren(this.model);
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
