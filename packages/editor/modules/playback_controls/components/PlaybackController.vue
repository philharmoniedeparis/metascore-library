<i18n>
{
  "fr": {
    "rewind": {
      "label": "rembobiner",
    },
    "pause": {
      "label": "suspendre la lecture",
    },
    "play": {
      "label": "lancer la lecture",
    },
    "playbackrate": {
      "label": "vitesse de lecture",
      "dropdown_heading": "Vitesse de lecture",
      "default_value_label": "Normal",
    },
    "hotkey": {
      "group": "Général",
      "space": "Lancer/arrêter la lecture",
    },
  },
  "en": {
    "rewind": {
      "label": "rewind",
    },
    "pause": {
      "label": "pause playback",
    },
    "play": {
      "label": "start playback",
    },
    "playbackrate": {
      "label": "playback speed",
      "dropdown_heading": "Playback speed",
      "default_value_label": "Normal",
    },
    "hotkey": {
      "group": "General",
      "space": "Play/pause",
    },
  }
}
</i18n>

<template>
  <div v-hotkey.prevent="hotkeys" class="playback-controller">
    <div class="left">
      <base-button
        type="button"
        class="rewind"
        :aria-label="$t('rewind.label')"
        @click="onRewindClick"
      >
        <template #icon><rewind-icon /></template>
      </base-button>
    </div>

    <div class="center">
      <base-button
        v-if="mediaPlaying"
        type="button"
        class="pause"
        :aria-label="$t('pause.label')"
        @click="onPauseClick"
      >
        <template #icon><pause-icon /></template>
      </base-button>
      <base-button
        v-else
        type="button"
        class="play"
        :aria-label="$t('play.label')"
        @click="onPlayClick"
      >
        <template #icon><play-icon /></template>
      </base-button>

      <dropdown-button-control
        v-model="playbackRate"
        :options="playbackRateOptions"
        :aria-label="$t('playbackrate.label')"
        class="playback-rate"
      >
        <template #label>{{ formattedPlaybackRate }}</template>
        <template #dropdownHeading>
          <h2 class="playback-rate--dropdown-heading">
            {{ $t("playbackrate.dropdown_heading") }}
          </h2>
        </template>
      </dropdown-button-control>
    </div>

    <div class="right"></div>
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
      playbackRate: mediaPlaybackRate,
      setPlaybackRate: setMediaPlaybackRate,
    } = useModule("media_player");
    return {
      mediaPlaying,
      playMedia,
      pauseMedia,
      seekMediaTo,
      mediaPlaybackRate,
      setMediaPlaybackRate,
    };
  },
  data() {
    return {
      numberFormatter: null,
    };
  },
  computed: {
    playbackRate: {
      get() {
        return this.mediaPlaybackRate;
      },
      set(value) {
        this.setMediaPlaybackRate(value);
      },
    },
    formattedPlaybackRate() {
      return this.formatPlaybackRate(this.playbackRate);
    },
    playbackRateOptions() {
      return [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => {
        return {
          label:
            rate === 1
              ? this.$t("playbackrate.default_value_label")
              : this.formatPlaybackRate(rate),
          value: rate,
        };
      });
    },
    hotkeys() {
      return {
        group: this.$t("hotkey.group"),
        keys: {
          space: {
            handler: ({ repeat }) => {
              if (repeat) return;

              if (this.mediaPlaying) this.pauseMedia();
              else this.playMedia();
            },
            description: this.$t("hotkey.space"),
          },
        },
      };
    },
  },
  created() {
    this.numberFormatter = new Intl.NumberFormat(this.$i18n.locale);
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
    formatPlaybackRate(value) {
      const rate = this.numberFormatter.format(value);
      return `${rate}x`;
    },
  },
};
</script>

<style lang="scss" scoped>
.playback-controller {
  display: flex;
  padding: 1em;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: center;
  flex: 1 1 auto;

  > .center {
    position: relative;
  }

  > .right {
    width: 2em;
  }

  button {
    opacity: 1;

    &.rewind {
      width: 2em;
      padding: 0.5em;
      color: var(--metascore-color-text-secondary);
      filter: drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.25));

      &:hover {
        color: var(--metascore-color-text-primary);
      }

      &:active {
        filter: drop-shadow(0 0 0.25em rgba(0, 0, 0, 0.5));
      }
    }

    &.play,
    &.pause {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 4em;
      height: 4em;
      background: var(--metascore-color-text-secondary);
      color: var(--metascore-color-bg-secondary);
      border-radius: 50%;
      box-shadow: 0 0 1em 0 rgba(0, 0, 0, 0.25);
      z-index: 1;

      .icon {
        width: 1.5em;
      }

      &:hover {
        background: var(--metascore-color-text-primary);
      }

      &:active {
        box-shadow: 0 0 0.5em 0 rgba(0, 0, 0, 0.5);
      }
    }
  }

  .playback-rate {
    position: absolute;
    bottom: 0;
    right: 0;
    margin: 0;

    :deep(.input-wrapper) {
      > button {
        width: 3em;
        height: 3em;
        margin-bottom: -1em;
        margin-right: -1.5em;
        padding: 0;
        font-size: 0.75em;
        justify-content: center;
        background: var(--metascore-color-bg-secondary);
        border-radius: 50%;
        opacity: 1;

        &:hover {
          background: var(--metascore-color-bg-tertiary);
        }
      }
    }

    &:hover {
      z-index: 1;
    }
  }
}

.playback-rate--dropdown-heading {
  margin: 0;
  padding: 0.5em;
  font-size: 1em;
  border-bottom: 2px solid var(--metascore-color-bg-primary);
  user-select: none;
}
</style>
