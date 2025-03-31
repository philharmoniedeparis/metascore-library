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

  #hls?:Hls

  /**
   * Check whether the renderer supports a given mime type
   */
  static canPlayType(mime: string) {
    return SUPPORTED_TYPES.includes(mime.toLowerCase());
  }

  async mount(url: string, el: HTMLMediaElement) {
    const { default: Hls } = await import("hls.js");

    if (!Hls.isSupported()) {
      throw new UnsupportedError();
    }

    this.#hls = new Hls();

    this.#hls.on(Hls.Events.ERROR, (type, evt) => {
      console.error(evt);

      if (evt.fatal) {
        const error_event = new ErrorEvent("error", {
          error: evt,
        });
        el.dispatchEvent(error_event);
      }
    });

    this.#hls.loadSource(url);
    this.#hls.attachMedia(el);
  }

  unmount() {
    if (this.#hls) {
      this.#hls.detachMedia();
      this.#hls = void 0
    }
  }
}
