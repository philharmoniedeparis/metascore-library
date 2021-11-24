import AbstractRenderer from "./AbstractRenderer";
import { escapeHTML } from "../../utils/String";
import Ajax from "../../Ajax";
import Locale from "../../Locale";
import WaveformData from "waveform-data";

/**
 * HTML5 renderer
 *
 * @fires loadedmetadata Fired when the metadata has loaded
 * @param {object} renderer The renderer instance
 */
export default class HTML extends AbstractRenderer {
  /**
   * Check whether the renderer supports a given mime type
   *
   * @param {string} mime The mime type
   * @returns {boolean} Whether the renderer supports the given mime type
   */
  static canPlayType(mime) {
    const audio = new Audio();
    return audio.canPlayType(mime);
  }

  /**
   * Get the duration of a media file from its URI
   *
   * @param {string} url The file's URL
   * @param {Function} callback The callback to invoke with a potential error and the duration
   */
  static getDurationFromURI(url, callback) {
    const audio = new Audio();

    // @todo: replace with promises to eliminate the propability of both an error and a success being called

    audio.addEventListener("error", () => {
      const message = Locale.t(
        "core.media.Renderer.getDurationFromURI.error",
        "An error occured while attempting to load the media: !url",
        { "!url": escapeHTML(url) }
      );
      callback(new Error(message));
    });

    audio.addEventListener("loadedmetadata", () => {
      callback(null, audio.duration);
    });

    audio.src = url;
  }

  /**
   * @inheritdoc
   */
  setSource(source) {
    delete this.waveformdata;
    if (this._waveformdata_ajax) {
      this._waveformdata_ajax.abort();
      delete this._waveformdata_ajax;
    }

    this.$el.attr("src", source.url);

    this.$el.get(0).load();

    return super.setSource(source);
  }

  /**
   * Get the WaveformData assiciated with the media file
   *
   * @param {Function} callback The callback to invoke
   */
  getWaveformData(callback) {
    if (this.waveformdata) {
      callback(this.waveformdata);
      return;
    }

    if (!this._waveformdata_ajax) {
      const source = this.getSource();

      if (source) {
        const from_web_audio = !("audiowaveform" in source);

        /**
         * @type {Ajax} The ajax instance used to load the waveform data
         */
        this._waveformdata_ajax = Ajax.GET(
          from_web_audio ? source.url : source.audiowaveform,
          {
            responseType: "arraybuffer",
            onSuccess: (evt) => {
              const response = evt.target.getResponse();

              if (!response) {
                /**
                 * @type {WaveformData} The associated waveform data
                 */
                this.waveformdata = null;
                this.emit("waveformdataloaded", this.waveformdata);
                delete this._waveformdata_ajax;
                return;
              }

              if (from_web_audio) {
                const options = {
                  audio_context: new AudioContext(),
                  array_buffer: response,
                };
                WaveformData.createFromAudio(options, (err, waveform) => {
                  this.waveformdata = err ? null : waveform;
                  this.emit("waveformdataloaded", this.waveformdata);
                  delete this._waveformdata_ajax;
                });
              } else {
                this.waveformdata = WaveformData.create(response);
                this.emit("waveformdataloaded", this.waveformdata);
                delete this._waveformdata_ajax;
              }
            },
            onError: () => {
              this.waveformdata = null;
              this.emit("waveformdataloaded", this.waveformdata);
              delete this._waveformdata_ajax;
            },
          }
        );
      }
    }

    if (this._waveformdata_ajax) {
      this.once("waveformdataloaded", (evt) => {
        callback(evt.detail.data);
      });
    } else {
      callback(null);
    }
  }
}
