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
const EVT_PLAYHEADCLICK = 'playheadclick';

class ZoomView extends Dom {

    constructor() {
        // call parent constructor
        super('<div/>', {'class': 'zoom'});

        this.onMousemove = this.onMousemove.bind(this);
        this.onMouseup = this.onMouseup.bind(this);

        this.time = 0;

        const layers = new Dom('<div/>', {'class': 'layers'})
            .appendTo(this);

        this.wave_layer = new Dom('<canvas/>', {'class': 'layer wave'})
            .appendTo(layers);

        this.axis_layer = new Dom('<canvas/>', {'class': 'layer axis'})
            .appendTo(layers);

        this.playhead_layer = new Dom('<canvas/>', {'class': 'layer playhead'})
            .appendTo(layers);

        layers.addListener('mousedown', this.onMousedown.bind(this));
    }

    update(waveformdata){
        this.waveformdata = waveformdata;

        this.updateSize();
    }

    updateSize(){
        this.width = this.waveformdata.offset_end;
        this.height = this.get(0).clientHeight;

        this.wave_layer.get(0).width = this.width;
        this.wave_layer.get(0).height = this.height;

        this.axis_layer.get(0).width = this.width;
        this.axis_layer.get(0).height = this.height;

        this.playhead_layer.get(0).width = this.width;
        this.playhead_layer.get(0).height = this.height;

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
        const margin = 25;
        const width = canvas.width;
        const height = canvas.height - margin*2;
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();

        for (let x = 0; x < width; x++) {
            const val = adapter.at(2 * x);
            context.lineTo(x + 0.5, this.scaleY(val, height) + margin + 0.5);
        }

        for (let x = width - 1; x >= 0; x--) {
            const val = adapter.at(2 * x + 1);
            context.lineTo(x + 0.5, this.scaleY(val, height) + margin + 0.5);
        }

        context.closePath();
        context.fillStyle = "#0000fe";
        context.fill();
    }

    scaleY(amplitude, height) {
        const range = 256;
        const offset = 128;

        return height - ((amplitude + offset) * height) / range;
    }

    updateAxis(){
        const layer = this.axis_layer;
        const canvas = layer.get(0);
        const height = canvas.height;
        const context = canvas.getContext('2d');
        const limit = this.waveformdata.duration;
        const step = 1;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.strokeStyle = "#999";
        context.lineWidth = 1;
        context.font = '11px sans-serif';
        context.fillStyle = '#999';
        context.textAlign = 'center';
        context.textBaseline = 'bottom';

        for(let time = step; time < limit; time+=step){
            const x = this.waveformdata.at_time(time) + 0.5;

            context.moveTo(x, 0);
            context.lineTo(x, 10);
            context.stroke();

            context.moveTo(x, height);
            context.lineTo(x, height - 10);
            context.stroke();

            const text = formatTime(toCentiseconds(time));
            context.fillText(text, x, height - 10);
        }
    }

    updatePlayhead(){
        const layer = this.playhead_layer;
        const canvas = layer.get(0);
        const height = canvas.height;
        const context = canvas.getContext('2d');
        const x = this.waveformdata.at_time(toSeconds(this.time)) + 0.5;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.lineWidth = 1;
        context.strokeStyle = "#000";
        context.stroke();

        if(!this._dragging){
            const offset = 50;
            const dom = this.get(0);
            if((dom.scrollLeft - x > offset) || (dom.scrollLeft - x + dom.offsetWidth < offset)){
                dom.scrollLeft = Math.max(0, x - offset);
            }
        }
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

        this.get(0).scrollLeft += this._mousedown_x - evt.clientX;

        this._mousedown_x = evt.clientX;
    }

    onMouseup(evt){
        this
            .removeListener('mousemove', this.onMousemove)
            .removeListener('mouseup', this.onMouseup);

        if(!this._dragging){
            const offset = evt.target.getBoundingClientRect();
            const x = evt.pageX - offset.left;
            const y = evt.pageX - offset.left;
            const time = toCentiseconds(this.waveformdata.time(x));

            this.triggerEvent(EVT_PLAYHEADCLICK, {'waveform': this, 'time': time, 'x': x, 'y': y});
        }
        else{
            delete this._dragging;
        }
    }

    setTime(time){
        this.time = time;
        this.updatePlayhead();
    }
}

class OverviewView extends Dom {

    constructor() {
        // call parent constructor
        super('<div/>', {'class': 'overview'});

        this.time = 0;

        const layers = new Dom('<div/>', {'class': 'layers'})
            .appendTo(this);

        this.wave_layer = new Dom('<canvas/>', {'class': 'layer wave'})
            .appendTo(layers);

        this.playhead_layer = new Dom('<canvas/>', {'class': 'layer playhead'})
            .appendTo(layers);
    }

    update(waveformdata){
        const width = this.get(0).clientWidth;
        this.waveformdata = waveformdata.resample({ 'width': width });
        this.updateSize();
    }

    updateSize(){
        this.width = this.get(0).clientWidth;
        this.height = this.get(0).clientHeight;

        this.wave_layer.get(0).width = this.width;
        this.wave_layer.get(0).height = this.height;

        this.playhead_layer.get(0).width = this.width;
        this.playhead_layer.get(0).height = this.height;

        this.redraw();
    }

    redraw(){
        this.updateWave();
        this.updatePlayhead();
    }

    updateWave(){
        const adapter = this.waveformdata.adapter;
        const layer = this.wave_layer;
        const canvas = layer.get(0);
        const width = canvas.width;
        const height = canvas.height;
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();

        for (let x = 0; x < width; x++) {
            const val = adapter.at(2 * x);
            context.lineTo(x + 0.5, this.scaleY(val, height) + 0.5);
        }

        for (let x = width - 1; x >= 0; x--) {
            const val = adapter.at(2 * x + 1);
            context.lineTo(x + 0.5, this.scaleY(val, height) + 0.5);
        }

        context.closePath();
        context.fillStyle = "#0000fe";
        context.fill();
    }

    scaleY(amplitude, height) {
        const range = 256;
        const offset = 128;

        return height - ((amplitude + offset) * height) / range;
    }

    updatePlayhead(){
        const layer = this.playhead_layer;
        const canvas = layer.get(0);
        const height = canvas.height;
        const context = canvas.getContext('2d');
        const x = this.waveformdata.at_time(toSeconds(this.time)) + 0.5;

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.lineWidth = 1;
        context.strokeStyle = "#000";
        context.stroke();

        if(!this._dragging){
            const offset = 50;
            const dom = this.get(0);
            if((dom.scrollLeft - x > offset) || (dom.scrollLeft - x + dom.offsetWidth < offset)){
                dom.scrollLeft = Math.max(0, x - offset);
            }
        }
    }

    setTime(time){
        this.time = time;
        this.updatePlayhead();
    }
}

export default class Waveform extends Dom {

    /**
     * A waveform representation
     *
     * @class Waveform
     * @extends Dom
     * @constructor
     */
    constructor() {
        // call parent constructor
        super('<div/>', {'class': 'waveform'});

        this.overview = new OverviewView().appendTo(this);
        this.zoom = new ZoomView().appendTo(this);
    }

    setWaveData(waveformdata){
        this.zoom.update(waveformdata);
        this.overview.update(waveformdata);
    }

    setTime(time){
        this.zoom.setTime(time);
        this.overview.setTime(time);
    }

    updateSize(){
        this.zoom.update();
        this.overview.update();
    }

}
