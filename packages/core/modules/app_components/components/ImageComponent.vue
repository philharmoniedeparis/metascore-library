<template>
  <component-wrapper :component="component">
    <img :src="src" tabindex="-1" />
  </component-wrapper>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

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
  computed: {
    src() {
      return this.component.src;
    },
  },
});
</script>

<style lang="scss" scoped>
img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  pointer-events: none;
}
</style>
