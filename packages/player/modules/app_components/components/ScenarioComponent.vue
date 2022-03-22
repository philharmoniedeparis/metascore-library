<template>
  <component-wrapper :component="component" class="scenario">
    <template v-for="child in children" :key="child.id">
      <component :is="`${child.type}Component`" :component="child" />
    </template>
  </component-wrapper>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";

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
  setup() {
    const componentsStore = useModule("app_components").useStore();
    return { componentsStore };
  },
  computed: {
    children() {
      return this.componentsStore.getChildren(this.component);
    },
  },
};
</script>

<style scoped lang="scss">
.scenario {
  width: 100%;
  height: 100%;
}
</style>
