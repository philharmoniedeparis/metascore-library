<template>
  <component-wrapper v-if="isActiveScenario" :model="model" class="scenario">
    <template v-for="child in model.children" :key="child.id">
      <component :is="child.type" :model="child" />
    </template>
  </component-wrapper>
</template>

<script>
import { mapState } from "vuex";
import ComponentWrapper from "../ComponentWrapper.vue";
import Animation from "./Animation";
import Block from "./Block";
import BlockToggler from "./BlockToggler";
import Content from "./Content";
import Controller from "./Controller";
import Cursor from "./Cursor";
import Media from "./Media";
import SVG from "./SVG";
import VideoRenderer from "./VideoRenderer";

export default {
  components: {
    ComponentWrapper,
    Animation,
    Block,
    BlockToggler,
    Content,
    Controller,
    Cursor,
    Media,
    SVG,
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
    isActiveScenario() {
      return this.model.id === this.activeScenario;
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
