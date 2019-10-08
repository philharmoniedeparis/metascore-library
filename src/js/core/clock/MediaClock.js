import Clock from '../Clock';

/**
 * A synchronization clock class based on a media's time
 */
export default class MasterClock extends Clock {

    constructor(){
        super();

        // fix event handlers scope
        this.onRendererPlay = this.onRendererPlay.bind(this);
        this.onRendererPause = this.onRendererPause.bind(this);
        this.onRendererStop = this.onRendererStop.bind(this);
        this.onRendererSeeking = this.onRendererSeeking.bind(this);
        this.triggerTimeUpdate = this.triggerTimeUpdate.bind(this);

        /**
         * @type {Dom}
         */
        this.renderer = null;

        /**
         * @type {Boolean}
         */
        this.ticking = false;

    }

    /**
     * The play event handler
     *
     * @private
     */
    onRendererPlay() {
        this.ticking = true;

        this.renderer.removeListener('seeking', this.onRendererSeeking);

        this.triggerEvent('play');

        this.triggerTimeUpdate();
    }

    /**
     * The play event handler
     *
     * @private
     */
    onRendererPause() {
        this.ticking = false;

        this.renderer.addListener('seeking', this.onRendererSeeking);

        this.triggerEvent('pause');
    }

    /**
     * The play event handler
     *
     * @private
     */
    onRendererStop() {
        this.ticking = false;
        this.time = 0;

        this.renderer.addListener('seeking', this.onRendererSeeking);

        this.triggerEvent('stop');
    }

    onRendererSeeking(){
        this.triggerTimeUpdate(false);
    }

    /**
     * Set the corresponding media renderer
     *
     * @param {Mixed} renderer A media renderer
     * @param {Boolean} [supressEvent=false] Whether to supress the mediachange event
     */
    setRenderer(renderer, supressEvent) {
        if(this.renderer){
            this.renderer
                .removeListener('play', this.onRendererPlay)
                .removeListener('pause', this.onRendererPause)
                .removeListener('stop', this.onRendererStop)
                .removeListener('seeking', this.onRendererSeeking);

            delete this.renderer;
        }

        if(renderer){
            this.renderer = renderer
                .addListener('play', this.onRendererPlay)
                .addListener('pause', this.onRendererPause)
                .addListener('stop', this.onRendererStop);

            if(!this.renderer.isPlaying()){
                this.renderer.addListener('seeking', this.onRendererSeeking);
            }
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
    getRenderer() {
        return this.renderer;
    }

    /**
     * Set the current time
     *
     * @param {Number} time The time in centiseconds
     * @param {Boolean} [supressEvent=false] Whether to supress the timeupdate event
     */
    setTime(time) {
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
    getTime() {
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
    isTicking() {
        return this.ticking;
    }

    /**
     * Trigger the timeupdate event
     *
     * @private
     * @param {Boolean} [loop=true] Whether to use requestAnimationFrame to trigger this method again
     * @return {this}
     */
    triggerTimeUpdate(loop) {
        if(loop !== false && this.isTicking()){
            window.requestAnimationFrame(this.triggerTimeUpdate);
        }

        super.triggerTimeUpdate();
    }
}
