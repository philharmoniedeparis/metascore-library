<template>
  <div class="metaScore-player">
    <media-player
      ref="media-player"
      :sources="sources"
      type="video"
      @ready="onMediaReady"
      @play="onMediaPlay"
      @pause="onMediaPause"
      @stop="onMediaStop"
      @seeked="onMediaSeeked"
    />

    <div>{{ mediaTime }}</div>

    <template v-for="scenario in getScenarios()" :key="scenario.id">
      <Scenario :model="scenario" />
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters, mapMutations, mapActions } from "vuex";
import Scenario from "@/player/components/components/Scenario";
import MediaPlayer from "@/player/components/MediaPlayer";

export default {
  components: {
    MediaPlayer,
    Scenario,
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
    ...mapState("media", {
      mediaPlaying: "playing",
      mediaTime: "time",
    }),

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
    }),
    ...mapGetters("components", ["getScenarios"]),
    ...mapActions("components", ["load"]),
    onMediaReady() {
      this.setMediaReady(true);
    },
    onMediaPlay() {
      this.setMediaPlaying(true);
      this.triggerMediaTimeUpdate();
    },
    onMediaPause() {
      this.setMediaPlaying(false);
      this.triggerMediaTimeUpdate(false);
    },
    onMediaStop() {
      this.setMediaPlaying(false);
      this.triggerMediaTimeUpdate(false);
    },
    onMediaSeeked() {
      if (!this.mediaPlaying) {
        this.triggerMediaTimeUpdate(false);
      }
    },
    triggerMediaTimeUpdate(loop) {
      if (loop !== false && this.mediaPlaying) {
        window.requestAnimationFrame(this.triggerMediaTimeUpdate);
      }

      this.setMediaTime(this.mediaPlayer.getTime());
    },
  },
};
</script>

<style lang="scss" scoped>
.metaScore-player {
  > .media-player {
    //display: none;
  }
}
</style>
