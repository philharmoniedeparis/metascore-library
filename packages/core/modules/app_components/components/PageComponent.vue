<template>
  <component-wrapper :component="component">
    <template v-for="child in children" :key="child.id">
      <component :is="`${child.type}Component`" :component="child" />
    </template>
  </component-wrapper>
</template>

<script>
import useStore from "../store";

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
    const store = useStore();
    return { store };
  },
  computed: {
    children() {
      return this.store.getChildren(this.component);
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
