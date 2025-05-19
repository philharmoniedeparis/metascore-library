<template>
  <component-wrapper :component="component">
    <template v-for="child in children" :key="child.id">
      <component
        :is="`${child.type}Component`"
        :component="child"
        @action="$emit('action', $event)"
      />
    </template>
  </component-wrapper>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import useStore from "../store";

export default defineComponent ({
  props: {
    /**
     * The associated component
     */
    component: {
      type: Object,
      required: true,
    },
  },
  emits: ["action"],
  setup() {
    const store = useStore();
    return { store };
  },
  computed: {
    children() {
      return this.store.getChildren(this.component);
    },
  },
});
</script>

<style scoped lang="scss">
.scenario {
  width: 100%;
  height: 100%;
}
</style>
