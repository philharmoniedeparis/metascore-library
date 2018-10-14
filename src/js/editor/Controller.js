import Dom from '../core/Dom';
import WaveformOverview from './waveform/Overview';
import WaveformZoom from './waveform/Zoom';
import TimeField from './field/Time';

import '../../css/editor/Controller.less';

/**
 * Fired when the time is set
 *
 * @event timeset
 * @param {Object} controller The Controller instance
 * @param {Number} time The time in centiseconds
 */
const EVT_TIMESET = 'timeset';

export default class Controller extends Dom {

    /**
     * The editor's main menu
     *
     * @class Controller
     * @extends Dom
     * @constructor
     */
    constructor() {
        // call parent constructor
        super('<div/>', {'class': 'controller'});

        this.setupUI();
    }

    /**
     * Setup the menu's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        const controls = new Dom('<div/>', {'class': 'controls'})
            .appendTo(this);

        this.timefield = new TimeField()
            .appendTo(controls);

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(controls);

        this.rewind_btn = new Dom('<button/>')
            .data('action', 'rewind')
            .appendTo(buttons);

        this.play_btn = new Dom('<button/>')
            .data('action', 'play')
            .appendTo(buttons);

        const waveform = new Dom('<div/>', {'class': 'waveform'})
            .addListener('playheadclick', this.onWaveformPlayheadClick.bind(this))
            .appendTo(this);

        this.overview = new WaveformOverview()
            .appendTo(waveform);

        this.zoom = new WaveformZoom()
            .addListener('offsetupdate', this.onZoomOffsetUpodate.bind(this))
            .appendTo(waveform);
    }

    setDuration(duration){
        this.timefield.setMax(duration);

        this.overview
            .updateSize()
            .setDuration(duration);

        this.zoom
            .updateSize()
            .setDuration(duration);
    }

    setWaveformData(data){
        this.overview
            .updateSize()
            .setData(data.resample({'width': this.overview.get(0).clientWidth}));

        this.zoom
            .updateSize()
            .setData(data);
    }

    clearWaveform(){
        this.overview.clear();
        this.zoom.clear();
    }

    setTime(time){
        this.timefield.setValue(time, true);
        this.overview.setTime(time);
        this.zoom.setTime(time);
    }

    onWaveformPlayheadClick(evt){
        const time = evt.detail.time;

        if(Dom.is(evt.target, '.overview')){
            this.zoom.centerOffsetToTime(time);
        }

        this.triggerEvent(EVT_TIMESET, {'time': time});
    }

    onZoomOffsetUpodate(evt){
        const start = evt.detail.start;
        const end = evt.detail.end;

        this.overview.setHighlight(start, end, true);
    }

}
