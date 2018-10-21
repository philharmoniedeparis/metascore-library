import HTML5 from './HTML5';
import Dom from '../../core/Dom';

/**
 * Fired when the renderer is ready
 *
 * @event ready
 * @param {Object} renderer The renderer instance
 */
const EVT_READY = 'ready';

/**
* Fired when the source is set
*
* @event sourceset
* @param {Object} renderer The renderer instance
*/
const EVT_SOURCESET = 'sourceset';

/**
* The dash.js CDN URL
* @type {String}}
*/
const LIB_URL = '//cdn.dashjs.org/latest/dash.all.min.js';

/**
 * Dash renderer
 */
export default class Dash extends HTML5 {

    /**
     * Check whether the renderer supports a given mime type
     *
     * @param {String} mime The mime type
     * @return {Boolean} Whether the renderer supports the given mime type
     */
    static canPlayType(mime){
        const supported = [
            'application/dash+xml'
        ];

        return supported.includes(mime.toLowerCase());
    }

    /**
     * Load the dash.js library
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
                this._lib_error = new Error("Could not load the Dash library");
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
     */
    static getDurationFromURI(url, callback){
        this.loadLib((error) => {
            if(error){
                callback(error);
                return;
            }

            const audio = new Audio();
            audio.addEventListener('loadedmetadata', () => {
                callback(null, audio.duration);
            });

            const dash = window.dashjs.MediaPlayer().create();
            dash.initialize(audio, url, false);
        });
    }

    /**
     * Initialize
     */
    init(){
        this.addClass('dash');

        /**
         * The <video> or <audio> element
         * @type {Dom}
         */
        this.el = new Dom(`<${this.configs.type}></${this.configs.type}/>`, {'preload': 'auto'})
            .addListener('loadedmetadata', this.onLoadedMetadata.bind(this))
            .addListener('play', this.onPlay.bind(this))
            .addListener('pause', this.onPause.bind(this))
            .addListener('seeking', this.onSeeking.bind(this))
            .addListener('seeked', this.onSeeked.bind(this))
            .appendTo(this);

        /**
         * The HTMLVideoElement or HTMLAudioElement
         * @type {HTMLVideoElement|HTMLAudioElement}
         */
        this.dom = this.el.get(0);

        this.constructor.loadLib((error) => {
            if(!error){
                this.triggerEvent(EVT_READY, {'renderer': this}, false, false);
            }
        });

        return this;
    }

    /**
    * Set the media source
    *
    * @method setSource
    * @param {Object} source The source to set
    * @property {String} url The source's url
    * @property {String} mime The source's mime type
    * @param {Boolean} [supressEvent=false] Whether to supress the sourcesset event
    * @chainable
    */
    setSource(source, supressEvent){
        const dash = window.dashjs.MediaPlayer().create();
        dash.initialize(this.dom, source.url, false);

       if(supressEvent !== true){
           this.triggerEvent(EVT_SOURCESET, {'renderer': this});
       }

       return this;
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
