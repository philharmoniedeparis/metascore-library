import HTML5 from './HTML5';
import Locale from '../../Locale';
import {round} from '../../utils/Math';

/**
* The hls.js CDN URL
* @type {String}}
*/
const LIB_URL = '//cdn.jsdelivr.net/npm/hls.js@latest';

/**
 * HLS renderer
 *
 * @emits {ready} Fired when the renderer is ready
 * @param {Object} renderer The renderer instance
 * @emits {sourceset} Fired when the source is set
 * @param {Object} renderer The renderer instance
 */
export default class HLS extends HTML5 {

    /**
     * Check whether the renderer supports a given mime type
     *
     * @param {String} mime The mime type
     * @return {Boolean} Whether the renderer supports the given mime type
     */
    static canPlayType(mime){
        const supported = [
            'application/mpegurl',
            'application/x-mpegurl',
            'application/vnd.apple.mpegurl',
            'application/vnd.apple.mpegurl.audio',
            'audio/mpegurl',
            'audio/x-mpegurl',
            'audio/hls',
            'video/mpegurl',
            'video/x-mpegurl',
            'video/hls'
        ];

        return supported.includes(mime.toLowerCase());
    }

    /**
     * Load the hls.js library
     *
     * @param {Function} callback The callback to invoke on load
     */
    static loadLib(callback){
        if(this._lib_error){
            callback(this._lib_error);
            return;
        }

        if(this._lib_loaded){
            callback();
            return;
        }

        if(!this._lib_load_callbacks){
            /**
             * The list of callbacks to invoke once the library is loaded
             * @type {Array}
             */
            this._lib_load_callbacks = [];
        }

        this._lib_load_callbacks.push(callback);

        if(!this._lib_script){
            /**
             * The script tag used to load the library
             * @type {HTMLScriptElement}
             */
            this._lib_script = document.createElement("script");
            this._lib_script.type = "text/javascript";
            this._lib_script.async = true;

            this._lib_script.addEventListener('load', () => {
                /**
                 * Whether the library is loaded
                 * @type {Boolean}
                 */
                this._lib_loaded = true;
                this._lib_script.remove();
                delete this._lib_script;

                this._lib_load_callbacks.forEach((fn) => {
                    fn();
                });

                delete this._lib_load_callbacks;
            });

            this._lib_script.addEventListener('error', () => {
                /**
                 * A custom error sent to loading callbacks if the library could not be loaded
                 * @type {Error}
                 */
                this._lib_error = new Error("Could not load the HLS library");
                this._lib_script.remove();
                delete this._lib_script;

                this._lib_load_callbacks.forEach((fn) => {
                    fn(this._lib_error);
                });

                delete this._lib_load_callbacks;
            });

            this._lib_script.src = LIB_URL;
            document.head.appendChild(this._lib_script);
        }
    }

    /**
     * Get the duration of a media file from its URI
     *
     * @param {String} url The file's URL
     * @param {Function} callback The callback to invoke with a potential error and the duration
     * @param {Boolean|Integer} decimals The number of decimals to round to, or false to return raw value
     */
    static getDurationFromURI(url, callback, decimals = 2){
        this.loadLib((error) => {
            if(error){
                callback(error);
                return;
            }

            const Hls = window.Hls;

            if(Hls.isSupported()){
                const hls = new Hls();
                const audio = new Audio();

                // @todo: replace with promises to eliminate the propability of both an error and a success being called

                hls.on(Hls.Events.ERROR, (evt) => {
                    if(evt.fatal){
                        // @todo: be more specific
                        const message = Locale.t('core.media.renderer.HLS.getDurationFromURI.error', 'An error occured while attempting to load the media: !url', {'!url': url});
                        console.error(evt.response.text);
                        callback(new Error(message));
                    }
                });

                audio.addEventListener('loadedmetadata', () => {
                    callback(null, decimals !== false ? round(audio.duration, decimals) : audio.duration);
                });

                hls.loadSource(url);
                hls.attachMedia(audio);
            }
        });
    }

    /**
     * Initialize
     */
    init(){
        this
            .setupUI()
            .addClass('hls');

        this.constructor.loadLib((error) => {
            if(!error){
                this.triggerEvent('ready', {'renderer': this}, false, false);
            }
        });

        return this;
    }

    /**
    * Set the media source
    *
    * @param {Object} source The source to set
    * @property {String} url The source's url
    * @property {String} mime The source's mime type
    * @param {Boolean} [supressEvent=false] Whether to supress the sourcesset event
    * @return {this}
    */
    setSource(source, supressEvent){
        const Hls = window.Hls;
        const hls = new Hls();

        /**
         * The current source
         * @type {Object}
         */
        this.source = source;

        hls.on(Hls.Events.ERROR, this.onLibError.bind(this));

        hls.loadSource(source.url);
        hls.attachMedia(this.dom);

       if(supressEvent !== true){
           this.triggerEvent('sourceset', {'renderer': this});
       }

       return this;
    }

    onLibError(evt, data){
        if(data.fatal){
            const message = Locale.t('core.media.renderer.HLS.error', 'An error occured while attempting to read the media stream');
            this.triggerEvent('error', {'renderer': this, 'message': message});
            console.error('HLS.js:', data);
        }
        else{
            console.warn('HLS.js:', data);
        }
    }

   /**
   * Get the WaveformData assiciated with the media file
   *
   * @param {Function} callback The callback to invoke
   */
   getWaveformData(callback){
       callback(null);
   }

}
