export default function () {
  return {
    namespaced: true,
    state: {
      ready: false,
      time: 0,
      playing: false,
    },
    getters: {},
    mutations: {
      setReady(state, ready) {
        state.ready = ready;
      },
      setTime(state, time) {
        state.time = time;
      },
      setPlaying(state, playing) {
        state.playing = playing;
      },
    },
    actions: {},
  };
}
