import { formatTime } from "../../../core/utils/Media";

export default function () {
  return {
    namespaced: true,
    state: {
      ready: false,
      time: 0,
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