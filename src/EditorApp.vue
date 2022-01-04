<template>
  <div class="metaScore-editor">
    <main-menu />
    <player-preview :url="url" />
    <component-form></component-form>
    <tabs-container class="libraries">
      <tabs-item title="Components"><components-library /></tabs-item>
      <tabs-item title="Library"><assets-library /></tabs-item>
      <tabs-item title="Shared Library"><shared-assets-library /></tabs-item>
    </tabs-container>
  </div>
</template>

<script>
import TabsContainer from "./components/TabsContainer.vue";
import TabsItem from "./components/TabsItem.vue";

export default {
  components: {
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

  > .main-menu {
    grid-area: top;
  }

  > .libraries {
    grid-area: left;
  }

  > .component-form {
    grid-area: right;
  }

  > .player-preview {
    grid-area: center;
    width: 100%;
  }

  > .bottom {
    grid-area: bottom;
  }
}
</style>
