import Dom from '../core/Dom';
import Scrollable from '../core/ui/Scrollable';
import TimeField from './field/Time';
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
         * The time field
         * @type {TimeField}
         */
        this.timefield = new TimeField()
            .appendTo(top);

        new Dom('<button/>')
            .data('action', 'play')
            .addListener('keydown', this.onPlayBtnKeydown.bind(this))
            .insertAt(this.timefield, 0);


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

        const controls = new Dom('<div/>', {'class': 'controls'})
            .appendTo(middle);

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(controls);

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

        const bottom_scroll_wrapper = new Dom('<div/>', {'class': 'bottom-scroll-wrapper'})
            .appendTo(bottom);

        const bottom_content_wrapper = new Dom('<div/>', {'class': 'bottom-content-wrapper'})
            .appendTo(bottom_scroll_wrapper);

        const timeline_handles = new Dom('<div/>', {'class': 'timeline-handles'})
            .appendTo(bottom_content_wrapper);

        /**
         * The timeline
         * @type {Timeline}
         */
        this.timeline = new Timeline({'handlesContriner': timeline_handles})
            .appendTo(bottom_content_wrapper);

        new Scrollable({
            'target': bottom,
            'scrollWrapper': bottom_scroll_wrapper,
            'contentWrapper': bottom_content_wrapper
        });

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

        this.getTimeField().setMax(media.getDuration());

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

        this.getTimeline().updatePlayhead(position);
    }

    /**
     * Media timeupdate event callback
     *
     * @private
     */
    onMediaTimeUpdate(evt){
        this.getTimeField().setValue(evt.detail.time, true);
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
     * Get the timefield
     *
     * @return {TimeField} The timefield
     */
    getTimeField(){
        return this.timefield;
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
