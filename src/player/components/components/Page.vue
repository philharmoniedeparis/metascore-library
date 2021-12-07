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
import ComponentWrapper from "../ComponentWrapper.vue";
import Animation from "./Animation";
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
