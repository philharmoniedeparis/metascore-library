import Dom from '../../core/Dom';
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

        const layers = new Dom('<div/>', {'class': 'layers'})
            .appendTo(this);

        this.wave_layer = new Dom('<canvas/>', {'class': 'layer wave'})
            .appendTo(layers);

        this.axis_layer = new Dom('<canvas/>', {'class': 'layer axis'})
            .appendTo(layers);

        this.playhead_layer = new Dom('<canvas/>', {'class': 'layer playhead'})
            .appendTo(layers);

        this.onMousemove = this.onMousemove.bind(this);
        this.onMouseup = this.onMouseup.bind(this);

        layers.addListener('mousedown', this.onMousedown.bind(this));
        layers.addListener('click', this.onClick.bind(this));
    }

    static getDefaults(){
        return {
            'waveColor': '#0000fe',
            'waveMargin': 20,
            'axisStep': 1,
            'axisTickWidth': 1,
            'axisTickHeight': 6,
            'axisTickColor': '#333',
            'axisTextColor': '#555',
            'axisFont': '11px sans-serif',
            'playheadWidth': 1,
            'playheadColor': '#000',
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

    setData(waveformdata){
        this.waveformdata = waveformdata;

        this.setOffset(0);

        return this;
    }

    updateWave(){
        const adapter = this.waveformdata.adapter;
        const canvas = this.wave_layer.get(0);
        const context = canvas.getContext('2d');
        const margin = this.configs.waveMargin;
        const height = this.height - (margin * 2);

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();

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
        const step = 1;

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();

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

            context.moveTo(x, 0);
            context.lineTo(x, this.configs.axisTickHeight);
            context.stroke();

            context.moveTo(x, this.height);
            context.lineTo(x, this.height - this.configs.axisTickHeight);
            context.stroke();

            const text = formatTime(toCentiseconds(time));
            context.fillText(text, x, this.height - this.configs.axisTickHeight);
        }
    }

    updatePlayhead(update_offset){
        const canvas = this.playhead_layer.get(0);
        const x = this.getPositionAt(this.time) + 0.5;

        if(update_offset === true){
            if(x < 0 || x > this.width - 10){
                this.setOffset(this.offset + x - 10);
                return;
            }
        }

        const context = canvas.getContext('2d');

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();

        context.moveTo(x, 0);
        context.lineTo(x, this.height);
        context.lineWidth = this.configs.playheadWidth;
        context.strokeStyle = this.configs.playheadColor;
        context.stroke();
    }

    onMousedown(evt){
        this._mousedown_x = evt.clientX;

        this
            .addListener('mousemove', this.onMousemove)
            .addListener('mouseup', this.onMouseup);
    }

    onMousemove(evt){
        if(evt.clientX === this._mousedown_x){
            return;
        }

        this._dragging = true;

        this.setOffset(this.offset + this._mousedown_x - evt.clientX);

        this._mousedown_x = evt.clientX;

    }

    onMouseup(){
        this
            .removeListener('mousemove', this.onMousemove)
            .removeListener('mouseup', this.onMouseup);
    }

    onClick(evt){
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

        this.updatePlayhead(true);
    }

    setOffset(offset, supressEvent){
        let new_offset = offset;

        new_offset = Math.max(0, new_offset);
        new_offset = Math.min(this.waveformdata.adapter.length - this.width, new_offset);
        new_offset = Math.round(new_offset);

        if(new_offset === this.offset){
            return;
        }

        this.offset = new_offset;

        this.updateWave();
        this.updateAxis();
        this.updatePlayhead();

        const start = this.getTimeAt(0);
        const end = this.getTimeAt(this.width);

        if(supressEvent !== true){
            this.triggerEvent(EVT_OFFSETUPDATE, {'start': start, 'end': end});
        }
    }

    centerOffsetToTime(time, supressEvent){
        const offset = this.waveformdata.at_time(toSeconds(time)) - this.width/2;

        this.setOffset(offset, supressEvent);
    }

    getTimeAt(x){
        return this.waveformdata.time(x + this.offset);
    }

    getPositionAt(time){
        return this.waveformdata.at_time(time) - this.offset;
    }

    scaleY(amplitude, height) {
        const range = 256;
        const offset = 128;

        return height - ((amplitude + offset) * height) / range;
    }

}
