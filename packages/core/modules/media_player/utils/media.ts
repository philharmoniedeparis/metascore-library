import renderers, { type Native as MediaRenderer } from "../renderers";

const MIME_TYPES = new Map([
  ["mp4", "video/mp4"],
  ["m4v", "video/mp4"],
  ["ogg", "video/ogg"],
  ["ogv", "video/ogg"],
  ["webm", "video/webm"],
  ["webmv", "video/webmv"],
  ["m4a", "audio/mp4"],
  ["mp3", "audio/mp3"],
  ["oga", "audio/ogg"],
  ["m3u8", "application/x-mpegURL"],
  ["mpd", "application/dash+xml"],
]);

/**
 * Formats a time to a string represetation
 *
 * @param time The time in seconds
 * @returns The string represetation
 */
export function formatTime(time: number) {
  const minutes = `${Math.floor(time / 60)}`.padStart(2, "0");
  const seconds = `${Math.floor(time % 60)}`.padStart(2, "0");
  const centiseconds = `${Math.floor((time * 100) % 100)}`.padStart(2, "0");

  return `${minutes}:${seconds}.${centiseconds}`;
}

/**
 * Get a file's extention from its URL
 *
 * @param url The file's URL
 * @returns The file's extention
 */
export function getFileExtension(url: string) {
  return url.split(/#|\?/)[0].split(".").pop()?.trim();
}

/**
 * Get a file's mimetype from its URL
 *
 * @param url The file's URL
 * @returns The file's mimetype if supported, null otherwise
 */
export function getMimeTypeFromURL(url: string) {
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
  return ext && MIME_TYPES.has(ext) ? MIME_TYPES.get(ext) : null;
}

/**
 * Get a renderer type from a source's mime type
 * @param mime The mime type
 * @return A matching renderer type
 */
export function getRendererForMime(mime: string): typeof MediaRenderer|undefined {
  mime = mime.toLowerCase();

  return renderers.find((renderer) => {
    return renderer.canPlayType(mime);
  });
}

/**
 * Get a media file's duration in seconds
 *
 * @param file The file descriptor
 * @property mime The file's mime type
 * @property url The file's url
 */
export function getFileDuration({ mime, url }: { mime: string, url: string}) {
  return new Promise((resolve, reject) => {
    const Renderer = getRendererForMime(mime);
    if (Renderer) {
      const el = new Audio();
      const renderer = new Renderer();

      const onLoadedMetadata = function (evt: Event) {
        const media = evt.target! as HTMLMediaElement
        media.removeEventListener("error", onError);
        resolve(media.duration);
      };
      const onError = function (evt: Event) {
        const media = evt.target! as HTMLMediaElement
        media.removeEventListener("loadedmetadata", onLoadedMetadata);
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
