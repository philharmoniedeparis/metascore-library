import Dom from '../core/Dom';
import TimeInput from '../core/ui/input/TimeInput';
import BufferIndicator from './controller/BufferIndicator';
import WaveformOverview from './controller/waveform/Overview';
import WaveformZoom from './controller/waveform/Zoom';
import Timeline from './controller/Timeline';
import ResizeObserver from 'resize-observer-polyfill';

import {className} from '../../css/editor/Controller.less';

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
        this.onMediaTimeUpdate = this.onMediaTimeUpdate.bind(this);
        this.onMediaPlay = this.onMediaPlay.bind(this);
        this.onMediaPause = this.onMediaPause.bind(this);
        this.onMediaSourceSet = this.onMediaSourceSet.bind(this);

        this.setupUI();
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

        new Dom('<button/>')
            .data('action', 'play')
            .addListener('keydown', this.onPlayBtnKeydown.bind(this))
            .insertAt(this.timeinput, 0);


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

        this.controls = new Dom('<div/>', {'class': 'controls'})
            .appendTo(middle);

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this.controls);

        new Dom('<button/>')
            .data('action', 'rewind')
            .appendTo(buttons);

        new Dom('<button/>')
            .data('action', 'play')
            .addListener('keydown', this.onPlayBtnKeydown.bind(this))
            .appendTo(buttons);

        /**
         * The zoom waveform
         * @type {WaveformZoom}
         */
        this.waveform_zoom = new WaveformZoom()
            .addListener('offsetupdate', this.onWaveformZoomOffsetUpdate.bind(this))
            .addListener('playheadupdate', this.onWaveformZoomPlayheadUpdate.bind(this))
            .addListener('playheadclick', this.onPlayheadClick.bind(this))
            .appendTo(middle);

        const bottom = new Dom('<div/>', {'class': 'bottom'})
            .appendTo(this);

        /**
         * The timeline
         * @type {Timeline}
         */
        this.timeline = new Timeline()
            .appendTo(bottom);

        const resize_observer = new ResizeObserver(this.onResize.bind(this));
        resize_observer.observe(this.get(0));
    }

    /**
     * Set the media
     *
     * @param {Media} media The media component
     * @return {this}
     */
    attachMedia(media){
        media.getRenderer()
            .addListener('timeupdate', this.onMediaTimeUpdate)
            .addListener('play', this.onMediaPlay)
            .addListener('pause', this.onMediaPause)
            .addListener('sourceset', this.onMediaSourceSet);

        this.getTimeInput().setMax(media.getDuration());

        this.getBufferIndicator().setMedia(media);
        this.getWaveformOverview().setMedia(media);
        this.getWaveformZoom().setMedia(media);
        this.getTimeline().setMedia(media);

        this.removeClass('disabled');


        return this;
    }

    /**
     * Disable the controller
     *
     * @return {this}
     */
    dettachMedia(){
        if(this.media){
            this.media.getRenderer()
                .removeListener('timeupdate', this.onMediaTimeUpdate)
                .removeListener('play', this.onMediaPlay)
                .removeListener('pause', this.onMediaPause)
                .removeListener('sourceset', this.onMediaSourceSet);
        }

        this.getBufferIndicator().clear();
        this.getWaveformOverview().clear();
        this.getWaveformZoom().clear();
        this.getTimeline().clear();

        this.addClass('disabled');

        return this;
    }

    /**
     * Progress bar's resize event callback
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
        const time = evt.detail.time;

        if(!Dom.is(evt.currentTarget, '.waveform-zoom')){
            this.getWaveformZoom().centerToTime(time);
        }

        this.triggerEvent('timeset', {'time': time});
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
     * Media timeupdate event callback
     *
     * @private
     */
    onMediaTimeUpdate(evt){
        this.getTimeInput().setValue(evt.detail.time, true);
    }

    /**
     * Set the current media's time
     * Media playing event callback
     *
     * @private
     */
    onMediaPlay(){
        this.addClass('playing');
    }

    /**
     * Media pause event callback
     *
     * @private
     */
    onMediaPause(){
        this.removeClass('playing');
    }

    /**
     * Media sourceset event callback
     *
     * @private
     */
    onMediaSourceSet(){
        console.log('onMediaSourceSet');
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

}
