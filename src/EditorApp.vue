<template>
  <div class="metaScore-editor">
    <player-preview :url="url" />
    <component-form></component-form>
  </div>
</template>

<script>
export default {
  props: {
    url: {
      type: String,
      required: true,
    },
  },
};
</script>
<style lang="scss">
.metaScore-editor {
  > .player-preview {
    width: 200px;
    height: 200px;
  }
}
</style>
