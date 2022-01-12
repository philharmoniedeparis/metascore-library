<template>
  <component-wrapper v-if="active" :model="model" class="scenario">
    <template v-for="child in children" :key="child.id">
      <component :is="`${child.type}Component`" :model="child" />
    </template>
  </component-wrapper>
</template>

<script>
import { mapState } from "vuex";

export default {
  props: {
    model: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapState("components", ["activeScenario"]),
    active() {
      return this.model.id === this.activeScenario;
    },
    children() {
      return this.model["scenario-children"];
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
