import Clock from '../Clock';

/**
 * A synchronization clock class based on a media's time
 */
export default class MediaClock extends Clock {

    /**
     * @type {Dom}
     */
    static renderer = null;

    /**
     * @type {Boolean}
     */
    static ticking = false;

    /**
     * The play event handler
     *
     * @private
     */
    static onRendererPlay() {
        this.ticking = true;

        this.triggerEvent('play');

        this.triggerTimeUpdate();
    }

    /**
     * The play event handler
     *
     * @private
     */
    static onRendererPause() {
        this.ticking = false;

        this.triggerEvent('pause');
    }

    /**
     * The play event handler
     *
     * @private
     */
    static onRendererStop() {
        this.ticking = false;
        this.time = 0;

        this.triggerEvent('stop');
    }

    /**
     * Set the corresponding media renderer
     *
     * @param {Mixed} renderer A media renderer
     * @param {Boolean} [supressEvent=false] Whether to supress the mediachange event
     */
    static setRenderer(renderer, supressEvent) {
        if(!this._scoped_methods){
            // fix event handlers scope
            this.onRendererPlay = this.onRendererPlay.bind(this);
            this.onRendererPause = this.onRendererPause.bind(this);
            this.onRendererStop = this.onRendererStop.bind(this);
            this.triggerTimeUpdate = this.triggerTimeUpdate.bind(this);

            this._scoped_methods = true;
        }

        if(this.renderer){
            this.renderer
                .removeListener('play', this.onRendererPlay)
                .removeListener('pause', this.onRendererPause)
                .removeListener('stop', this.onRendererStop);

            delete this.renderer;
        }

        if(renderer){
            this.renderer = renderer
                .addListener('play', this.onRendererPlay)
                .addListener('pause', this.onRendererPause)
                .addListener('stop', this.onRendererStop);
        }

        if(supressEvent !== true){
            this.triggerEvent('rendererchange', {'renderer': this.getRenderer()});
        }
    }

    /**
     * Get the attached media element
     *
     * @return {Dom} The media
     */
    static getRenderer() {
        return this.renderer;
    }

    /**
     * Set the current time
     *
     * @param {Number} time The time in centiseconds
     * @param {Boolean} [supressEvent=false] Whether to supress the timeupdate event
     */
    static setTime(time) {
        const renderer = this.getRenderer();

        if(renderer){
            renderer.setTime(time);

            if(!this.isTicking()){
                this.triggerTimeUpdate(false);
            }
        }
    }

    /**
     * Get the current time
     *
     * @return {Number} The time in centiseconds
     */
    static getTime() {
        const renderer = this.getRenderer();

        if(renderer){
            return renderer.getTime();
        }

        return 0;
    }

    /**
     * Check whether the clock is ticking
     *
     * @return {Boolean} Whether the clock is ticking
     */
    static isTicking() {
        return this.ticking;
    }

    /**
     * Trigger the timeupdate event
     *
     * @private
     * @param {Boolean} [loop=true] Whether to use requestAnimationFrame to trigger this method again
     * @return {this}
     */
    static triggerTimeUpdate(loop) {
        if(loop !== false && this.isTicking()){
            window.requestAnimationFrame(this.triggerTimeUpdate);
        }

        super.triggerTimeUpdate();
    }
}
