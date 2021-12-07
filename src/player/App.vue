<template>
  <div class="metaScore-player">
    <media-player
      ref="media-player"
      :sources="sources"
      type="video"
      :use-request-animation-frame="true"
      @loadedmetadata="onMediaLoadedmetadata"
      @play="onMediaPlay"
      @pause="onMediaPause"
      @stop="onMediaStop"
      @timeupdate="onMediaTimeupdate"
    />

    <template v-for="scenario in getScenarios()" :key="scenario.id">
      <Scenario :model="scenario" />
    </template>
  </div>
</template>

<script>
import { mapGetters, mapMutations, mapActions } from "vuex";
import Scenario from "./components/components/Scenario";
import MediaPlayer from "./components/MediaPlayer";

export default {
  components: {
    MediaPlayer,
    Scenario,
  },
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
  data() {
    return {
      sources: [
        {
          src: "https://file-examples-com.github.io/uploads/2017/04/file_example_MP4_480_1_5MG.mp4",
          type: "video/mp4",
        },
        {
          src: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
          type: "application/vnd.apple.mpegurl",
        },
        {
          src: "https://bitmovin-a.akamaihd.net/content/MI201109210084_1/mpds/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.mpd",
          type: "application/dash+xml",
        },
      ],
    };
  },
  computed: {
    /**
     * Get the media player component
     * @return {MediaPlayer} The component
     */
    mediaPlayer() {
      return this.$refs["media-player"];
    },
  },
  mounted() {
    this.load();
  },
  methods: {
    ...mapMutations("media", {
      setMediaReady: "setReady",
      setMediaPlaying: "setPlaying",
      setMediaTime: "setTime",
      setMediaDuration: "setDuration",
    }),
    ...mapGetters("components", ["getScenarios"]),
    ...mapActions("components", ["load"]),

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
  },
};
</script>

<style lang="scss" scoped>
.metaScore-player {
  font-size: 11px;
  font-family: Verdana, Arial, Helvetica, sans-serif;

  ::v-deep(.media-player) {
    display: none;
  }
}
</style>
