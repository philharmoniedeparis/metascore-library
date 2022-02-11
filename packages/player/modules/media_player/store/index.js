import { formatTime } from "@metascore-library/core/utils/media";

export default {
  namespaced: true,
  state: {
    sources: [],
    ready: false,
    time: 0,
    duration: 0,
    playing: false,
  },
  getters: {
    formattedTime(state) {
      return formatTime(state.time);
    },
  },
  mutations: {
    setReady(state, ready) {
      state.ready = ready;
    },
    setSources(state, sources) {
      state.sources = sources;
    },
    setTime(state, time) {
      state.time = time;
    },
    setDuration(state, duration) {
      state.duration = duration;
    },
    setPlaying(state, playing) {
      state.playing = playing;
    },
  },
  actions: {},
};
