import { defineStore } from "pinia";
import { formatTime } from "../utils/media";

export interface Source {
  id: number
  name: string
  mime: string
  source: 'upload'|'url'
  url: string
  type: 'audio'|'video'
  size: number
  audiowaveform?: string
}

export default defineStore("media-player", {
  state: () => {
    return {
      ready: false,
      dataLoaded: false,
      useRequestAnimationFrame: true,
      source: null as Source|null,
      element: null as HTMLAudioElement|HTMLVideoElement|null,
      time: 0,
      duration: 0,
      playing: false,
      seeking: false,
      playbackRate: 1,
      type: null as "audio"|"video"|null,
      width: null as number|null,
      height: null as number|null,
      buffered: [] as number[][],
    };
  },
  getters: {
    formattedTime(state): string {
      return formatTime(state.time);
    },
  },
  actions: {
    initElement(element: HTMLMediaElement|null) {
      this.element = element;

      if (element) {
        this.type =
          element instanceof element.ownerDocument.defaultView!.HTMLVideoElement
            ? "video"
            : "audio";

        element.addEventListener("loadedmetadata", (evt) => {
          this.ready = true;
          this.width = this.type === "video" ? (element as HTMLVideoElement).videoWidth : null;
          this.height = this.type === "video" ? (element as HTMLVideoElement).videoHeight : null;
          this.duration = (evt.target as HTMLMediaElement).duration;
        });
        element.addEventListener("loadeddata", () => {
          this.dataLoaded = true;
        });
        element.addEventListener("play", () => {
          this.playing = true;
          this.updateTime(true);
        });
        element.addEventListener("pause", () => {
          this.playing = false;
          this.updateTime();
        });
        element.addEventListener("stop", () => {
          this.playing = false;
          this.updateTime();
        });
        element.addEventListener("timeupdate", (evt) => {
          if (!this.useRequestAnimationFrame) {
            this.time = (evt.target as HTMLMediaElement).currentTime;
          }
        });
        element.addEventListener("seeking", () => {
          this.seeking = true;
        });
        element.addEventListener("ratechange", (evt) => {
          this.playbackRate = (evt.target as HTMLMediaElement).playbackRate;
        });
        element.addEventListener("seeked", () => {
          this.seeking = false;
          if (!this.playing) {
            this.updateTime();
          }
        });
        element.addEventListener("progress", (evt) => {
          const buffered = [];
          const target = (evt.target as HTMLMediaElement)

          for (let i = 0; i < target.buffered.length; i++) {
            const start_x = target.buffered.start(i);
            const end_x = target.buffered.end(i);

            buffered.push([start_x, end_x]);
          }

          this.buffered = buffered;
        });
      } else {
        this.type = null;
        this.width = null;
        this.height = null;
      }
    },
    setSource(source: Source|null) {
      this.ready = false;
      this.source = source;
      this.time = 0;
      this.duration = 0;
      this.playing = false;
      this.width = null;
      this.height = null;
      this.buffered = [];
    },
    play() {
      if (this.element) {
        const promise = this.element.play();

        if (typeof promise !== "undefined") {
          promise.catch((error) => {
            console.error(error);
            console.warn(
              "Play was prevented by the browser. If using the metaScore API, make sure to add allow='autoplay' to the player's iframe. See https://github.com/w3c/webappsec-feature-policy/blob/master/features.md for more information."
            );
          });
        }
      }
    },
    pause() {
      if (!this.element) return;
      this.element.pause();
    },
    stop() {
      if (!this.element) return;

      this.pause();
      this.seekTo(0);
    },
    seekTo(time: number) {
      if (!this.element) return;

      // Set the "seeking" flag to true,
      // as the "seeking" event is sometimes triggered too late.
      this.seeking = true;
      this.element.currentTime = time;
      // Force a time update in case media not playing.
      this.updateTime();
    },
    setPlaybackRate(rate: number) {
      if (!this.element) return;
      this.element.playbackRate = rate;
    },
    updateTime(repeat = false) {
      if (!this.element) return;

      this.time = this.element.currentTime;

      if (this.useRequestAnimationFrame && repeat && this.playing) {
        window.requestAnimationFrame(() => {
          this.updateTime(true);
        });
      }
    },
  },
  history(context) {
    const {
      name, // Invoked action's name.
      after, // Hook called after the action executes.
      push, // Method to push an undo/redo item to the history.
    } = context;

    switch (name) {
      case "setSource":
        {
          const key = "source";
          const oldValue = this[key];
          after(() => {
            const newValue = this[key];
            push({
              undo: () => {
                this.setSource(oldValue);
              },
              redo: () => {
                this.setSource(newValue);
              },
            });
          });
        }
        break;
    }
  },
});
