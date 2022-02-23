<i18n>
{
  "en": {
    "buttons": {
      "rewind": "Rewind",
      "pause": "Pause",
      "play": "Play",
    }
  },
  "fr": {
    "buttons": {
      "rewind": "Rembobiner",
      "pause": "Pause",
      "play": "Jouer",
    }
  },
}
</i18n>

<template>
  <div class="playback-controller">
    <button type="button" class="rewind" @click="onRewindClick">
      <span aria-hidden="true"><rewind-icon class="icon" /></span>
      <span class="sr-only">{{ $t("buttons.rewind") }}</span>
    </button>

    <button
      v-if="mediaPlaying"
      type="button"
      class="pause"
      @click="onPauseClick"
    >
      <span aria-hidden="true"><pause-icon class="icon" /></span>
      <span class="sr-only">{{ $t("buttons.pause") }}</span>
    </button>
    <button v-else type="button" class="play" @click="onPlayClick">
      <span aria-hidden="true"><play-icon class="icon" /></span>
      <span class="sr-only">{{ $t("buttons.play") }}</span>
    </button>
  </div>
</template>

<script>
import { useStore } from "@metascore-library/core/modules/manager";
import PlayIcon from "../assets/icons/play.svg?inline";
import PauseIcon from "../assets/icons/pause.svg?inline";
import RewindIcon from "../assets/icons/rewind.svg?inline";

export default {
  components: {
    PlayIcon,
    PauseIcon,
    RewindIcon,
  },
  setup() {
    const mediaStore = useStore("media");
    return { mediaStore };
  },
  computed: {
    mediaPlaying() {
      return this.mediaStore.playing;
    },
  },
  methods: {
    playMedia() {
      this.mediaStore.play();
    },
    pauseMedia() {
      this.mediaStore.pause();
    },
    seekMediaTo(time) {
      this.mediaStore.seekTo(time);
    },
    onRewindClick() {
      this.seekMediaTo(0);
    },
    onPlayClick() {
      this.playMedia();
    },
    onPauseClick() {
      this.pauseMedia();
    },
  },
};
</script>

<style lang="scss" scoped>
.playback-controller {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-content: space-evenly;
  align-items: center;
  flex: 1 1 auto;

  button {
    &.rewind {
      width: 2em;
      margin-right: 0.5em;
      padding: 0.5em;
      color: $white;
      filter: drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.75));

      &:active {
        filter: drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.25));
      }
    }

    &.play,
    &.pause {
      width: 4em;
      height: 4em;
      margin-right: 2.5em;
      padding: 1.5em;
      background: $white;
      color: $mediumgray;
      border-radius: 50%;
      box-shadow: 0 0 1em 0 rgba(0, 0, 0, 0.5);

      &:active {
        box-shadow: 0 0 0.5em 0 rgba(0, 0, 0, 0.25);
      }
    }
  }
}
</style>
