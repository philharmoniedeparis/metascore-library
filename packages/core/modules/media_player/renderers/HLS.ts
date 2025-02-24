import type Hls from "hls.js";
import NativeRenderer from "./Native";

const SUPPORTED_TYPES = [
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

export class UnsupportedError extends Error {
  constructor() {
    super("HLS playback is not supported.");
  }
}

export default class HLS extends NativeRenderer {

  _hls: Hls|null = null

  /**
   * Check whether the renderer supports a given mime type
   *
   * @param mime The mime type
   * @return Whether the renderer supports the given mime type
   */
  static canPlayType(mime: string) {
    return SUPPORTED_TYPES.includes(mime.toLowerCase());
  }

  async mount(url: string, el: HTMLMediaElement) {
    const { default: Hls } = await import("hls.js");

    if (!Hls.isSupported()) {
      throw new UnsupportedError();
    }

    this._hls = new Hls();

    this._hls.on(Hls.Events.ERROR, (type, evt) => {
      console.error(evt);

      if (evt.fatal) {
        const error_event = new ErrorEvent("error", {
          error: evt,
        });
        el.dispatchEvent(error_event);
      }
    });

    this._hls.loadSource(url);
    this._hls.attachMedia(el);
  }

  unmount() {
    if (this._hls) {
      this._hls.detachMedia();
      this._hls = null;
    }
  }
}
