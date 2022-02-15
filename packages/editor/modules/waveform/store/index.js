import WaveformData from "waveform-data";
import axios from "axios";

export default {
  namespaced: true,
  state: {
    data: null,
    range: 0,
    offset: {
      start: null,
      end: null,
    },
    scale: null,
    minScale: null,
    maxScale: null,
  },
  mutations: {
    _setData(state, data) {
      state.data = data;

      if (data) {
        let range = 0;
        const channel = data.channel(0);
        for (let index = 0; index < data.length; index++) {
          const min = channel.min_sample(index);
          const max = channel.max_sample(index);
          range = Math.max(range, Math.abs(min), Math.abs(max));
        }

        state.range = range;
      }
    },
    setOffset(state, { start, end }) {
      state.offset = { start, end };
    },
    setScale(state, value) {
      state.scale = value;
    },
    setMinScale(state, value) {
      state.minScale = value;
    },
    setMaxScale(state, value) {
      state.maxScale = value;
    },
  },
  actions: {
    async load({ commit }, { source }) {
      if (!("audiowaveform" in source || "url" in source)) {
        throw Error("Source doen't have a url or audiowaveform key");
      }

      const from_web_audio = !("audiowaveform" in source);

      axios({
        url: from_web_audio ? source.url : source.audiowaveform,
        method: "get",
        responseType: "arraybuffer",
      })
        .then((response) => {
          if (!response.data) {
            commit("_setData", null);
          }

          if (from_web_audio) {
            const options = {
              audio_context: new AudioContext(),
              array_buffer: response.data,
            };
            WaveformData.createFromAudio(options, (err, waveform) => {
              commit("_setData", err ? null : waveform);
            });
          } else {
            commit("_setData", WaveformData.create(response.data));
          }
        })
        .catch((e) => {
          commit("_setData", null);
          console.error(e);
        });
    },
  },
};
