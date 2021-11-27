export default function () {
  return {
    namespaced: true,
    state: {
      ready: false,
      playing: false,
      time: 0,
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
