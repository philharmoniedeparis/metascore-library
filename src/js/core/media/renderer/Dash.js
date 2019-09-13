import HTML5 from './HTML5';
import Locale from '../../Locale';

/**
* The dash.js CDN URL
* @type {String}}
*/
const LIB_URL = '//cdn.dashjs.org/latest/dash.all.min.js';

/**
 * Dash renderer
 *
 * @emits {ready} Fired when the renderer is ready
 * @param {Object} renderer The renderer instance
 * @emits {sourceset} Fired when the source is set
 * @param {Object} renderer The renderer instance
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

            const DashJS = window.dashjs.MediaPlayer;
            const dash = DashJS().create();
            const audio = new Audio();

            // @todo: replace with promises to eliminate the propability of both an error and a success being called

            dash.on(DashJS.events.ERROR, (evt) => {
                if(this.isErrorFatal(evt)){
                    // @todo: be more specific
                    const message = Locale.t('player.renderer.Dash.getDurationFromURI.error', 'An error occured while attempting to load the media: !url', {'!url': url});
                    console.error(evt.response.text);
                    callback(new Error(message));
                }
            });

            audio.addEventListener('loadedmetadata', () => {
                callback(null, audio.duration);
            });

            dash.initialize(audio, url, false);
        });
    }

    static isErrorFatal(evt){
        // See https://github.com/Dash-Industry-Forum/dash.js/issues/1475
        if (evt.error === 'download'){
            if('event' in evt && ['manifest', 'initialization', 'content'].includes(evt.event.id)){
                return true;
            }
        }
        else if(evt.error === 'manifestError'){
            if('event' in evt && ['parse', 'nostreams', 'codec'].includes(evt.event.id)){
                return true;
            }
        }
        else if(evt.error === 'mediasource'){
            return true;
        }

        return false;
    }

    /**
     * Initialize
     */
    init(){
        this
            .setupUI()
            .addClass('dash');

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
        const DashJS = window.dashjs.MediaPlayer;
        const dash = DashJS().create();

        dash.on(DashJS.events.ERROR, this.onLibError.bind(this));

        dash.initialize(this.dom, source.url, false);

       if(supressEvent !== true){
           this.triggerEvent('sourceset', {'renderer': this});
       }

       return this;
    }

    onLibError(evt){
        const fatal = this.constructor.isErrorFatal(evt);

        if(fatal){
            const message = Locale.t('player.renderer.Dash.error', 'An error occured while attempting to read the media stream');
            this.triggerEvent('error', {'renderer': this, 'message': message});
            console.error(`Dash.js:`, evt);
        }
        else{
            console.warn(`Dash.js:`, evt);
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
