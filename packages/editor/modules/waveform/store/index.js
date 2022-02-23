import WaveformData from "waveform-data";
import axios from "axios";

export default {
  state: () => {
    return {
      data: null,
      range: 0,
      offset: {
        start: null,
        end: null,
      },
      scale: null,
      minScale: null,
      maxScale: null,
    };
  },
  actions: {
    _setData(data) {
      this.data = data;

      if (data) {
        let range = 0;
        const channel = data.channel(0);
        for (let index = 0; index < data.length; index++) {
          const min = channel.min_sample(index);
          const max = channel.max_sample(index);
          range = Math.max(range, Math.abs(min), Math.abs(max));
        }

        this.range = range;
      }
    },
    async load({ audiowaveform, url }) {
      if (!audiowaveform && !url) {
        throw Error("Source doen't have a url or audiowaveform key");
      }

      const from_web_audio = !audiowaveform;

      axios({
        url: from_web_audio ? url : audiowaveform,
        method: "get",
        responseType: "arraybuffer",
      })
        .then((response) => {
          if (!response.data) {
            this._setData(null);
          }

          if (from_web_audio) {
            const options = {
              audio_context: new AudioContext(),
              array_buffer: response.data,
            };
            WaveformData.createFromAudio(options, (err, waveform) => {
              this._setData(err ? null : waveform);
            });
          } else {
            this._setData(WaveformData.create(response.data));
          }
        })
        .catch((e) => {
          this._setData(null);
          console.error(e);
        });
    },
  },
};
