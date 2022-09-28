import NativeRenderer from "./Native";

const SUPPORTED_TYPES = ["application/dash+xml"];

export default class Dash extends NativeRenderer {
  /**
   * Check whether the renderer supports a given mime type
   *
   * @param {String} mime The mime type
   * @return {Boolean} Whether the renderer supports the given mime type
   */
  static canPlayType(mime) {
    return SUPPORTED_TYPES.includes(mime.toLowerCase());
  }

  async mount(url, el) {
    const { MediaPlayer: DashJSMediaPlayer } = await import("dashjs");
    this._dash = DashJSMediaPlayer().create();

    this._dash.on(DashJSMediaPlayer.events.ERROR, (evt) => {
      console.error(evt);

      switch (evt.error.code) {
        // See https://github.com/Dash-Industry-Forum/dash.js/issues/1475
        case DashJSMediaPlayer.errors.DOWNLOAD_ERROR_ID_MANIFEST_CODE:
        case DashJSMediaPlayer.errors.DOWNLOAD_ERROR_ID_INITIALIZATION_CODE:
        case DashJSMediaPlayer.errors.DOWNLOAD_ERROR_ID_CONTENT_CODE:
        case DashJSMediaPlayer.errors.MANIFEST_ERROR_ID_PARSE_CODE:
        case DashJSMediaPlayer.errors.MANIFEST_ERROR_ID_NOSTREAMS_CODE:
        case DashJSMediaPlayer.errors.MEDIASOURCE_TYPE_UNSUPPORTED_CODE:
          el.dispatchEvent(
            new ErrorEvent("error", {
              error: evt.error,
              message: evt.error.message,
            })
          );
      }
    });

    this._dash.initialize(el, url, false);
  }

  unmount() {
    if (this._dash) {
      this._dash.destroy();
      this._dash = null;
    }
  }
}
