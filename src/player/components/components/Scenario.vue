<template>
  <div v-if="active" :id="model.id" class="metaScore-component scenario">
    <template v-for="child in model.children" :key="child.id">
      <component :is="child.type" :model="child" />
    </template>
  </div>
</template>

<script>
import { mapState } from "vuex";
import Block from "./Block";
import VideoRenderer from "./VideoRenderer";

export default {
  components: {
    Block,
    VideoRenderer,
  },
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
  },
};
</script>

<style scoped lang="scss"></style>
