import { formatTime } from "@metascore-library/core/utils/media";

export default {
  namespaced: true,
  state: {
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
  },
  getters: {
    formattedTime(state) {
      return formatTime(state.time);
    },
  },
  mutations: {
    setSource(state, source) {
      state.source = source;
    },
    _setElement(state, element) {
      state.element = element;
    },
    _setType(state, type) {
      state.type = type;
    },
    _setReady(state, ready) {
      state.ready = ready;
    },
    _setWidth(state, width) {
      state.width = width;
    },
    _setHeight(state, height) {
      state.height = height;
    },
    _setDuration(state, duration) {
      state.duration = duration;
    },
    _setPlaying(state, playing) {
      state.playing = playing;
    },
    _setTime(state, time) {
      state.time = time;
    },
  },
  actions: {
    initElement({ state, commit, dispatch }, element) {
      commit("_setElement", element);

      if (element) {
        const type = element instanceof HTMLVideoElement ? "video" : "audio";

        commit("_setType", type);

        element.addEventListener("loadedmetadata", (evt) => {
          commit("_setReady", true);
          commit("_setWidth", type === "video" ? element.videoWidth : null);
          commit("_setHeight", type === "video" ? element.videoHeight : null);
          commit("_setDuration", evt.target.duration);
        });
        element.addEventListener("play", () => {
          commit("_setPlaying", true);
          dispatch("_updateTime");
        });
        element.addEventListener("pause", () => {
          commit("_setPlaying", false);
          dispatch("_updateTime", false);
        });
        element.addEventListener("stop", () => {
          commit("_setPlaying", false);
          dispatch("_updateTime", false);
        });
        element.addEventListener("timeupdate", (evt) => {
          if (!state.useRequestAnimationFrame) {
            commit("_setTime", evt.target.currentTime);
          }
        });
        element.addEventListener("seeked", () => {
          if (!state.playing) {
            dispatch("_updateTime", false);
          }
        });
        element.addEventListener("progress", (evt) => {
          const buffered = [];

          for (let i = 0; i < evt.target.buffered.length; i++) {
            const start_x = evt.target.buffered.start(i);
            const end_x = evt.target.buffered.end(i);

            buffered.push([start_x, end_x]);
          }

          state.buffered = buffered;
        });
      } else {
        commit("_setType", null);
        commit("_setWidth", null);
        commit("_setHeight", null);
      }
    },
    play({ state }) {
      if (state.element) {
        const promise = state.element.play();

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
    pause({ state }) {
      if (state.element) {
        state.element.pause();
      }
    },
    stop({ state }) {
      if (state.element) {
        state.element.stop();
      }
    },
    seekTo({ state }, time) {
      state.element.currentTime = time;
    },
    _updateTime({ state, commit, dispatch }, repeat = true) {
      if (!state.useRequestAnimationFrame) {
        return;
      }

      commit("_setTime", state.element.currentTime);

      if (repeat !== false && state.playing) {
        window.requestAnimationFrame(() => {
          dispatch("_updateTime");
        });
      }
    },
  },
};
