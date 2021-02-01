import Dom from '../../../core/Dom';
import {MasterClock} from '../../../core/media/MediaClock';

import {className} from '../../../../css/editor/controller/WaveformOverview.scss';

/**
 * A waveform overview
 *
 * @emits {playheadclick} Fired when the playhead is clicked
 * @param {Number} time The time in seconds corresponding to click position
 */
export default class Overview extends Dom {

    static defaults = {
        'waveColor': '#fff',
        'highlightColor': '#000',
        'playheadWidth': 1,
        'playheadColor': '#0000fe'
    };

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [waveColor='#fff'] The wave fill color
     * @property {String} [highlightColor='#000'] The highlight rectangle color
     * @property {Number} [playheadWidth=1] The playhead line width
     * @property {String} [playheadColor='#0000fe'] The playhead line color
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `waveform-overview ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        // fix event handlers scope
        this.onMousemove = this.onMousemove.bind(this);
        this.onMouseup = this.onMouseup.bind(this);

        const layers = new Dom('<div/>', {'class': 'layers'})
            .appendTo(this);

        /**
         * The wave <canvas> element
         * @type {Dom}
         */
        this.wave_layer = new Dom('<canvas/>', {'class': 'layer wave'})
            .appendTo(layers);

        /**
         * The highlight <canvas> element
         * @type {Dom}
         */
        this.highlight_layer = new Dom('<canvas/>', {'class': 'layer highlight'})
            .appendTo(layers);

        /**
         * The playhead <canvas> element
         * @type {Dom}
         */
        this.playhead_layer = new Dom('<canvas/>', {'class': 'layer playhead'})
            .appendTo(layers);

        layers
            .addListener('mousedown', this.onMousedown.bind(this))
            .addListener('click', this.onClick.bind(this));

        MasterClock
            .addListener('rendererchange', this.onMediaClockRendererChange.bind(this))
            .addListener('timeupdate', this.onMediaClockTimeUpdate.bind(this));
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

        if(this.waveformdata){
            /**
             * The resampled waveform data
             * @type {WaveformData}
             */
            this.resampled_data = this.waveformdata.resample({'width': this.width});
        }

        this.update();

        return this;
    }

    /**
     * Set the waveform data
     *
     * @param {WaveformData} waveformdata The waveform data
     * @param {Number} range The y range of the waveform data
     * @return {this}
     */
    setData(waveformdata, range){
        /**
         * The original waveform data
         * @type {WaveformData}
         */
        this.waveformdata = waveformdata;

        /**
         * The y range of the waveform data, used to determine the max height of the drawn form
         * @type {Number}
         */
        this._wave_range = range;

        this.resampled_data = this.waveformdata.resample({'width': this.width});

        this.update();

        this.addClass('has-data');

        return this;
    }

    /**
     * Clear all <canvas> elements and remove the associated waveform data
     *
     * @return {this}
     */
    clear(){
        delete this.waveformdata;
        delete this.resampled_data;

        this.find('canvas').forEach((canvas) => {
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, this.width, this.height);
        });

        this.removeClass('has-data');

        return this;
    }

    /**
     * Update the wave layer
     *
     * @return {this}
     */
    updateWave(){
        const canvas = this.wave_layer.get(0);
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, this.width, this.height);

        if(this.resampled_data){
            const channel = this.resampled_data.channel(0);

            context.beginPath();

            for(let index = 0; index < this.width; index++) {
                const val = channel.min_sample(index);
                context.lineTo(index + 0.5, this.scaleY(val, this.height) + 0.5);
            }

            for(let index = this.width - 1; index >= 0; index--) {
                const val = channel.max_sample(index);
                context.lineTo(index + 0.5, this.scaleY(val, this.height) + 0.5);
            }

            context.closePath();
            context.fillStyle = this.configs.waveColor;
            context.fill();
        }

        return this;
    }

    /**
     * Update the playhead layer
     *
     * @return {this}
     */
    updatePlayhead(){
        const canvas = this.playhead_layer.get(0);
        const context = canvas.getContext('2d');
        const x = Math.round(this.getPositionAt(MasterClock.getTime()))  + 0.5;

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, this.height);
        context.lineWidth = this.configs.playheadWidth;
        context.strokeStyle = this.configs.playheadColor;
        context.stroke();

        return this;
    }

    /**
     * Update all layers
     *
     * @return {this}
     */
    update(){
        this.updateWave();
        this.updatePlayhead();

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
        const renderer = MasterClock.getRenderer();

        if(!renderer && !this.resampled_data){
            return;
        }

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

    /**
     * MasterClock rendererchange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onMediaClockRendererChange(evt){
        this.clear();

        const renderer = evt.detail.renderer;
        if(renderer){
            renderer.getWaveformData(this.onMediaWaveformData.bind(this));

            this
                .updateSize()
                .update();
        }
    }

    /**
     * Media timeupdate event callback
     *
     * @private
     */
    onMediaClockTimeUpdate(){
        const renderer = MasterClock.getRenderer();

        if(renderer || this.resampled_data){
            this.updatePlayhead();
        }
    }

    /**
    * Media getWaveformData callback
    *
    * @private
    * @param {WaveformData} data The waveform data, or null if none could be retreived
    */
    onMediaWaveformData(data){
        if(data){
            let range = 0;
            const channel = data.channel(0);
            for(let index = 0; index < data.length; index++) {
                const min = channel.min_sample(index);
                const max = channel.max_sample(index);
                range = Math.max(range, Math.abs(min), Math.abs(max));
            }

            this.updateSize().setData(data, range);
        }
    }

    /**
     * Set the highlight rectangle
     *
     * @param {Number} start The start time in seconds
     * @param {Number} end The end time in seconds
     * @return {this}
     */
    setHighlight(start, end){
        const canvas = this.highlight_layer.get(0);
        const context = canvas.getContext('2d');
        const x = this.getPositionAt(start);
        const width = this.getPositionAt(end) - x;

        context.clearRect(0, 0, this.width, this.height);

        context.fillStyle = this.configs.highlightColor;
        context.fillRect(x, 0, width, this.height);

        return this;
    }

    /**
     * Get the time in seconds corresponding to an x position in pixels
     *
     * @param {Number} x The x position
     * @return {Number} The corresponding time in seconds
     */
    getTimeAt(x){
        if(this.resampled_data){
            return this.resampled_data.time(x);
        }

        const renderer = MasterClock.getRenderer();
        if(renderer){
            return renderer.getDuration() * x / this.width;
        }

        return null;
    }

    /**
     * Get the x position in pixels corresponding to a time in seconds
     *
     * @param {Number} time The time in seconds
     * @return {Number} The corresponding x position
     */
    getPositionAt(time){
        if(this.resampled_data){
            return this.resampled_data.at_time(time);
        }

        const renderer = MasterClock.getRenderer();
        if(renderer){
            return time * this.width / renderer.getDuration();
        }

        return null;
    }

    /**
     * Rescale an amplitude value to a given hight
     *
     * @param {Number} amplitude The waveform data point amplitude
     * @param {Number} height The height of the drawing surface in pixels
     * @return {Number} The scaled value
     */
    scaleY(amplitude, height) {
        const range = this._wave_range * 2;
        const offset = this._wave_range;

        return height - ((amplitude + offset) * height) / range;
    }

}
