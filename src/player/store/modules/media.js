export default function () {
  return {
    namespaced: true,
    state: {
      time: 0,
      ready: false,
      playing: false,
    },
    getters: {},
    mutations: {
      setReady(state, ready) {
        state.ready = ready;
      },
      setPlaying(state, playing) {
        state.playing = playing;
      },
      setTime(state, time) {
        state.time = time;
      },
    },
    actions: {},
  };
}
