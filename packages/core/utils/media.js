import { padStart } from "lodash";

/**
 * Get an image's metadata (name, width, and height)
 *
 * @param {string} url The image's url
 * @param {Function} callback The callback to call with the retreived metadata
 */
export function getImageMetadata(url, callback) {
  const img = new Image();

  img.addEventListener("error", () => {
    callback(new Error(`An error occured while loading the image: ${url}`));
  });

  img.addEventListener("load", (evt) => {
    const el = evt.target;
    let name = "";
    const width = el.naturalWidth;
    const height = el.naturalHeight;

    const matches = el.src.match(/([^/]*)\.[^.]*$/);
    if (matches) {
      name = matches[1];
    }

    callback(null, { name: name, width: width, height: height });
  });

  img.src = url;
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
  const ext2mime = {
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

  return ext in ext2mime ? ext2mime[ext] : null;
}

/**
 * Checks if a file's mimetype is in the list of accepted mimetypes
 *
 * @param {string} mimetype The mimetype
 * @param {string[]} accepted_mimetypes The list of accepted_mimetypes
 * @returns {boolean} True if valid, false otherwise
 */
export function isValidMimeType(mimetype, accepted_mimetypes) {
  if (!accepted_mimetypes || accepted_mimetypes.length === 0) {
    return true;
  }

  return accepted_mimetypes.some((accepted_mimetype) => {
    // Wildcard mime type
    if (/\*$/.test(accepted_mimetype)) {
      const mimetype_group = (/^[^/]+/.exec(mimetype) || []).pop(); // image/png -> image
      const accepted_mimetype_group = accepted_mimetype.slice(0, -2); // image/* -> image

      return mimetype_group === accepted_mimetype_group;
    }

    // Normal mime type
    return mimetype === accepted_mimetype;
  });
}

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
