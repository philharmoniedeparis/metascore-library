import Dom from '../../core/Dom';
import MediaClock from '../../core/clock/MediaClock';

import {className} from '../../../css/editor/controller/BufferIndicator.scss';

/**
 * A buffer indicator
 */
export default class BufferIndicator extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [color='#777'] The indicator fill color
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `buffer-indicator ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        const layers = new Dom('<div/>', {'class': 'layers'})
            .appendTo(this);

        /**
         * The buffered <canvas> element
         * @type {Dom}
         */
        this.buffered_layer = new Dom('<canvas/>', {'class': 'layer buffered'})
            .appendTo(layers);

        /**
         * The playback <canvas> element
         * @type {Dom}
         */
        this.playback_layer = new Dom('<canvas/>', {'class': 'layer playback'})
            .appendTo(layers);

        // fix event handlers scope
        this.onMousemove = this.onMousemove.bind(this);
        this.onMouseup = this.onMouseup.bind(this);
        this.onMediaRendererProgress = this.onMediaRendererProgress.bind(this);

        layers
            .addListener('mousedown', this.onMousedown.bind(this))
            .addListener('click', this.onClick.bind(this));

        MediaClock
            .addListener('rendererchange', this.onMediaClockRendererChange.bind(this))
            .addListener('timeupdate', this.onMediaClockTimeUpdate.bind(this));
    }

    /**
     * Get the default config values
     *
     * @return {Object} The default values
     */
    static getDefaults(){
        return {
            'bufferedColor': '#777',
            'playbackColor': '#0000fe'
        };
    }

    /**
     * Update the <canvas> sizes
     *
     * @return {this}
     */
    updateSize(){
        /**
         * The view's width
         * @type {Number}
         */
        this.width = this.get(0).clientWidth;

        /**
         * The view's height
         * @type {Number}
         */
        this.height = this.get(0).clientHeight;

        this.find('canvas').forEach((canvas) => {
            canvas.width = this.width;
            canvas.height = this.height;
        });

        this.update();

        return this;
    }

    /**
     * Clear the <canvas> element
     *
     * @return {this}
     */
    clear(){
        this.find('canvas').forEach((canvas) => {
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, this.width, this.height);
        });

        return this;
    }

    updateBuffered(){
        const canvas = this.buffered_layer.get(0);
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, this.width, this.height);

        const renderer = MediaClock.getRenderer();

        if(renderer){
            const ranges = renderer.getBuffered();
            const multiplier = canvas.width / renderer.getDuration();

            context.fillStyle = this.configs.bufferedColor;

            ranges.forEach(([start, end]) => {
                const start_x = start * multiplier;
                const end_x = end * multiplier;
                const width = end_x - start_x;

                context.fillRect(start_x, 0, width, canvas.height);
            });
        }

        return this;
    }

    updatePlayback(){
        const canvas = this.playback_layer.get(0);
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, this.width, this.height);

        const renderer = MediaClock.getRenderer();
        if(renderer){
            const time = MediaClock.getTime();

            context.fillStyle = this.configs.playbackColor;
            context.fillRect(0, 0, (time * canvas.width / renderer.getDuration()) + 1, canvas.height);
        }

        return this;
    }

    /**
     * Update all layers
     *
     * @return {this}
     */
    update(){
        this.updateBuffered();
        this.updatePlayback();

        return this;
    }

    /**
     * The mousedown event callback
     *
     * @private
     */
    onMousedown(){
        new Dom(this.get(0).ownerDocument)
            .addListener('mousemove', this.onMousemove)
            .addListener('mouseup', this.onMouseup)
            .addListener('blur', this.onMouseup);
    }

    /**
     * The mousemove event callback
     *
     * @private
     */
    onMousemove(evt){
        const offset = this.get(0).getBoundingClientRect();
        const x = evt.pageX - offset.left;
        const time = this.getTimeAt(x);

        this.triggerEvent('playheadclick', {'time': time});
    }

    /**
     * The mouseup event callback
     *
     * @private
     */
    onMouseup(){
        new Dom(this.get(0).ownerDocument)
            .removeListener('mousemove', this.onMousemove)
            .removeListener('mouseup', this.onMouseup)
            .removeListener('blur', this.onMouseup);
    }

    /**
     * The click event callback
     *
     * @private
     * @param {MouseEvent} evt The event object
     */
    onClick(evt){
        this.onMousemove(evt);
    }

    onMediaClockRendererChange(evt){
        const renderer = evt.detail.renderer;

        if(renderer){
            renderer.addListener('progress', this.onMediaRendererProgress);
        }

        this
            .updateSize()
            .update();
    }

    /**
     * The media's timeupdate event callback
     *
     * @private
     */
    onMediaClockTimeUpdate(){
        this.updatePlayback();
    }

    /**
     * The media's progress event callback
     *
     * @private
     */
    onMediaRendererProgress(){
        this.updateBuffered();
    }

    /**
     * Get the time in seconds corresponding to an x position in pixels
     *
     * @param {Number} x The x position
     * @return {Number} The corresponding time in seconds
     */
    getTimeAt(x){
        const renderer = MediaClock.getRenderer();

        if(renderer){
            return renderer.getDuration() * x / this.width;
        }

        return -1;
    }

}
