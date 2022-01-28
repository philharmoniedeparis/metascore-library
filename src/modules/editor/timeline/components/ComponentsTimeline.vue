<template>
  <div
    class="timeline"
    tabindex="0"
    :style="`--timeline-duration: ${mediaDuration}`"
  >
    <div class="tracks-container">
      <canvas ref="playhead" class="playhead" />
      <component-track v-if="scenario" :model="scenario" />
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from "vuex";
import ComponentTrack from "./ComponentTrack.vue";

export default {
  components: {
    ComponentTrack,
  },
  computed: {
    ...mapState("media", {
      mediaTime: "time",
      mediaDuration: "duration",
    }),
    ...mapState("app-components", ["activeScenario"]),
    ...mapGetters("app-components", { getComponent: "get" }),
    scenario() {
      return this.getComponent(this.activeScenario);
    },
  },
};
</script>

<style lang="scss" scoped>
.timeline {
  display: flex;
  flex-direction: row;
  background: $mediumgray;
  z-index: 0;
  --timeline-zoom: 100%;
  --timeline-offset: 0;

  .tracks-container {
    display: grid;
    position: relative;
    grid-template-columns: 12em auto;
    flex: 1;

    .playhead {
      position: absolute;
      grid-area: 1/2;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      pointer-events: none;
      z-index: 10;
    }
  }
}
</style>
