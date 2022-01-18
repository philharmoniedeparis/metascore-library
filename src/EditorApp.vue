<template>
  <div class="metaScore-editor">
    <resizable-pane class="top">
      <main-menu />
    </resizable-pane>

    <resizable-pane
      class="left"
      direction="vertical"
      :resizable="{ edges: { right: true } }"
    >
      <tabs-container>
        <tabs-item title="Components"><components-library /></tabs-item>
        <tabs-item title="Library"><assets-library /></tabs-item>
        <tabs-item title="Shared Library"><shared-assets-library /></tabs-item>
      </tabs-container>
    </resizable-pane>

    <resizable-pane class="center">
      <player-preview :url="url" />
    </resizable-pane>

    <resizable-pane
      class="right"
      direction="vertical"
      :resizable="{ edges: { left: true } }"
    >
      <component-form></component-form>
    </resizable-pane>

    <resizable-pane class="bottom" :resizable="{ edges: { top: true } }">
    </resizable-pane>
  </div>
</template>

<script>
import ResizablePane from "./components/ResizablePane.vue";
import TabsContainer from "./components/TabsContainer.vue";
import TabsItem from "./components/TabsItem.vue";

export default {
  components: {
    ResizablePane,
    TabsContainer,
    TabsItem,
  },
  props: {
    url: {
      type: String,
      required: true,
    },
  },
};
</script>
<style lang="scss">
@import "source-sans/source-sans-3VF.css";
@import "./assets/css/theme.scss";

.metaScore-editor {
  font-size: 14px;
  font-family: "Source Sans 3 VF", "Source Sans Variable", "Source Sans Pro",
    sans-serif;
  display: grid;
  height: 100%;
  margin: 0;
  padding: 0;
  grid-template-columns: auto 1fr auto;
  grid-template-rows: min-content 1fr auto;
  grid-template-areas:
    "top top top"
    "left center right"
    "bottom bottom bottom";
  align-items: stretch;
  flex-wrap: nowrap;

  * {
    scrollbar-color: $scrollbar-thumb-color $scrollbar-track-color;
    scrollbar-width: thin;

    ::-webkit-scrollbar {
      appearance: none;
      background-color: $scrollbar-track-color;
      width: $scrollbar-width;
      height: $scrollbar-thumb-min-height;
    }

    ::-webkit-scrollbar-thumb {
      border-radius: 0;
      background-color: $scrollbar-thumb-color;

      &:active,
      &:hover {
        background-color: $scrollbar-thumb-active-color;
      }
    }
  }

  > .top {
    grid-area: top;
    height: 2.5em;
    background: $darkgray;
  }

  > .left {
    grid-area: left;
    width: 20em;
    min-width: 15em;
    max-width: 25vw;
    min-height: 100%;
    border-right: 0.5em solid $darkgray;
  }

  > .center {
    grid-area: center;
    width: 100%;
  }

  > .right {
    grid-area: right;
    width: 20em;
    min-width: 15em;
    max-width: 25vw;
    min-height: 100%;
    border-left: 0.5em solid $darkgray;
  }

  > .bottom {
    grid-area: bottom;
    height: 300px;
    min-height: 150px;
    max-height: 75vh;
    min-width: 100%;
    border-top: 0.5em solid $darkgray;
  }
}
</style>
