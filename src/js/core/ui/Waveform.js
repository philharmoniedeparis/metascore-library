import Dom from '../Dom';
import {toCentiseconds, toSeconds, formatTime} from '../utils/Media';

import '../../../css/core/ui/Waveform.less';

/**
 * Fired when the playhead is clicked
 *
 * @event playheadclick
 * @param {Object} waveform The Waveform instance
 * @param {Number} x The relative x position of the click
 * @param {Number} y The relative y position of the click
 * @param {Number} time The time in centiseconds corresponding to the x position
 */
const EVT_PLAYHEADUPDATE = 'playheadupdate';

export default class Waveform extends Dom {

    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': 'waveform'});

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.time = 0;

        const layers = new Dom('<div/>', {'class': 'layers'})
            .appendTo(this);

        this.wave_layer = new Dom('<canvas/>', {'class': 'layer wave'})
            .appendTo(layers);

        if(this.configs.axis){
            this.axis_layer = new Dom('<canvas/>', {'class': 'layer axis'})
                .appendTo(layers);
        }

        if(this.configs.playhead){
            this.playhead_layer = new Dom('<canvas/>', {'class': 'layer playhead'})
                .appendTo(layers);
        }

        this.onMousemove = this.onMousemove.bind(this);
        this.onMouseup = this.onMouseup.bind(this);
        layers.addListener('mousedown', this.onMousedown.bind(this));
        layers.addListener('click', this.onClick.bind(this));
    }

    static getDefaults(){
        return {
            'wave': {
                'color': '#0000fe',
                'margin': 20
            },
            'axis': {
                'step': 1,
                'tickWidth': 1,
                'tickHeight': 5,
                'tickColor': '#999',
                'textColor': '#999',
                'font': '11px sans-serif'
            },
            'playhead': {
                'width': 1,
                'color': '#000'
            },
            'draggable': true
        };
    }

    setData(waveformdata){
        this.waveformdata = waveformdata;

        this.updateSize();
    }

    updateSize(){
        this.width = this.waveformdata.offset_end;
        this.height = this.get(0).clientHeight;

        this.wave_layer.get(0).width = this.width;
        this.wave_layer.get(0).height = this.height;

        if(this.axis_layer){
            this.axis_layer.get(0).width = this.width;
            this.axis_layer.get(0).height = this.height;
        }

        if(this.playhead_layer){
            this.playhead_layer.get(0).width = this.width;
            this.playhead_layer.get(0).height = this.height;
        }

        this.redraw();
    }

    redraw(){
        this.updateWave();
        this.updateAxis();
        this.updatePlayhead();
    }

    updateWave(){
        const adapter = this.waveformdata.adapter;
        const layer = this.wave_layer;
        const canvas = layer.get(0);
        const width = canvas.width;
        const height = canvas.height - (this.configs.wave.margin * 2);
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();

        for (let x = 0; x < width; x++) {
            const val = adapter.at(2 * x);
            context.lineTo(x + 0.5, this.scaleY(val, height) + this.configs.wave.margin + 0.5);
        }

        for (let x = width - 1; x >= 0; x--) {
            const val = adapter.at(2 * x + 1);
            context.lineTo(x + 0.5, this.scaleY(val, height) + this.configs.wave.margin + 0.5);
        }

        context.closePath();
        context.fillStyle = this.configs.wave.color;
        context.fill();
    }

    scaleY(amplitude, height) {
        const range = 256;
        const offset = 128;

        return height - ((amplitude + offset) * height) / range;
    }

    updateAxis(){
        if(!this.axis_layer){
            return;
        }

        const layer = this.axis_layer;
        const canvas = layer.get(0);
        const height = canvas.height;
        const context = canvas.getContext('2d');
        const limit = this.waveformdata.duration;
        const step = 1;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.strokeStyle = this.configs.axis.tickColor;
        context.lineWidth = this.configs.axis.tickWidth;
        context.font = this.configs.axis.font;
        context.fillStyle = this.configs.axis.textColor;
        context.textAlign = 'center';
        context.textBaseline = 'bottom';

        for(let time = step; time < limit; time+=step){
            const x = this.getPositionAt(time);

            context.moveTo(x, 0);
            context.lineTo(x, this.configs.axis.tickHeight);
            context.stroke();

            context.moveTo(x, height);
            context.lineTo(x, height - this.configs.axis.tickHeight);
            context.stroke();

            const text = formatTime(toCentiseconds(time));
            context.fillText(text, x, height - this.configs.axis.tickHeight);
        }
    }

    updatePlayhead(){
        if(!this.playhead_layer){
            return;
        }

        const layer = this.playhead_layer;
        const canvas = layer.get(0);
        const height = canvas.height;
        const context = canvas.getContext('2d');
        const x = this.getPositionAt(this.time);

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.lineWidth = this.configs.playhead.width;
        context.strokeStyle = this.configs.playhead.color;
        context.stroke();

        if(!this._dragging){
            const offset = 50;
            const dom = this.get(0);

            if((dom.scrollLeft > x - offset) || (dom.scrollLeft - x + dom.offsetWidth < offset)){
                dom.scrollLeft = Math.max(0, x - offset);
            }
        }
    }

    onMousedown(evt){
        if(this.configs.draggable){
            this._mousedown_x = evt.clientX;
        }

        this
            .addListener('mousemove', this.onMousemove)
            .addListener('mouseup', this.onMouseup);
    }

    onMousemove(evt){
        if(this.configs.draggable){
            if(evt.clientX === this._mousedown_x){
                return;
            }

            this._dragging = true;
            this.get(0).scrollLeft += this._mousedown_x - evt.clientX;
            this._mousedown_x = evt.clientX;
        }
        else{
            const offset = evt.target.getBoundingClientRect();
            const x = evt.pageX - offset.left;
            const time = this.getTimeAt(x);

            this.triggerEvent(EVT_PLAYHEADUPDATE, {'waveform': this, 'time': time});
        }
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
            const time = this.getTimeAt(x);

            this.triggerEvent(EVT_PLAYHEADUPDATE, {'waveform': this, 'time': time});
        }
        else{
            delete this._dragging;
        }
    }

    setTime(time){
        this.time = toSeconds(time);
        this.updatePlayhead();
    }

    getTimeAt(x){
        return toCentiseconds(this.waveformdata.time(x));
    }

    getPositionAt(time){
        return this.waveformdata.at_time(time) + 0.5;
    }
}
