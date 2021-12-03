<template>
  <div class="metaScore-player">
    <media-player
      ref="media-player"
      :sources="sources"
      type="video"
      :use-request-animation-frame="true"
      @loadedmetadata="_onMediaLoadedmetadata"
      @play="_onMediaPlay"
      @pause="_onMediaPause"
      @stop="_onMediaStop"
      @timeupdate="_onMediaTimeupdate"
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
      _setMediaReady: "setReady",
      _setMediaPlaying: "setPlaying",
      _setMediaTime: "setTime",
      _setMediaDuration: "setDuration",
    }),
    ...mapGetters("components", ["getScenarios"]),
    ...mapActions("components", ["load"]),

    /**
     * The media's 'ready' event handler
     * @private
     */
    _onMediaLoadedmetadata() {
      this._setMediaReady(true);
      this._setMediaDuration(this.mediaPlayer.getDuration());
    },

    /**
     * The media's 'play' event handler
     * @private
     */
    _onMediaPlay() {
      this._setMediaPlaying(true);
    },

    /**
     * The media's 'pause' event handler
     * @private
     */
    _onMediaPause() {
      this._setMediaPlaying(false);
    },

    /**
     * The media's 'stop' event handler
     * @private
     */
    _onMediaStop() {
      this._setMediaPlaying(false);
    },

    /**
     * The media's 'timeupdate' event handler
     * @private
     */
    _onMediaTimeupdate() {
      this._setMediaTime(this.mediaPlayer.getTime());
    },
  },
};
</script>

<style lang="scss" scoped>
.metaScore-player {
  ::v-deep(.media-player) {
    display: none;
  }
}
</style>
