<template>
  <div class="metaScore-player">
    <media-player
      ref="media-player"
      :sources="mediaSources"
      type="video"
      :use-request-animation-frame="true"
      @loadedmetadata="onMediaLoadedmetadata"
      @play="onMediaPlay"
      @pause="onMediaPause"
      @stop="onMediaStop"
      @timeupdate="onMediaTimeupdate"
    />

    <template v-for="scenario in scenarios" :key="scenario.id">
      <Scenario :model="scenario" />
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import Scenario from "./components/ScenarioComponent";
import MediaPlayer from "./components/MediaPlayer";

export default {
  components: {
    MediaPlayer,
    Scenario,
  },
  inject: ["$postMessage"],
  provide() {
    return {
      seekMediaTo: (time) => {
        this.mediaPlayer.setTime(time);
      },
      playMedia: () => {
        this.mediaPlayer.play();
      },
      pauseMedia: () => {
        this.mediaPlayer.pause();
      },
      stopMedia: () => {
        this.mediaPlayer.stop();
      },
      getMediaElement: () => {
        return this.mediaPlayer.getElement();
      },
    };
  },
  props: {
    url: {
      type: String,
      required: true,
    },
    api: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    ...mapState(["css"]),
    ...mapState("media", {
      mediaSources: "sources",
    }),
    ...mapGetters("components", { scenarios: "getScenarios" }),
    /**
     * Get the media player component
     * @return {MediaPlayer} The component
     */
    mediaPlayer() {
      return this.$refs["media-player"];
    },
  },
  watch: {
    css(value) {
      if (!this.sheet) {
        this.sheet = document.createElement("style");
        document.head.appendChild(this.sheet);
      }

      this.sheet.innerHTML = value ?? "";
    },
  },
  created() {
    if (this.api) {
      this.$postMessage.on(this.onAPIMessage);
    }
  },
  async mounted() {
    await this.load(this.url);
  },
  unmounted() {
    if (this.api) {
      this.$postMessage.off(this.onAPIMessage);
    }
  },
  methods: {
    ...mapMutations("media", {
      setMediaReady: "setReady",
      setMediaPlaying: "setPlaying",
      setMediaTime: "setTime",
      setMediaDuration: "setDuration",
    }),
    ...mapActions(["load"]),

    /**
     * The media's 'ready' event handler
     */
    onMediaLoadedmetadata() {
      this.setMediaReady(true);
      this.setMediaDuration(this.mediaPlayer.getDuration());
    },

    /**
     * The media's 'play' event handler
     */
    onMediaPlay() {
      this.setMediaPlaying(true);
    },

    /**
     * The media's 'pause' event handler
     */
    onMediaPause() {
      this.setMediaPlaying(false);
    },

    /**
     * The media's 'stop' event handler
     */
    onMediaStop() {
      this.setMediaPlaying(false);
    },

    /**
     * The media's 'timeupdate' event handler
     */
    onMediaTimeupdate() {
      this.setMediaTime(this.mediaPlayer.getTime());
    },

    onAPIMessage(evt) {
      console.log(evt.data);
    },
  },
};
</script>

<style lang="scss" scoped>
.metaScore-player {
  position: relative;
  font-size: 11px;
  font-family: Verdana, Arial, Helvetica, sans-serif;

  > ::v-deep(.media-player) {
    display: none;
  }
}
</style>
