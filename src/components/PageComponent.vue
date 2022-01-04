<i18n>
{
}
</i18n>

<template>
  <component-wrapper :model="model" class="page">
    <template v-for="child in model.children" :key="child.id">
      <component :is="child.type" :model="child" />
    </template>
  </component-wrapper>
</template>

<script>
import ComponentWrapper from "./ComponentWrapper.vue";
import Animation from "./AnimationComponent";
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
    BlockToggler,
    Content,
    Controller,
    Cursor,
    Media,
    SVG,
    VideoRenderer,
  },
  props: {
    /**
     * The associated vuex-orm model
     */
    model: {
      type: Object,
      required: true,
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
