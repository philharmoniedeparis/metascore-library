<template>
  <div class="metaScore-editor">
    <iframe
      class="player"
      src="/?player"
      ref="player"
      @load="onPlayerFrameLoad"
    />
    <button @click="updatePlayer">Update</button>
    <component-form></component-form>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  inject: ["$postMessage"],
  methods: {
    ...mapActions("components", { updateComponent: "update" }),
    onPlayerFrameLoad() {
      this.$postMessage.send(
        this.$refs.player.contentWindow,
        JSON.stringify({
          method: "addListener",
          type: "ready",
        })
      );
    },
    updatePlayer() {
      this.updateComponent({
        type: "Controller",
        id: "component-m0WFLEUhMJ",
        data: {
          position: [
            Math.round(Math.random() * 100),
            Math.round(Math.random() * 100),
          ],
        },
      });
    },
  },
};
</script>
<style lang="scss">
.metaScore-editor {
  > .player {
    width: 500px;
    height: 500px;
  }
}
</style>
