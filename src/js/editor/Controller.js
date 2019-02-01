import Dom from '../core/Dom';
import WaveformOverview from './waveform/Overview';
import WaveformZoom from './waveform/Zoom';
import TimeField from './field/Time';
import Locale from '../core/Locale';
import ResizeObserver from 'resize-observer-polyfill';

import {className} from '../../css/editor/Controller.less';

/**
 * A controller with a play/pause button, a waveform, etc
 *
 * @emits {timeset} Fired when the time is set
 * @param {Object} controller The Controller instance
 * @param {Number} time The time in centiseconds
 */
export default class Controller extends Dom {

    /**
     * Instantiate
     */
    constructor() {
        // call parent constructor
        super('<div/>', {'class': `controller ${className}`});

        this.setupUI();
    }

    /**
     * Setup the menu's UI
     *
     * @private
     */
    setupUI() {
        const controls = new Dom('<div/>', {'class': 'controls'})
            .appendTo(this);

        /**
         * The time field
         * @type {TimeField}
         */
        this.timefield = new TimeField()
            .appendTo(controls);

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(controls);

        /**
         * The rewind button
         * @type {Dom}
         */
        this.rewind_btn = new Dom('<button/>')
            .data('action', 'rewind')
            .appendTo(buttons);

        /**
         * The play button
         * @type {Dom}
         */
        this.play_btn = new Dom('<button/>')
            .data('action', 'play')
            .addListener('keydown', this.onPlayBtnKeydown.bind(this))
            .appendTo(buttons);

        const waveform = new Dom('<div/>', {'class': 'waveform'})
            .addListener('playheadclick', this.onWaveformPlayheadClick.bind(this))
            .appendTo(this);

        /**
         * The waveform's overview
         * @type {Dom}
         */
        this.overview = new WaveformOverview()
            .appendTo(waveform);

        /**
         * The waveform's zoom
         * @type {Dom}
         */
        this.zoom = new WaveformZoom()
            .addListener('offsetupdate', this.onZoomOffsetUpodate.bind(this))
            .appendTo(waveform);

        const resize_observer = new ResizeObserver(this.onWaveformResize.bind(this));
        resize_observer.observe(waveform.get(0));
    }

    /**
     * Set the media's duration
     *
     * @param {Number} duration The media's duration in centiseconds
     * @return {this}
     */
    setDuration(duration){
        this.timefield.setMax(duration);

        this.overview
            .updateSize()
            .setDuration(duration)
            .update();

        this.zoom
            .updateSize()
            .setDuration(duration)
            .update()
            .setMessage(Locale.t('editor.Controller.zoom.loading', 'Loading waveform...'));

        return this;
    }

    /**
     * Set the waveform data
     *
     * @param {WaveformData} data The waveform data, or null if none could be retreived
     * @return {this}
     */
    setWaveformData(data){
        if(data){
            let range = 0;
            for(let x = 0; x < data.adapter.length; x++) {
                const min = data.adapter.at(2 * x);
                const max = data.adapter.at(2 * x + 1);
                range = Math.max(range, Math.abs(min), Math.abs(max));
            }

            this.overview.updateSize().setData(data, range);
            this.zoom.updateSize().setData(data, range).setMessage(null);
        }
        else{
            this.zoom.setMessage(Locale.t('editor.Controller.zoom.noWaveform', 'No waveform data available'));
        }

        return this;
    }

    /**
     * Clear the waveform
     *
     * @return {this}
     */
    clearWaveform(){
        this.overview.clear();
        this.zoom.clear();

        return this;
    }

    /**
     * Set the current media's time
     *
     * @param {Number} time The media's time in centiseconds
     * @return {this}
     */
    setTime(time){
        this.timefield.setValue(time, true);
        this.overview.setTime(time);
        this.zoom.setTime(time);

        return this;
    }

    /**
     * Waveform's playhead click event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onWaveformPlayheadClick(evt){
        const time = evt.detail.time;

        if(Dom.is(evt.target, '.overview')){
            this.zoom.centerToTime(time);
        }

        this.triggerEvent('timeset', {'time': time});
    }

    /**
     * Waveform's zoom offsetupdate event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onZoomOffsetUpodate(evt){
        const start = evt.detail.start;
        const end = evt.detail.end;

        this.overview.setHighlight(start, end, true);
    }

    /**
     * Waveform's resize event callback
     *
     * @private
     */
    onWaveformResize() {
        this.overview.updateSize();
        this.zoom.updateSize();
    }

    /**
     * Minimize the contoller
     *
     * @return {this}
     */
    minimize(){
        this.addClass('minimized');
        return this;
    }

    /**
     * Maximize the contoller
     *
     * @return {this}
     */
    maximize(){
        this.removeClass('minimized');
        return this;
    }

    /**
     * Enable the controller
     *
     * @return {this}
     */
    enable(){
        this.removeClass('disabled');
        return this;
    }

    /**
     * Disable the controller
     *
     * @return {this}
     */
    disable(){
        this.addClass('disabled');
        return this;
    }

    /**
     * Play button keydown event callback
     *
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    onPlayBtnKeydown(evt){
        if(evt.key === " "){
            evt.stopPropagation();
        }
    }

}
