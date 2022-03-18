<template>
  <component-wrapper :model="model" class="scenario">
    <template v-for="child in children" :key="child.id">
      <component :is="`${child.type}Component`" :model="child" />
    </template>
  </component-wrapper>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";

export default {
  props: {
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

<style scoped lang="scss">
.scenario {
  width: 100%;
  height: 100%;
}
</style>
