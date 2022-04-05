import { defineStore } from "pinia";
import { markRaw } from "vue";
import WaveformData from "waveform-data";
import { load } from "@metascore-library/core/services/ajax";

export default defineStore("waveform", {
  state: () => {
    return {
      loading: false,
      data: null,
      error: false,
      range: 0,
      offset: {
        start: 0,
        end: 0,
      },
      minScale: 0,
      maxScale: 0,
      scale: 0,
    };
  },
  actions: {
    setData(data) {
      if (data) {
        this.data = markRaw(data);

        let range = 0;
        const channel = data.channel(0);
        for (let index = 0; index < data.length; index++) {
          const min = channel.min_sample(index);
          const max = channel.max_sample(index);
          range = Math.max(range, Math.abs(min), Math.abs(max));
        }

        this.range = range;
      } else {
        this.data = null;
      }
    },
    async load({ audiowaveform, url }) {
      this.loading = true;

      if (!audiowaveform && !url) {
        throw Error("Source doen't have a url or audiowaveform key");
      }

      const from_web_audio = !audiowaveform;

      load(from_web_audio ? url : audiowaveform, {
        responseType: "arraybuffer",
      })
        .then((data) => {
          if (!data) {
            this.setData(null);
          }

          if (from_web_audio) {
            const options = {
              audio_context: new AudioContext(),
              array_buffer: data,
            };
            WaveformData.createFromAudio(options, (err, waveform) => {
              this.setData(err ? null : waveform);
            });
          } else {
            this.setData(WaveformData.create(data));
          }
        })
        .catch((e) => {
          this.setData(null);
          this.error = true;
          console.error(e);
        })
        .finally(() => {
          this.loading = false;
        });
    },
  },
});
