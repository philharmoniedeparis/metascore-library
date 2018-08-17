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

    img.addEventListener('error', callback);

    img.addEventListener('load', (evt) => {
        const el = evt.target;
        const width = el.naturalWidth;
        const height = el.naturalHeight;

        let name = '';
        const  matches = el.src.match(/([^/]*)\.[^.]*$/);
        if(matches){
            name = matches[1];
        }

        callback(null, {'name': name, 'width': width, 'height': height});
    });

    img.src = url;
}
