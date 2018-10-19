import Dom from '../../core/Dom';
import SliderField from '../field/Slider';
import {toCentiseconds, toSeconds, formatTime} from '../../core/utils/Media';

/**
 * Fired when the playhead is clicked
 *
 * @event playheadclick
 * @param {Number} time The time in centiseconds corresponding to the click position
 */
const EVT_PLAYHEADCLICK = 'playheadclick';

/**
 * Fired when the offset is updated
 *
 * @event offsetupdate
 * @param {Object} waveform The Waveform instance
 * @param {Number} start The start time of the offset in seconds
 * @param {Number} end The end time of the offset in seconds
 */
const EVT_OFFSETUPDATE = 'offsetupdate';


export default class Zoom extends Dom {

    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': 'view zoom'});

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.time = 0;

        this.message = new Dom('<div/>', {'class': 'message'})
            .appendTo(this);

        const layers = new Dom('<div/>', {'class': 'layers'})
            .appendTo(this);

        this.wave_layer = new Dom('<canvas/>', {'class': 'layer wave'})
            .appendTo(layers);

        this.axis_layer = new Dom('<canvas/>', {'class': 'layer axis'})
            .appendTo(layers);

        this.playhead_layer = new Dom('<canvas/>', {'class': 'layer playhead'})
            .appendTo(layers);

        const controls = new Dom('<div/>', {'class': 'controls'})
            .appendTo(this);

        this.zoom_out_btn = new Dom('<button/>', {'text': '&minus;'})
            .data('action', 'zoom-out')
            .addListener('mousedown', () => {
                this.zoom_interval = setInterval(() => {
                    this.zoomOut();
                }, this.configs.zoomButtonInterval);
            })
            .addListener('mouseup', () => {
                clearInterval(this.zoom_interval);
                delete this.zoom_interval;
            })
            .addListener('click', (evt) => {
                evt.stopPropagation();
            })
            .appendTo(controls);

        this.zoom_slider = new SliderField({'reversed': true, 'triggerChangeOnDrag': true})
            .addListener('valuechange', (evt) => {
                this.setZoom(evt.detail.value);
            })
            .appendTo(controls);

