/**
 * Get an image's metadata (name, width, and height)
 *
 * @method getImageMetadata
 * @private
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

export function getFileExtension(url){
    return url.split(/#|\?/)[0].split('.').pop().trim();
}

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
