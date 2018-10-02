import {pad} from './String';

/**
 * Get an image's metadata (name, width, and height)
 *
 * @method getImageMetadata
 * @param {String} url The image's url
 * @param {Function} callback The callback to call with the retreived metadata
 */
export function getImageMetadata(url, callback){
    const img = new Image();

    img.addEventListener('error', () => {
        callback(new Error(`An error occured while loading the image: ${url}`));
    });

    img.addEventListener('load', (evt) => {
        const el = evt.target;
        let name = '';
        const width = el.naturalWidth;
        const height = el.naturalHeight;

        const matches = el.src.match(/([^/]*)\.[^.]*$/);
        if(matches){
            name = matches[1];
        }

        callback(null, {'name': name, 'width': width, 'height': height});
    });

    img.src = url;
}

/**
 * Get a file's extention from its URL
 *
 * @method getFileExtension
 * @param {String} url The file's URL
 * @return {String} The file's extention
 */
export function getFileExtension(url){
    return url.split(/#|\?/)[0].split('.').pop().trim();
}

/**
 * Get a file's mimetype from its URL
 *
 * @method getFileMime
 * @param {String} url The file's URL
 * @return {String} The file's mimetype if supported, null otherwise
 */
export function getFileMime(url){
    if(/^(?:(?:https?:)?\/\/)?(?:www\.)?vimeo.com\/(?:channels\/|groups\/([^/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/.test(url)){
        return 'video/vimeo';
    }

    if(/^(?:(?:https?:)?\/\/)?(?:www\.)?(?:m\.)?(?:youtu(?:be)?\.com\/(?:v\/|embed\/|watch(?:\/|\?v=))|youtu\.be\/)((?:\w|-){11})(?:\S+)?$/.test(url)){
        return 'video/youtube';
    }

    const ext = getFileExtension(url);
    const ext2mime = {
        'mp4': 'video/mp4',
        'm4v': 'video/mp4',
        'ogg': 'video/ogg',
        'ogv': 'video/ogg',
        'webm': 'video/webm',
        'webmv': 'video/webmv',
        'mp3': 'audio/mp3',
        'oga': 'audio/ogg',
        'm3u8': 'application/x-mpegURL',
        'mpd': 'application/dash+xml',
    };

    return ext in ext2mime ? ext2mime[ext] : null;
}

/**
 * Converts a given time from seconds to centiseconds
 *
 * @method toCentiseconds
 * @param {Number} time The time in seconds
 * @return {Number} The time in centiseconds
 */
export function toCentiseconds(time){
    const multiplier = 100;
    return Math.round(parseFloat(time) * multiplier);
}

/**
 * Converts a given time from centiseconds to seconds
 *
 * @method toSeconds
 * @param {Number} time The time in centiseconds
 * @return {Number} The time in seconds
 */
export function toSeconds(time){
    const multiplier = 0.01;
    return parseFloat(time) * multiplier;
}

/**
 * Formats a time to a string represetation
 *
 * @method formatTime
 * @param {Number} time The time in centiseconds
 * @return {String} The string represetation
 */
export function formatTime(time){
    const centiseconds = pad(parseInt(time % 100, 10), 2, '0', 'left');
    const seconds = pad(parseInt((time / 100) % 60, 10), 2, '0', 'left');
    const minutes = pad(parseInt((time / 6000), 10), 2, '0', 'left');

    return `${minutes}:${seconds}.${centiseconds}`;
}
