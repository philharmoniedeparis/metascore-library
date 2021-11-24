import Dom from "../../Dom";
import Locale from "../../Locale";
import EventEmitter from "../../EventEmitter";

/**
 * A media renderer
 */
export default class AbstractRenderer extends EventEmitter {
  static defaults = {
    tag: "audio",
  };

  /**
   * Check whether the renderer supports a given mime type
   *
   * @abstract
   * @param {string} mime The mime type
   * @returns {boolean} Whether the renderer supports the given mime type
   */
  static canPlayType(mime) { // eslint-disable-line no-unused-vars
  }

  /**
   * Get the duration of a media file from its URI
   *
   * @abstract
   * @param {string} url The file's URL
   * @param {Function} callback The callback to invoke with a potential error and the duration
   */
  static getDurationFromURI(url, callback) { // eslint-disable-line no-unused-vars
  }

  /**
   * Instantiate
   *
   * @param {object} configs Custom configs to override defaults
   * @property {string} [type='audio'] The media type (audio or video)
   */
  constructor(configs) {
    super();

    /**
     * @type {object} The configuration values
     */
    this._configs = Object.assign({}, this.constructor.defaults, configs);

    /**
     * @type {boolean} Whether the renderer is playing
     */
    this._playing = false;

    /**
     * @type {object} The current source
     */
    this._source = null;

    /**
     * @type {Dom} The <video> or <audio> element
     */
    this._$el = new Dom(`<${this._configs.tag}></${this._configs.tag}/>`, {
      preload: "auto",
    })
      .on("error", this.onError.bind(this), true)
      .on("play", this.onPlay.bind(this))
      .on("pause", this.onPause.bind(this))
      .on("timeupdate", this.onTimeupdate.bind(this))
      .on("seeking", this.onSeeking.bind(this))
      .on("seeked", this.onSeeked.bind(this));
  }

  /**
   * Alias to the static method of the same name
   *
   * @param {string} mime The mime type
   * @returns {boolean} Whether the renderer supports the given mime type
   */
  canPlayType(mime) {
    return this.constructor.canPlayType(mime);
  }

  /**
   * Get the DOM element.
   *
   * @returns {Dom} The element as a Dom instance
   */
  get $el() {
    return this._$el;
  }

  /**
   * Initialize
   *
   * @fires ready
   * @returns {this} this, chainable
   */
  init() {
    /**
     * @event ready
     */
    this.emit("ready");

    return this;
  }

  /**
   * Set the media source
   *
   * @param {object} source The source to set
   * @property {string} url The source's url
   * @property {string} mime The source's mime type
   * @fires sourceset
   * @returns {this} this, chainable
   */
  setSource(source) {
    this._source = source;

    /**
     * @event sourceset
     */
    this.emit("sourceset");

    return this;
  }

  /**
   * Get the media source
   *
   * @abstract
   * @returns {object} The source
   */
  getSource() {
    return this._source;
  }

  /**
   * Get the WaveformData assiciated with the media file
   *
   * @param {Function} callback The callback to invoke
   */
  getWaveformData(callback) {
    callback(null);
  }

  /**
   * The error event handler
   *
   * @private
   * @param {Event} evt The error event
   * @fires mediaerror
   */
  onError(evt) {
    const error = evt.target.error;
    let message = "";

    switch (error.code) {
      case error.MEDIA_ERR_ABORTED:
        message = Locale.t(
          "core.media.Renderer.onError.aborted.msg",
          "You aborted the media playback."
        );
        break;

      case error.MEDIA_ERR_NETWORK:
        message = Locale.t(
          "core.media.Renderer.onError.network.msg",
          "A network error caused the media download to fail."
        );
        break;

      case error.MEDIA_ERR_DECODE:
        message = Locale.t(
          "core.media.Renderer.onError.decode.msg",
          "The media playback was aborted due to a format problem."
        );
        break;

      case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
        message = Locale.t(
          "core.media.Renderer.onError.not-supported.msg",
          "The media could not be loaded, either because the server or network failed or because the format is not supported."
        );
        break;

      default:
        message = Locale.t(
          "core.media.Renderer.onError.default.msg",
          "An unknown error occurred."
        );
        break;
    }

    /**
     * @event mediaerror
     * @type {string} The error message
     */
    this.emit("mediaerror", message);
  }

  /**
   * The play event handler
   *
   * @private
   */
  onPlay() {
    this._playing = true;
    this.emit("play");
  }

  /**
   * The pause event handler
   *
   * @private
   */
  onPause() {
    this._playing = false;
    this.emit("pause");
  }

  /**
   * The timeupdate event handler
   *
   * @private
   */
  onTimeupdate() {
    this.emit("timeupdate");
  }

  /**
   * The seeking event handler
   *
   * @private
   */
  onSeeking() {
    this.emit("seeking");
  }

  /**
   * The seeked event handler
   *
   * @private
   */
  onSeeked() {
    this.emit("seeked");
  }

  /**
   * Check whether the media is playing
   *
   * @returns {boolean} Whether the media is playing
   */
  get playing() {
    return this._playing;
  }

  /**
   * Set the media time
   *
   * @param {number} value The time in seconds
   */
  set time(value) {
    this.$el.get(0).currentTime = value;
  }

  /**
   * Get the current media time
   *
   * @returns {number} The time in seconds
   */
  get time() {
    return this.$el.get(0).currentTime;
  }

  /**
   * Get the media's duration
   *
   * @returns {number} The duration in seconds
   */
  get duration() {
    return this.$el.get(0).duration;
  }

  /**
   * Get the media's buffered time ranges
   *
   * @returns {Array} An array of arrays, each containing a time range
   */
  get buffered() {
    const dom = this.$el.get(0);
    const buffered = [];

    for (let i = 0; i < dom.buffered.length; i++) {
      const start_x = dom.buffered.start(i);
      const end_x = dom.buffered.end(i);

      buffered.push([start_x, end_x]);
    }

    return buffered;
  }

  /**
   * Play the media
   *
   * @returns {this} this, chainable
   */
  play() {
    const promise = this.$el.get(0).play();

    if (typeof promise !== "undefined") {
      promise.catch((error) => {
        console.error(error);
        console.warn(
          'Play was prevented by the browser. If using the metaScore API, make sure to add allow="autoplay" to the player\'s iframe. See https://github.com/w3c/webappsec-feature-policy/blob/master/features.md for more information.'
        );
      });
    }

    return this;
  }

  /**
   * Pause the media
   *
   * @returns {this} this, chainable
   */
  pause() {
    this.$el.get(0).pause();

    return this;
  }

  /**
   * Stop the media
   *
   * @returns {this} this, chainable
   */
  stop() {
    this.pause().setTime(0);

    return this;
  }
}
