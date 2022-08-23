import { defineStore } from "pinia";
import { formatTime } from "@metascore-library/core/utils/media";

export default defineStore("media_player", {
  state: () => {
    return {
      ready: false,
      useRequestAnimationFrame: true,
      source: null,
      element: null,
      time: 0,
      duration: 0,
      playing: false,
      seeking: false,
      type: null,
      width: null,
      height: null,
      buffered: [],
    };
  },
  getters: {
    formattedTime() {
      return formatTime(this.time);
    },
  },
  actions: {
    initElement(element) {
      this.element = element;

      if (element) {
        this.type = element instanceof HTMLVideoElement ? "video" : "audio";

        element.addEventListener("loadedmetadata", (evt) => {
          this.ready = true;
          this.width = this.type === "video" ? element.videoWidth : null;
          this.height = this.type === "video" ? element.videoHeight : null;
          this.duration = evt.target.duration;
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
            this.time = evt.target.currentTime;
          }
        });
        element.addEventListener("seeking", () => {
          this.seeking = true;
        });
        element.addEventListener("seeked", () => {
          this.seeking = false;
          if (!this.playing) {
            this.updateTime();
          }
        });
        element.addEventListener("progress", (evt) => {
          const buffered = [];

          for (let i = 0; i < evt.target.buffered.length; i++) {
            const start_x = evt.target.buffered.start(i);
            const end_x = evt.target.buffered.end(i);

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
    setSource(source) {
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
      if (this.element) {
        this.element.pause();
      }
    },
    stop() {
      if (this.element) {
        this.pause();
        this.seekTo(0);
      }
    },
    seekTo(time) {
      // Set the "seeking" flag to true,
      // as the "seeking" event is sometimes triggered too late.
      this.seeking = true;

      this.element.currentTime = time;
    },
    updateTime(repeat = false) {
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
          const key = name.slice(3, 4).toLowerCase() + name.slice(4);
          const oldValue = this[key];
          after(() => {
            const newValue = this[key];
            push({
              undo: () => {
                this[name](oldValue);
              },
              redo: () => {
                this[name](newValue);
              },
            });
          });
        }
        break;
    }
  },
});
