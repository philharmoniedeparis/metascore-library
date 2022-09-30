import { padStart } from "lodash";
import renderers from "../renderers";

const MIME_TYPES = {
  mp4: "video/mp4",
  m4v: "video/mp4",
  ogg: "video/ogg",
  ogv: "video/ogg",
  webm: "video/webm",
  webmv: "video/webmv",
  m4a: "audio/mp4",
  mp3: "audio/mp3",
  oga: "audio/ogg",
  m3u8: "application/x-mpegURL",
  mpd: "application/dash+xml",
};

/**
 * Formats a time to a string represetation
 *
 * @param {number} time The time in seconds
 * @returns {string} The string represetation
 */
export function formatTime(time) {
  const centiseconds = padStart(parseInt((time * 100) % 100, 10), 2, "0");
  const seconds = padStart(parseInt(time % 60, 10), 2, "0");
  const minutes = padStart(parseInt(time / 60, 10), 2, "0");

  return `${minutes}:${seconds}.${centiseconds}`;
}

/**
 * Get a file's extention from its URL
 *
 * @param {string} url The file's URL
 * @returns {string} The file's extention
 */
export function getFileExtension(url) {
  return url.split(/#|\?/)[0].split(".").pop().trim();
}

/**
 * Get a file's mimetype from its URL
 *
 * @param {string} url The file's URL
 * @returns {string} The file's mimetype if supported, null otherwise
 */
export function getMimeTypeFromURL(url) {
  if (
    /^(?:(?:https?:)?\/\/)?(?:www\.)?vimeo.com\/(?:channels\/|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/.test(
      url
    )
  ) {
    return "video/vimeo";
  }

  if (
    /^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/.test(
      url
    )
  ) {
    return "video/youtube";
  }

  const ext = getFileExtension(url);
  return ext in MIME_TYPES ? MIME_TYPES[ext] : null;
}

/**
 * Get a renderer type from a source's mime type
 * @param {String} mime The mime type
 * @return {String?} A matching renderer type
 */
export function getRendererForMime(mime) {
  mime = mime.toLowerCase();

  return renderers.find((renderer) => {
    return renderer.canPlayType(mime);
  });
}

/**
 * Get a media file's duration in seconds
 *
 * @param {object} file The file descriptor
 * @property {string} mime The file's mime type
 * @property {string} url The file's url
 */
export function getFileDuration({ mime, url }) {
  return new Promise((resolve, reject) => {
    const Renderer = getRendererForMime(mime);
    if (Renderer) {
      const el = new Audio();
      const renderer = new Renderer();

      const onLoadedMetadata = function (evt) {
        evt.target.removeEventListener("error", onError);
        resolve(parseFloat(evt.target.duration));
      };
      const onError = function (evt) {
        evt.target.removeEventListener("loadedmetadata", onLoadedMetadata);
        reject();
      };
      el.addEventListener("loadedmetadata", onLoadedMetadata, { once: true });
      el.addEventListener("error", onError, { once: true });

      renderer.mount(url, el);
    } else {
      reject(new Error("No compatible renderer found"));
    }
  });
}
