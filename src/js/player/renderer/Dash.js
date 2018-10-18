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

const LIB_URL = '//cdn.dashjs.org/latest/dash.all.min.js';

/**
 * Dash renderer
 */
export default class Dash extends HTML5 {

    static canPlayType(mime){
        const supported = [
            'application/dash+xml'
        ];

        return supported.includes(mime.toLowerCase());
    }

    static loadLib(callback){
        if(this.LIB_ERROR){
            callback(this.LIB_ERROR);
            return;
        }

        if(this.LIB_LOADED){
            callback();
            return;
        }

        if(!this.LIB_LOAD_CALLBACKS){
            this.LIB_LOAD_CALLBACKS = [];
        }

        this.LIB_LOAD_CALLBACKS.push(callback);

        if(!this.LIB_SCRIPT){
            this.LIB_SCRIPT = document.createElement("script");
            this.LIB_SCRIPT.type = "text/javascript";
            this.LIB_SCRIPT.async = true;

            this.LIB_SCRIPT.addEventListener('load', () => {
                this.LIB_LOADED = true;
                this.LIB_SCRIPT.remove();
                delete this.LIB_SCRIPT;

                this.LIB_LOAD_CALLBACKS.forEach((fn) => {
                    fn();
                });

                delete this.LIB_LOAD_CALLBACKS;
            });

            this.LIB_SCRIPT.addEventListener('error', () => {
                const error = new Error("Could not load the Dash library");
                this.LIB_ERROR = error;
                this.LIB_SCRIPT.remove();
                delete this.LIB_SCRIPT;

                this.LIB_LOAD_CALLBACKS.forEach((fn) => {
                    fn(error);
                });

                delete this.LIB_LOAD_CALLBACKS;
            });

            this.LIB_SCRIPT.src = LIB_URL;
            document.head.appendChild(this.LIB_SCRIPT);
        }
    }

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

    init(){
        this.addClass('dash');

        this.el = new Dom(`<${this.configs.type}></${this.configs.type}/>`, {'preload': 'auto'})
            .addListener('loadedmetadata', this.onLoadedMetadata.bind(this))
            .addListener('play', this.onPlay.bind(this))
            .addListener('pause', this.onPause.bind(this))
            .addListener('seeking', this.onSeeking.bind(this))
            .addListener('seeked', this.onSeeked.bind(this))
            .appendTo(this);

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
    * @param {Array} sources The list of sources as objects with 'url' and 'mime' keys
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

}