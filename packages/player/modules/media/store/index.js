import { defineStore } from "pinia";
import { formatTime } from "@metascore-library/core/utils/media";

export default defineStore("media", {
  state: () => {
    return {
      useRequestAnimationFrame: true,
      source: null,
      element: null,
      ready: false,
      time: 0,
      duration: 0,
      playing: false,
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
    setSource(value) {
      this.source = value;
    },
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
          this.updateTime();
        });
        element.addEventListener("pause", () => {
          this.playing = false;
          this.updateTime(false);
        });
        element.addEventListener("stop", () => {
          this.playing = false;
          this.updateTime(false);
        });
        element.addEventListener("timeupdate", (evt) => {
          if (!this.useRequestAnimationFrame) {
            this.time = evt.target.currentTime;
          }
        });
        element.addEventListener("seeked", () => {
          if (!this.playing) {
            this.updateTime(false);
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
        this.element.stop();
      }
    },
    seekTo(time) {
      this.element.currentTime = time;
    },
    updateTime(repeat = true) {
      if (!this.useRequestAnimationFrame) {
        return;
      }

      this.time = this.element.currentTime;

      if (repeat !== false && this.playing) {
        window.requestAnimationFrame(() => {
          this.updateTime();
        });
      }
    },
  },
});
