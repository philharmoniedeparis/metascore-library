<template>
  <component-wrapper v-if="isActiveScenario" :model="model" class="scenario">
    <template v-for="child in model.children" :key="child.id">
      <component :is="child.type" :model="child" />
    </template>
  </component-wrapper>
</template>

<script>
import { mapState } from "vuex";
import ComponentWrapper from "./ComponentWrapper.vue";
import Animation from "./AnimationComponent";
import Block from "./BlockComponent";
import BlockToggler from "./BlockTogglerComponent";
import Content from "./ContentComponent";
import Controller from "./ControllerComponent";
import Cursor from "./CursorComponent";
import Media from "./MediaComponent";
import SVG from "./SvgComponent";
import VideoRenderer from "./VideoRendererComponent";

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
