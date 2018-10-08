import Dom from '../../core/Dom';
import {toCentiseconds, toSeconds, formatTime} from '../utils/Media';

import '../../../css/editor/waveform/Overview.less';

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


export default class Overview extends Dom {

    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': 'view overview'});

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.time = 0;

        const layers = new Dom('<div/>', {'class': 'layers'})
            .appendTo(this);

        this.wave_layer = new Dom('<canvas/>', {'class': 'layer wave'})
            .appendTo(layers);

        this.highlight_layer = new Dom('<canvas/>', {'class': 'layer highlight'})
            .appendTo(layers);

        this.playhead_layer = new Dom('<canvas/>', {'class': 'layer playhead'})
            .appendTo(layers);

        layers.addListener('click', this.onClick.bind(this));
    }

    static getDefaults(){
        return {
            'waveColor': '#0000fe',
            'waveMargin': 20,
            'playheadWidth': 1,
            'playheadColor': '#000',
            'highlightColor': '#000',
            'highlightOpacity': 0.25
        };
    }

    setData(waveformdata){
        this.waveformdata = waveformdata;
    }

    updateWave(){
        const adapter = this.waveformdata.adapter;
        const layer = this.wave_layer;
        const canvas = layer.get(0);
        const width = canvas.width;
        const height = canvas.height - (this.configs.waveMargin * 2);
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();

        for (let x = 0; x < width; x++) {
            const val = adapter.at(2 * x);
            context.lineTo(x + 0.5, this.scaleY(val, height) + this.configs.waveMargin + 0.5);
        }

        for (let x = width - 1; x >= 0; x--) {
            const val = adapter.at(2 * x + 1);
            context.lineTo(x + 0.5, this.scaleY(val, height) + this.configs.waveMargin + 0.5);
        }

        context.closePath();
        context.fillStyle = this.configs.waveColor;
        context.fill();
    }

    updatePlayhead(){
        const layer = this.playhead_layer;
        const canvas = layer.get(0);
        const height = canvas.height;
        const context = canvas.getContext('2d');
        const x = this.getPositionAt(this.time);

        context.clearRect(0, 0, canvas.width, canvas.height);

        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.lineWidth = this.configs.playheadWidth;
        context.strokeStyle = this.configs.playheadColor;
        context.stroke();

        if(!this._dragging){
            const offset = 50;
            const dom = this.get(0);

            if((dom.scrollLeft > x - offset) || (dom.scrollLeft - x + dom.offsetWidth < offset)){
                dom.scrollLeft = Math.max(0, x - offset);
            }
        }
    }

    onClick(evt){
        const offset = evt.target.getBoundingClientRect();
        const x = evt.pageX - offset.left;
        const time = this.getTimeAt(x);

        this.triggerEvent(EVT_PLAYHEADUPDATE, {'waveform': this, 'time': time});
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

    scaleY(amplitude, height) {
        const range = 256;
        const offset = 128;

        return height - ((amplitude + offset) * height) / range;
    }

}
