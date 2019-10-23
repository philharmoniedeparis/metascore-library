import Dom from '../core/Dom';
import {MasterClock} from '../core/media/Clock';
import Button from '../core/ui/Button';
import TimeInput from '../core/ui/input/TimeInput';
import BufferIndicator from './controller/BufferIndicator';
import ScenarioSelector from './controller/ScenarioSelector';
import WaveformOverview from './controller/waveform/Overview';
import WaveformZoom from './controller/waveform/Zoom';
import Timeline from './controller/Timeline';
import ResizeObserver from 'resize-observer-polyfill';

import play_icon from '../../img/editor/controller/play.svg?svg-sprite';
import pause_icon from '../../img/editor/controller/pause.svg?svg-sprite';
import rewind_icon from '../../img/editor/controller/rewind.svg?svg-sprite';

import {className} from '../../css/editor/Controller.scss';

/**
 * A controller with a play/pause button, a buffer indicator, and a waveform
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

        // fix event handlers scope
        this.onMediaRendererPlay = this.onMediaRendererPlay.bind(this);
        this.onMediaRendererPause = this.onMediaRendererPause.bind(this);

        this.setupUI();

        MasterClock
            .addListener('rendererchange', this.onMediaClockRendererChange.bind(this))
            .addListener('timeupdate', this.onMediaClockTimeUpdate.bind(this));
    }

    /**
     * Setup the UI
     *
     * @private
     */
    setupUI() {
        const top = new Dom('<div/>', {'class': 'top'})
            .appendTo(this);

        /**
         * The time input
         * @type {TimeInput}
         */
        this.timeinput = new TimeInput()
            .appendTo(top);

        this.timeinput.play_btn = new Button({'icon': play_icon})
            .data('action', 'play')
            .addListener('keydown', this.onPlayBtnKeydown.bind(this))
            .appendTo(this.timeinput);

        const overview = new Dom('<div/>', {'class': 'overview'})
            .appendTo(top);

        /**
         * The buffer indicator
         * @type {BufferIndicator}
         */
        this.buffer_indicator = new BufferIndicator()
            .addListener('playheadclick', this.onPlayheadClick.bind(this))
            .appendTo(overview);

        /**
         * The overview waveform
         * @type {WaveformOverview}
         */
        this.waveform_overview = new WaveformOverview()
            .addListener('playheadclick', this.onPlayheadClick.bind(this))
            .appendTo(overview);

        const middle = new Dom('<div/>', {'class': 'middle'})
            .appendTo(this);

        const sticky_top = new Dom('<div/>', {'class': 'sticky-top'})
            .appendTo(middle);

        const left = new Dom('<div/>', {'class': 'left'})
            .appendTo(sticky_top);

        this.controls = new Dom('<div/>', {'class': 'controls'})
            .appendTo(left);

        this.controls.rewind_btn = new Button({'icon': rewind_icon})
            .data('action', 'rewind')
            .appendTo(this.controls);

        this.controls.play_btn = new Button({'icon': play_icon})
            .data('action', 'play')
            .addListener('keydown', this.onPlayBtnKeydown.bind(this))
            .appendTo(this.controls);

        const right = new Dom('<div/>', {'class': 'right'})
            .appendTo(sticky_top);

        /**
         * The zoom waveform
         * @type {WaveformZoom}
         */
        this.waveform_zoom = new WaveformZoom()
            .addListener('offsetupdate', this.onWaveformZoomOffsetUpdate.bind(this))
            .addListener('playheadupdate', this.onWaveformZoomPlayheadUpdate.bind(this))
            .addListener('playheadclick', this.onPlayheadClick.bind(this))
            .appendTo(right);

        /**
         * The timeline
         * @type {Timeline}
         */
        this.timeline = new Timeline()
            .appendTo(middle);

        const bottom = new Dom('<div/>', {'class': 'bottom'})
            .appendTo(this);

        this.scenario_selector = new ScenarioSelector()
            .appendTo(bottom);

        this.waveform_zoom.getControls()
            .appendTo(bottom);

        const resize_observer = new ResizeObserver(this.onResize.bind(this));
        resize_observer.observe(this.get(0));
    }

    /**
     * ResizeObserver callback
     *
     * @private
     */
    onResize() {
        this.getBufferIndicator().updateSize();
        this.getWaveformOverview().updateSize();
        this.getTimeline().updateSize();
        this.getWaveformZoom().updateSize();
    }

    /**
     * Waveform overview playhead click event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPlayheadClick(evt){
        if(!Dom.is(evt.currentTarget, '.waveform-zoom')){
            this.getWaveformZoom().centerToTime(evt.detail.time);
        }
    }

    /**
     * Waveform's zoom offsetupdate event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onWaveformZoomOffsetUpdate(evt){
        const start = evt.detail.start;
        const end = evt.detail.end;

        this.getWaveformOverview().setHighlight(start, end, true);
        this.getTimeline().setOffset(start, end);
    }

    onWaveformZoomPlayheadUpdate(evt){
        const position = evt.detail.position;

        this.getTimeline().updatePlayheadPosition(position);
    }

    /**
     * Set the media
     *
     * @param {Media} media The media component
     * @return {this}
     */
    onMediaClockRendererChange(evt){
        const renderer = evt.detail.renderer;

        if(renderer){
            renderer
                .addListener('play', this.onMediaRendererPlay)
                .addListener('pause', this.onMediaRendererPause);

            this.getTimeInput().setMax(renderer.getDuration());

            this.removeClass('disabled');
        }
        else{
            this.addClass('disabled');
        }

        return this;
    }

    /**
     * MasterClock timeupdate event callback
     *
     * @private
     */
    onMediaClockTimeUpdate(evt){
        this.getTimeInput().setValue(evt.detail.time, true);
    }

    /**
     * Set the current media's time
     * Media playing event callback
     *
     * @private
     */
    onMediaRendererPlay(){
        this.addClass('playing');

        this.timeinput.play_btn.setIcon(pause_icon);
        this.controls.play_btn.setIcon(pause_icon);
    }

    /**
     * Media pause event callback
     *
     * @private
     */
    onMediaRendererPause(){
        this.removeClass('playing');

        this.timeinput.play_btn.setIcon(play_icon);
        this.controls.play_btn.setIcon(play_icon);
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

    /**
     * Get the time input
     *
     * @return {TimeInput} The time input
     */
    getTimeInput(){
        return this.timeinput;
    }

    /**
     * Get the controls
     *
     * @return {Dom} The controls
     */
    getControls(){
        return this.controls;
    }

    /**
     * Get the buffer indicator
     *
     * @return {BufferIndicator} The buffer indicator
     */
    getBufferIndicator(){
        return this.buffer_indicator;
    }

    /**
     * Get the waveform overview
     *
     * @return {WaveformOverview} The waveform overview
     */
    getWaveformOverview(){
        return this.waveform_overview;
    }

    /**
     * Get the waveform zoom
     *
     * @return {WaveformZoom} The waveform zoom
     */
    getWaveformZoom(){
        return this.waveform_zoom;
    }

    /**
     * Get the timeline
     *
     * @return {Timeline} The timeline
     */
    getTimeline(){
        return this.timeline;
    }

    /**
     * Get the scenario selector
     *
     * @return {ScenarioSelector} The selector
     */
    getScenarioSelector(){
        return this.scenario_selector;
    }

}
