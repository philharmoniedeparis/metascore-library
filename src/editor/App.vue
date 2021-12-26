<template>
  <div class="metaScore-editor">
    <button @click="updatePlayer">Update</button>
    <player-preview :css="playerCss" :url="playerUrl" />
    <component-form></component-form>
  </div>
</template>

<script>
export default {
  props: {
    playerUrl: {
      type: String,
      required: true,
    },
    playerCss: {
      type: String,
      required: true,
    },
  },
  methods: {},
};
</script>
<style lang="scss">
.metaScore-editor {
  > button {
    background: red;
  }

  > .player-preview {
    width: 200px;
    height: 200px;
  }
}
</style>
