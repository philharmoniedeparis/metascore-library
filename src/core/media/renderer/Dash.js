import Renderer from "./AbstractRenderer";
import Locale from "../../Locale";
import { escapeHTML } from "../../utils/String";

/**
 * @type {string} The dash.js CDN URL
 */
const LIB_URL = "//cdn.dashjs.org/latest/dash.all.min.js";

/**
 * Dash renderer
 */
export default class Dash extends Renderer {
  /**
   * Check whether the renderer supports a given mime type
   *
   * @param {string} mime The mime type
   * @returns {boolean} Whether the renderer supports the given mime type
   */
  static canPlayType(mime) {
    const supported = ["application/dash+xml"];

    return supported.includes(mime.toLowerCase());
  }

  /**
   * Load the dash.js library
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
        this._lib_error = new Error("Could not load the Dash library");
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

      const DashJS = window.dashjs.MediaPlayer;
      const dash = DashJS().create();
      const audio = new Audio();

      // @todo: replace with promises to eliminate the propability of both an error and a success being called

      dash.on(DashJS.events.ERROR, (evt) => {
        if (this.isErrorFatal(evt)) {
          // @todo: be more specific
          const message = Locale.t(
            "core.media.renderer.Dash.getDurationFromURI.error",
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

      dash.initialize(audio, url, false);
    });
  }

  /**
   * Check if an error event should be considered fatal
   *
   * @param {Event} evt The error event
   * @returns {boolean} True if it should be considered fatal, false otherwise
   */
  static isErrorFatal(evt) {
    // See https://github.com/Dash-Industry-Forum/dash.js/issues/1475
    if (evt.error === "download") {
      if (
        "event" in evt &&
        ["manifest", "initialization", "content"].includes(evt.event.id)
      ) {
        return true;
      }
    } else if (evt.error === "manifestError") {
      if (
        "event" in evt &&
        ["parse", "nostreams", "codec"].includes(evt.event.id)
      ) {
        return true;
      }
    } else if (evt.error === "mediasource") {
      return true;
    }

    return false;
  }

  /**
   * @inheritdoc
   */
  constructor(configs) {
    super(configs);

    this.$el.addClass("dash");
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
    const DashJS = window.dashjs.MediaPlayer;
    const dash = DashJS().create();

    dash.on(DashJS.events.ERROR, this.onLibError.bind(this));

    dash.initialize(this.$el.get(0), source.url, false);

    return super.setSource(source);
  }

  /**
   * Dash.js library error callback
   *
   * @param {Event} evt The event object
   */
  onLibError(evt) {
    const fatal = this.constructor.isErrorFatal(evt);

    if (fatal) {
      const message = Locale.t(
        "core.media.renderer.Dash.error",
        "An error occured while attempting to read the media stream"
      );
      this.emit("error", message);
      console.error(`Dash.js:`, evt);
    } else {
      console.warn(`Dash.js:`, evt);
    }
  }
}
