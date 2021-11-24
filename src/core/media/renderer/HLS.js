import Renderer from "./AbstractRenderer";
import Locale from "../../Locale";
import { escapeHTML } from "../../utils/String";

/**
 * @type {string} The hls.js CDN URL
 */
const LIB_URL = "//cdn.jsdelivr.net/npm/hls.js@latest";

/**
 * HLS renderer
 */
export default class HLS extends Renderer {
  /**
   * Check whether the renderer supports a given mime type
   *
   * @param {string} mime The mime type
   * @returns {boolean} Whether the renderer supports the given mime type
   */
  static canPlayType(mime) {
    const supported = [
      "application/mpegurl",
      "application/x-mpegurl",
      "application/vnd.apple.mpegurl",
      "application/vnd.apple.mpegurl.audio",
      "audio/mpegurl",
      "audio/x-mpegurl",
      "audio/hls",
      "video/mpegurl",
      "video/x-mpegurl",
      "video/hls",
    ];

    return supported.includes(mime.toLowerCase());
  }

  /**
   * Load the hls.js library
   *
   * @param {Function} callback The callback to invoke on load
   */
  static loadLib(callback) {
    if (this._lib_error) {
      callback(this._lib_error);
      return;
    }

    if (this._lib_loaded) {
      callback();
      return;
    }

    if (!this._lib_load_callbacks) {
      /**
       * @type {Array} The list of callbacks to invoke once the library is loaded
       */
      this._lib_load_callbacks = [];
    }

    this._lib_load_callbacks.push(callback);

    if (!this._lib_script) {
      /**
       * @type {HTMLScriptElement} The script tag used to load the library
       */
      this._lib_script = document.createElement("script");
      this._lib_script.type = "text/javascript";
      this._lib_script.async = true;

      this._lib_script.addEventListener("load", () => {
        /**
         * @type {boolean} Whether the library is loaded
         */
        this._lib_loaded = true;
        this._lib_script.remove();
        delete this._lib_script;

        this._lib_load_callbacks.forEach((fn) => {
          fn();
        });

        delete this._lib_load_callbacks;
      });

      this._lib_script.addEventListener("error", () => {
        /**
         * @type {Error} A custom error sent to loading callbacks if the library could not be loaded
         */
        this._lib_error = new Error("Could not load the HLS library");
        this._lib_script.remove();
        delete this._lib_script;

        this._lib_load_callbacks.forEach((fn) => {
          fn(this._lib_error);
        });

        delete this._lib_load_callbacks;
      });

      this._lib_script.src = LIB_URL;
      document.head.append(this._lib_script);
    }
  }

  /**
   * Get the duration of a media file from its URI
   *
   * @param {string} url The file's URL
   * @param {Function} callback The callback to invoke with a potential error and the duration
   */
  static getDurationFromURI(url, callback) {
    this.loadLib((error) => {
      if (error) {
        callback(error);
        return;
      }

      const Hls = window.Hls;

      if (Hls.isSupported()) {
        const hls = new Hls();
        const audio = new Audio();

        // @todo: replace with promises to eliminate the propability of both an error and a success being called

        hls.on(Hls.Events.ERROR, (evt) => {
          if (evt.fatal) {
            // @todo: be more specific
            const message = Locale.t(
              "core.media.renderer.HLS.getDurationFromURI.error",
              "An error occured while attempting to load the media: !url",
              { "!url": escapeHTML(url) }
            );
            console.error(evt.response.text);
            callback(new Error(message));
          }
        });

        audio.addEventListener("loadedmetadata", () => {
          callback(null, audio.duration);
        });

        hls.loadSource(url);
        hls.attachMedia(audio);
      }
    });
  }

  /**
   * @inheritdoc
   */
  constructor(configs) {
    super(configs);

    this.$el.addClass("hls");
  }

  /**
   * @inheritdoc
   */
  init() {
    this.constructor.loadLib((error) => {
      if (!error) {
        this.emit("ready");
      }
    });

    return this;
  }

  /**
   * @inheritdoc
   */
  setSource(source) {
    const Hls = window.Hls;
    const hls = new Hls();

    hls.on(Hls.Events.ERROR, this.onLibError.bind(this));

    hls.loadSource(source.url);
    hls.attachMedia(this.$el.get(0));

    return super.setSource(source);
  }

  /**
   * HLS.js library error callback
   *
   * @param {Event} evt The event object
   * @param {object} data The data associated with the event
   */
  onLibError(evt, data) {
    if (data.fatal) {
      const message = Locale.t(
        "core.media.renderer.HLS.error",
        "An error occured while attempting to read the media stream"
      );
      this.emit("error", message);
      console.error("HLS.js:", data);
    } else {
      console.warn("HLS.js:", data);
    }
  }
}
