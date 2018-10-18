import Dom from '../../core/Dom';
import {toCentiseconds, toSeconds} from '../../core/utils/Media';

/**
 * Fired when the playhead is clicked
 *
 * @event playheadclick
 * @param {Number} time The time in centiseconds corresponding to click position
 */
const EVT_PLAYHEADCLICK = 'playheadclick';


export default class Overview extends Dom {

    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': 'view overview'});

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        const layers = new Dom('<div/>', {'class': 'layers'})
            .appendTo(this);

        this.wave_layer = new Dom('<canvas/>', {'class': 'layer wave'})
            .appendTo(layers);

        this.highlight_layer = new Dom('<canvas/>', {'class': 'layer highlight'})
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
            'waveColor': '#999',
            'highlightColor': '#0000fe',
            'highlightOpacity': 0.25,
            'playheadWidth': 1,
            'playheadColor': '#000'
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

    setDuration(duration){
        this.duration = toSeconds(duration);

        return this;
    }

    setData(waveformdata){
        this.waveformdata = waveformdata.resample({'width': this.width});

        this.update();

        this.addClass('has-data');

        return this;
    }

    clear(){
        delete this.duration;
        delete this.waveformdata;

        this.find('canvas').forEach((canvas) => {
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, this.width, this.height);
        });

        this.removeClass('has-data');

        return this;
    }

    updateWave(){
        const adapter = this.waveformdata.adapter;
        const canvas = this.wave_layer.get(0);
        const context = canvas.getContext('2d');

        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();

        for(let x = 0; x < this.width; x++) {
            const val = adapter.at(2 * x);
            context.lineTo(x + 0.5, this.scaleY(val, this.height) + 0.5);
        }

        for(let x = this.width - 1; x >= 0; x--) {
            const val = adapter.at(2 * x + 1);
            context.lineTo(x + 0.5, this.scaleY(val, this.height) + 0.5);
        }

        context.closePath();
        context.fillStyle = this.configs.waveColor;
        context.fill();
    }

    updatePlayhead(){
        const canvas = this.playhead_layer.get(0);
        const context = canvas.getContext('2d');
        let x = 0;

        if(this.waveformdata){
            x = this.getPositionAt(this.time) + 0.5;
        }
        else if(this.duration){
            x = Math.round(this.time / this.duration * this.width) + 0.5;
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
        this.updatePlayhead();
    }

    onMousedown(){
        new Dom(this.get(0).ownerDocument)
            .addListener('mousemove', this.onMousemove)
            .addListener('mouseup', this.onMouseup)
            .addListener('blur', this.onMouseup);
    }

    onMousemove(evt){
        const offset = evt.target.getBoundingClientRect();
        const x = evt.pageX - offset.left;
        const time = toCentiseconds(this.getTimeAt(x));

        this._dragging = true;

        this.triggerEvent(EVT_PLAYHEADCLICK, {'time': time});
    }

    onMouseup(){
        new Dom(this.get(0).ownerDocument)
            .removeListener('mousemove', this.onMousemove)
            .removeListener('mouseup', this.onMouseup)
            .removeListener('blur', this.onMouseup);
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

        if(this.duration || this.waveformdata){
            this.updatePlayhead();
        }
    }

    setHighlight(start, end){
        const canvas = this.highlight_layer.get(0);
        const context = canvas.getContext('2d');
        const x = this.getPositionAt(start);
        const width = this.getPositionAt(end) - x;

        context.clearRect(0, 0, this.width, this.height);

        context.globalAlpha = this.configs.highlightOpacity;
        context.fillStyle = this.configs.highlightColor;
        context.fillRect(x, 0, width, this.height);
    }

    getTimeAt(x){
        return this.waveformdata.time(x);
    }

    getPositionAt(time){
        return this.waveformdata.at_time(time);
    }

    scaleY(amplitude, height) {
        const range = 256;
        const offset = 128;

        return height - ((amplitude + offset) * height) / range;
    }

}
