<template>
  <div v-hotkey="hotkeys" class="playback-controller">
    <styled-button type="button" class="rewind" @click="onRewindClick">
      <template #icon><rewind-icon /></template>
    </styled-button>

    <styled-button
      v-if="mediaPlaying"
      type="button"
      class="pause"
      @click="onPauseClick"
    >
      <template #icon><pause-icon /></template>
    </styled-button>

    <styled-button v-else type="button" class="play" @click="onPlayClick">
      <template #icon><play-icon /></template>
    </styled-button>
  </div>
</template>

<script>
import { useModule } from "@metascore-library/core/services/module-manager";
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
    const {
      playing: mediaPlaying,
      play: playMedia,
      pause: pauseMedia,
      seekTo: seekMediaTo,
    } = useModule("media_player");
    return { mediaPlaying, playMedia, pauseMedia, seekMediaTo };
  },
  computed: {
    hotkeys() {
      return {
        space: () => {
          if (this.mediaPlaying) {
            this.pauseMedia();
          } else {
            this.playMedia();
          }
        },
      };
    },
  },
  methods: {
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
      filter: drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.75));

      &:active {
        filter: drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.25));
      }
    }

    &.play,
    &.pause {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 4em;
      height: 4em;
      margin-right: 2.5em;
      padding: 0;
      background: $white;
      color: $mediumgray;
      border-radius: 50%;
      box-shadow: 0 0 1em 0 rgba(0, 0, 0, 0.5);

      .icon {
        width: 1.5em;
      }

      &:active {
        box-shadow: 0 0 0.5em 0 rgba(0, 0, 0, 0.25);
      }
    }
  }
}
</style>