        this.zoom_in_btn = new Dom('<button/>', {'text': '&plus;'})
            .data('action', 'zoom-in')
            .addListener('mousedown', () => {
                this.zoom_interval = setInterval(() => {
                    this.zoomIn();
                }, this.configs.zoomButtonInterval);
            })
            .addListener('mouseup', () => {
                clearInterval(this.zoom_interval);
                delete this.zoom_interval;
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

    updateSize(){
        this.width = this.get(0).clientWidth;
        this.height = this.get(0).clientHeight;

        this.find('canvas').forEach((canvas) => {
            canvas.width = this.width;
            canvas.height = this.height;
        });

        return this;
    }

    setMessage(text){
        this.message.text(text);

        return this;
    }

    setDuration(duration){
        this.duration = toSeconds(duration);
        this.updateAxis();

        return this;
    }

    setData(waveformdata){
        this.waveformdata = waveformdata;
        this.resampled_data = this.waveformdata.resample({'width': this.width});

        this.max_scale = this.resampled_data.adapter.scale;

        this.zoom_slider
            .setMin(this.waveformdata.adapter.scale)
            .setMax(this.max_scale)
            .setStep(2)
            .setValue(this.max_scale, true);

        this.setOffset(0, true);

        this
            .addListener('mousewheel', this.onMouseWheel)
            .addListener('DOMMouseScroll', this.onMouseWheel)
            .addClass('has-data');

        return this;
    }

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

    updateWave(){
        const canvas = this.wave_layer.get(0);
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();

        if(!this.resampled_data){
            return;
        }

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

    updateAxis(){
        const canvas = this.axis_layer.get(0);
        const context = canvas.getContext('2d');
        const step = this.getAxisStep();

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();

        if(step === null){
            return;
        }

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

    updatePlayhead(update_offset){
        const canvas = this.playhead_layer.get(0);
        const context = canvas.getContext('2d');
        const x = this.getPositionAt(this.time) + 0.5;

        if(this.resampled_data){
            if(update_offset === true && !this._dragging){
                if(x < 0 || x > this.width - 10){
                    this.setOffset(this.offset + x - 10);
                    return;
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

    zoomIn(){
        const adapter = this.resampled_data.adapter;
        this.setZoom(adapter.scale - this.configs.zoomStep);
    }

    zoomOut(){
        const adapter = this.resampled_data.adapter;
        this.setZoom(adapter.scale + this.configs.zoomStep);
    }

    setZoom(scale){
        const min = this.waveformdata.adapter.scale;
        const max = this.max_scale;

        let clamped = parseInt(scale, 10);
        clamped = Math.min(Math.max(scale, min), max);

        if(clamped === this.resampled_data.adapter.scale){
            return;
        }

        this.resampled_data = this.waveformdata.resample({'scale': clamped});

        this.zoom_out_btn.toggleClass('disabled', clamped >= max);
        this.zoom_in_btn.toggleClass('disabled', clamped <= min);
        this.zoom_slider.setValue(scale, true);

        const offset = this.resampled_data.at_time(this.time) - this.width/2;
        this.setOffset(offset, true);
    }

    onMousedown(evt){
        this._mousedown_x = evt.clientX;

        new Dom(this.get(0).ownerDocument)
            .addListener('mousemove', this.onMousemove)
            .addListener('mouseup', this.onMouseup)
            .addListener('blur', this.onMouseup);
    }

    onMousemove(evt){
        if(evt.clientX === this._mousedown_x || !this.resampled_data){
            return;
        }

        this._dragging = true;

        this.setOffset(this.offset + this._mousedown_x - evt.clientX);
        this._mousedown_x = evt.clientX;
    }

    onMouseup(){
        new Dom(this.get(0).ownerDocument)
            .removeListener('mousemove', this.onMousemove)
            .removeListener('mouseup', this.onMouseup)
            .removeListener('blur', this.onMouseup);
    }

    /**
     * The mousewheel event handler
     *
     * @method onMouseWheel
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

    onClick(evt){
        if(!this.duration && !this.resampled_data){
            return;
        }

        if(!this._dragging){
            const offset = evt.target.getBoundingClientRect();
            const x = evt.pageX - offset.left;
            const time = toCentiseconds(this.getTimeAt(x));

            this.triggerEvent(EVT_PLAYHEADCLICK, {'time': time});
        }
        else{
            delete this._dragging;
        }
    }

    setTime(time){
        this.time = toSeconds(time);

        if(this.duration || this.resampled_data){
            this.updatePlayhead(true);
        }
    }

    setOffset(offset, forceRedraw, supressEvent){
        let new_offset = offset;

        new_offset = Math.max(0, new_offset);
        new_offset = Math.min(this.resampled_data.adapter.length - this.width, new_offset);
        new_offset = Math.round(new_offset);

        if(!forceRedraw && new_offset === this.offset){
            return;
        }

        this.offset = new_offset;

        this.update();

        const start = this.getTimeAt(0);
        const end = this.getTimeAt(this.width);

        if(supressEvent !== true){
            this.triggerEvent(EVT_OFFSETUPDATE, {'start': start, 'end': end});
        }
    }

    centerOffsetToTime(time, supressEvent){
        const offset = this.resampled_data.at_time(toSeconds(time)) - this.width/2;

        this.setOffset(offset, false, supressEvent);
    }

    getTimeAt(x){
        if(this.resampled_data){
            return this.resampled_data.time(x + this.offset);
        }
        else if(this.duration){
            return x * this.duration / this.width;
        }

        return null;
    }

    getPositionAt(time){
        if(this.resampled_data){
            return this.resampled_data.at_time(time) - this.offset;
        }
        else if(this.duration){
            return Math.round(time / this.duration * this.width);
        }

        return null;
    }

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

    scaleY(amplitude, height) {
        const range = 256;
        const offset = 128;

        return height - ((amplitude + offset) * height) / range;
    }

}
