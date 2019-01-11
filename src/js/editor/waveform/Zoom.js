import Dom from '../../core/Dom';
import SliderField from '../field/Slider';
import {toCentiseconds, toSeconds, formatTime} from '../../core/utils/Media';

/**
 * A waveform zoomable view
 *
 * @emits {playheadclick} Fired when the playhead is clicked
 * @param {Number} time The time in centiseconds corresponding to the click position
 * @emits {offsetupdate} Fired when the offset is updated
 * @param {Object} waveform The Waveform instance
 * @param {Number} start The start time of the offset in seconds
 * @param {Number} end The end time of the offset in seconds
 */
export default class Zoom extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [waveColor='#999'] The wave fill color
     * @property {Number} [waveMargin=20] The top and bottom wave margin
     * @property {Number} [axisTickWidth=1] The axis tick width
     * @property {String} [axisTickColor='#333'] The axis tick color
     * @property {String} [axisTextColor='#555'] The axis text color
     * @property {String} [axisFont='11px sans-serif'] The axis font
     * @property {Number} [playheadWidth=1] The playhead line width
     * @property {String} [playheadColor='#000'] The playhead line color
     * @property {Number} [zoomStep=32] The zoom step, for mouse and buttons
     * @property {Number} [zoomButtonInterval=50] The zoom button step interval in ms
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': 'view zoom'});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * The current time
         * @type {Number}
         */
        this.time = 0;

        /**
         * The message text container
         * @type {Dom}
         */
        this.message = new Dom('<div/>', {'class': 'message'})
            .appendTo(this);

        const layers = new Dom('<div/>', {'class': 'layers'})
            .appendTo(this);

        /**
         * The wave <canvas> element
         * @type {Dom}
         */
        this.wave_layer = new Dom('<canvas/>', {'class': 'layer wave'})
            .appendTo(layers);

        /**
         * The axis <canvas> element
         * @type {Dom}
         */
        this.axis_layer = new Dom('<canvas/>', {'class': 'layer axis'})
            .appendTo(layers);

        /**
         * The playhead <canvas> element
         * @type {Dom}
         */
        this.playhead_layer = new Dom('<canvas/>', {'class': 'layer playhead'})
            .appendTo(layers);

        const controls = new Dom('<div/>', {'class': 'controls'})
            .appendTo(this);

        /**
         * The zoom out <button> element
         * @type {Dom}
         */
        this.zoom_out_btn = new Dom('<button/>', {'text': '&minus;'})
            .data('action', 'zoom-out')
            .addListener('mousedown', () => {
                /**
                 * The zoom button interval id
                 * @type {Number}
                 */
                this._zoom_interval = setInterval(() => {
                    this.zoomOut();
                }, this.configs.zoomButtonInterval);
            })
            .addListener('mouseup', () => {
                clearInterval(this._zoom_interval);
                delete this.zoom_interval;
            })
            .addListener('click', (evt) => {
                evt.stopPropagation();
            })
            .appendTo(controls);

        /**
         * The zoom slider field
         * @type {SliderField}
         */
        this.zoom_slider = new SliderField({'reversed': true, 'triggerChangeOnDrag': true})
            .addListener('valuechange', (evt) => {
                this.setZoom(evt.detail.value);
            })
            .appendTo(controls);

        /**
         * The zoom in <button> element
         * @type {Dom}
         */
        this.zoom_in_btn = new Dom('<button/>', {'text': '&plus;'})
            .data('action', 'zoom-in')
            .addListener('mousedown', () => {
                this._zoom_interval = setInterval(() => {
                    this.zoomIn();
                }, this.configs.zoomButtonInterval);
            })
            .addListener('mouseup', () => {
                clearInterval(this._zoom_interval);
                delete this._zoom_interval;
            })
            .addListener('click', (evt) => {
                evt.stopPropagation();
            })
            .appendTo(controls);


        this.onMousemove = this.onMousemove.bind(this);
        this.onMouseup = this.onMouseup.bind(this);
        this.onMouseWheel = this.onMouseWheel.bind(this);

        layers
            .addListener('mousedown', this.onMousedown.bind(this))
            .addListener('click', this.onClick.bind(this));
    }

    /**
     * Get the default config values
     *
     * @return {Object} The default values
     */
    static getDefaults(){
        return {
            'waveColor': '#0000fe',
            'waveMargin': 20,
            'axisTickWidth': 1,
            'axisTickHeight': 6,
            'axisTickColor': '#333',
            'axisTextColor': '#555',
            'axisFont': '11px sans-serif',
            'playheadWidth': 1,
            'playheadColor': '#000',
            'zoomStep': 32,
            'zoomButtonInterval': 50
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

        if(!this.resampled_data){
            this.resampleData();
        }

        this.setOffset(this.offset, true)

        return this;
    }

    /**
     * Set the text message
     *
     * @param {String} text The text to display
     * @return {this}
     */
    setMessage(text){
        this.message.text(text);

        return this;
    }

    /**
     * Set the media's duration
     *
     * @param {Number} duration The media's duration in centiseconds
     * @return {this}
     */
    setDuration(duration){
        /**
         * The media's duration in seconds
         * @type {Number}
         */
        this.duration = toSeconds(duration);

        this.updateAxis();

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

        this.zoom_slider.setStep(2);

        this.resampleData();

        this
            .addListener('mousewheel', this.onMouseWheel)
            .addListener('DOMMouseScroll', this.onMouseWheel)
            .addClass('has-data');

        return this;
    }

    resampleData(){
        if(this.waveformdata && this.width > 0 && this.height > 0){
            /**
             * The resampled waveform data
             * @type {WaveformData}
             */
            this.resampled_data = this.waveformdata.resample({'width': this.width});

            /**
             * The maximum zoom scale
             * @type {Number}
             */
            this.max_scale = this.resampled_data.adapter.scale;

            this.zoom_slider
                .setMin(this.waveformdata.adapter.scale)
                .setMax(this.max_scale)
                .setValue(this.max_scale, true);

            this.setOffset(0, true);
        }

        return this;
    }

    /**
     * Clear all <canvas> elements and remove the associated waveform data
     *
     * @return {this}
     */
    clear(){
        delete this.duration;
        delete this.waveformdata;
        delete this.resampled_data;

        this.find('canvas').forEach((canvas) => {
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, this.width, this.height);
        });

        this
            .removeListener('mousewheel', this.onMouseWheel)
            .removeListener('DOMMouseScroll', this.onMouseWheel)
            .removeClass('has-data');

        this.update();

        return this;
    }

    /**
     * Update the wave layer
     *
     * @return {this}
     */
    updateWave(){
        if(this.width > 0 && this.height > 0){
            const canvas = this.wave_layer.get(0);
            const context = canvas.getContext('2d');

            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();

            if(this.resampled_data){
                const adapter = this.resampled_data.adapter;
                const margin = this.configs.waveMargin;
                const height = this.height - (margin * 2);
                const startX = this.offset;
                const endX = startX + this.width;

                for(let x = startX; x < endX; x++) {
                    const val = adapter.at(2 * x);
                    context.lineTo(x - startX + 0.5, this.scaleY(val, height) + margin + 0.5);
                }

                for(let x = endX - 1; x >= startX; x--) {
                    const val = adapter.at(2 * x + 1);
                    context.lineTo(x - startX + 0.5, this.scaleY(val, height) + margin + 0.5);
                }

                context.closePath();
                context.fillStyle = this.configs.waveColor;
                context.fill();
            }
        }

        return this;
    }

    /**
     * Update the axis layer
     *
     * @return {this}
     */
    updateAxis(){
        if(this.width > 0 && this.height > 0){
            const canvas = this.axis_layer.get(0);
            const context = canvas.getContext('2d');
            const step = this.getAxisStep();

            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();

            if(step !== null){
                context.strokeStyle = this.configs.axisTickColor;
                context.lineWidth = this.configs.axisTickWidth;
                context.font = this.configs.axisFont;
                context.fillStyle = this.configs.axisTextColor;
                context.textAlign = 'center';
                context.textBaseline = 'bottom';

                let startTime = this.getTimeAt(0) + step;
                startTime -= startTime % step;

                let endTime = this.getTimeAt(this.width);
                endTime += endTime % step;

                for(let time = startTime; time < endTime; time+=step){
                    const x = this.getPositionAt(time) + 0.5;
                    const text = formatTime(toCentiseconds(time));

                    context.moveTo(x, 0);
                    context.lineTo(x, this.configs.axisTickHeight);
                    context.stroke();
                    context.moveTo(x, this.height);
                    context.lineTo(x, this.height - this.configs.axisTickHeight);
                    context.stroke();
                    context.fillText(text, x, this.height - this.configs.axisTickHeight);
                }
            }
        }

        return this;
    }

    /**
     * Update the playhead layer
     *
     * @param {Boolean} update_offset Whether to update the offset if needed
     * @return {this}
     */
    updatePlayhead(update_offset){
        if(this.width > 0 && this.height > 0){
            const canvas = this.playhead_layer.get(0);
            const context = canvas.getContext('2d');
            const x = this.getPositionAt(this.time) + 0.5;

            if(this.resampled_data){
                if(update_offset === true && !this._dragging){
                    if(x < 0 || x > this.width - 10){
                        this.setOffset(this.offset + x - 10);
                        return this;
                    }
                }
            }

            context.clearRect(0, 0, this.width, this.height);
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, this.height);
            context.lineWidth = this.configs.playheadWidth;
            context.strokeStyle = this.configs.playheadColor;
            context.stroke();
        }

        return this;
    }

    /**
     * Update all layers
     *
     * @return {this}
     */
    update(){
        this.updateWave();
        this.updateAxis();
        this.updatePlayhead();

        return this;
    }

    /**
     * Returns number of seconds for each axis tick, appropriate for the
     * current zoom level, ensuring that ticks are not too close together
     * and that ticks are placed at intuitive time intervals (i.e., every 1,
     * 2, 5, 10, 20, 30 seconds, then every 1, 2, 5, 10, 20, 30 minutes, then
     * every 1, 2, 5, 10, 20, 30 hours).
     *
     * Credit: peaks.js (see src/main/waveform/waveform.axis.js:getAxisLabelScale)
     *
     * @returns {Number} The number of seconds for each axis tick
     */
    getAxisStep() {
        const min_spacing = 60;
        const steps = [1, 2, 5, 10, 20, 30];
        let index = 0;
        let base_secs = 1;
        let step = base_secs;

        for (;;) {
            step = base_secs * steps[index];
            const pixels = this.timeToPixels(step);

            if(pixels === null){
                return null;
            }

            if (pixels < min_spacing) {
                if (++index === steps.length) {
                    base_secs *= 60; // seconds -> minutes -> hours
                    index = 0;
                }
            }
            else {
                break;
            }
        }

        return step;
    }

    /**
     * Zoom in
     *
     * @return {this}
     */
    zoomIn(){
        if(this.resampled_data){
            const adapter = this.resampled_data.adapter;
            this.setZoom(adapter.scale - this.configs.zoomStep);
        }

        return this;
    }

    /**
     * Zoom out
     *
     * @return {this}
     */
    zoomOut(){
        if(this.resampled_data){
            const adapter = this.resampled_data.adapter;
            this.setZoom(adapter.scale + this.configs.zoomStep);
        }

        return this;
    }

    /**
     * Set the current zoom
     *
     * @param {Number} scale The zoom scale to set
     * @return {this}
     */
    setZoom(scale){
        if(this.resampled_data){
            const min = this.waveformdata.adapter.scale;
            const max = this.max_scale;

            let clamped = parseInt(scale, 10);
            clamped = Math.min(Math.max(scale, min), max);

            if(clamped !== this.resampled_data.adapter.scale){
                this.resampled_data = this.waveformdata.resample({'scale': clamped});

                this.zoom_out_btn.toggleClass('disabled', clamped >= max);
                this.zoom_in_btn.toggleClass('disabled', clamped <= min);
                this.zoom_slider.setValue(scale, true);

                const offset = this.resampled_data.at_time(this.time) - this.width/2;
                this.setOffset(offset, true);
            }
        }

        return this;
    }

    /**
     * The mousedown event callback
     *
     * @private
     * @param {MouseEvent} evt The event object
     */
    onMousedown(evt){
        /**
         * The mouse down x position
         * @type {Number}
         */
        this._mousedown_x = evt.clientX;

        new Dom(this.get(0).ownerDocument)
            .addListener('mousemove', this.onMousemove)
            .addListener('mouseup', this.onMouseup)
            .addListener('blur', this.onMouseup);
    }

    /**
     * The mousemove event callback
     *
     * @private
     * @param {MouseEvent} evt The event object
     */
    onMousemove(evt){
        if(evt.clientX === this._mousedown_x || !this.resampled_data){
            return;
        }

        /**
         * Whether the wave is being dragged
         * @type {Boolean}
         */
        this._dragging = true;

        this.setOffset(this.offset + this._mousedown_x - evt.clientX);
        this._mousedown_x = evt.clientX;
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
     * The mousewheel event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseWheel(evt){
        const delta = Math.max(-1, Math.min(1, (evt.wheelDelta || -evt.detail)));

        if(delta > 0){
            this.zoomIn();
        }
        else{
            this.zoomOut();
        }

        evt.preventDefault();
    }

    /**
     * The click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onClick(evt){
        if(!this.duration && !this.resampled_data){
            return;
        }

        if(!this._dragging){
            const offset = evt.target.getBoundingClientRect();
            const x = evt.pageX - offset.left;
            const time = toCentiseconds(this.getTimeAt(x));

            this.triggerEvent('playheadclick', {'time': time});
        }
        else{
            delete this._dragging;
        }
    }

    /**
     * Set the current media's time
     *
     * @param {Number} time The media's time in centiseconds
     * @return {this}
     */
    setTime(time){
        /**
         * The current time in seconds
         * @type {Number}
         */
        this.time = toSeconds(time);

        if(this.duration || this.resampled_data){
            this.updatePlayhead(true);
        }
    }

    /**
     * Set the current wave's offset
     *
     * @param {Number} offset The wave's offset left position
     * @param {Boolean} forceRedraw Whether to force layers update
     * @param {Boolean} [supressEvent=false] Whether to supress the offsetupdate event
     * @return {this}
     */
    setOffset(offset, forceRedraw, supressEvent){
        if(this.resampled_data && this.width > 0){
            let new_offset = offset;

            new_offset = Math.max(0, new_offset);
            new_offset = Math.min(this.resampled_data.adapter.length - this.width, new_offset);
            new_offset = Math.round(new_offset);

            if(forceRedraw || new_offset !== this.offset){
                /**
                 * The wave's offset left position
                 * @type {Number}
                 */
                this.offset = new_offset;

                this.update();

                const start = this.getTimeAt(0);
                const end = this.getTimeAt(this.width);

                if(supressEvent !== true){
                    this.triggerEvent('offsetupdate', {'start': start, 'end': end});
                }
            }
        }

        return this;
    }

    /**
     * Update the offset in order to put the playhead's position at the center
     *
     * @param {Number} time The time in centiseconds to center to
     * @param {Boolean} [supressEvent=false] Whether to supress the offsetupdate event
     * @return {this}
     */
    centerToTime(time, supressEvent){
        if(this.resampled_data && this.width > 0){
            const offset = this.resampled_data.at_time(toSeconds(time)) - this.width/2;
            this.setOffset(offset, false, supressEvent);
        }

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
            return this.resampled_data.time(x + this.offset);
        }
        else if(this.duration){
            return x * this.duration / this.width;
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
            return this.resampled_data.at_time(time) - this.offset;
        }
        else if(this.duration){
            return Math.round(time / this.duration * this.width);
        }

        return null;
    }

    /**
     * Get number of pixels corresponding to a period of time
     *
     * @param {Number} time The time in seconds
     * @return {Number} The corresponding pixel size
     */
    timeToPixels(time){
        if(this.resampled_data){
            const adapter = this.resampled_data.adapter;
            return Math.floor(time * adapter.sample_rate / adapter.scale);
        }
        else if(this.duration){
            return Math.round(time / this.duration * this.width);
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
