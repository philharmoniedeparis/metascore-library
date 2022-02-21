<template>
  <component-wrapper :model="model" class="scenario">
    <template v-for="child in children" :key="child.id">
      <component :is="`${child.type}Component`" :model="child" />
    </template>
  </component-wrapper>
</template>

<script>
import { mapState, mapGetters } from "vuex";

export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState("app-components", ["activeScenario"]),
    ...mapGetters("app-components", {
      getComponentChildren: "getChildren",
    }),
    children() {
      return this.getComponentChildren(this.model);
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
