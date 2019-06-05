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

        const overview = new Dom('<div/>', {'class': 'overview'})
            .appendTo(top);

        /**
         * The buffer indicator
         * @type {BufferIndicator}
         */
        this.buffer_indicator = new BufferIndicator()
            .appendTo(overview);

        /**
         * The overview waveform
         * @type {WaveformOverview}
         */
        this.waveform_overview = new WaveformOverview()
            .appendTo(overview);

        const middle = new Dom('<div/>', {'class': 'middle'})
            .appendTo(this);

        const controls = new Dom('<div/>', {'class': 'controls'})
            .appendTo(middle);

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

        /**
         * The zoom waveform
         * @type {WaveformZoom}
         */
        this.waveform_zoom = new WaveformZoom()
            .addListener('offsetupdate', this.onZoomOffsetUpodate.bind(this))
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
        this.timeline = new Timeline({
                'handlesContriner': timeline_handles
            })
            .appendTo(bottom_content_wrapper);

        new Scrollable({
            'target': bottom,
            'scrollWrapper': bottom_scroll_wrapper,
            'contentWrapper': bottom_content_wrapper
        });

        this.addListener('playheadclick', this.onProgressBarPlayheadClick.bind(this));

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

        this.timefield.setMax(media.getDuration());

        this.buffer_indicator.setMedia(media);
        this.waveform_overview.setMedia(media);
        this.waveform_zoom.setMedia(media);
        this.timeline.setMedia(media);

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

        this.buffer_indicator.clear();
        this.waveform_overview.clear();
        this.waveform_zoom.clear();
        this.timeline.clear();

        this.addClass('disabled');

        return this;
    }

    /**
     * Progress bar's resize event callback
     *
     * @private
     */
    onResize() {
        this.buffer_indicator.updateSize();
        this.waveform_overview.updateSize();
        this.timeline.updateSize();
        this.waveform_zoom.updateSize();
    }

    /**
     * Progress bar's playhead click event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onProgressBarPlayheadClick(evt){
        const time = evt.detail.time;

        if(!Dom.is(evt.target, '.view.zoom')){
            this.waveform_zoom.centerToTime(time);
        }

        this.triggerEvent('timeset', {'time': time});
    }

    /**
     * Media timeupdate event callback
     *
     * @private
     */
    onMediaTimeUpdate(evt){
        this.timefield.setValue(evt.detail.time, true);
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
     * Waveform's zoom offsetupdate event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onZoomOffsetUpodate(evt){
        const start = evt.detail.start;
        const end = evt.detail.end;

        this.waveform_overview.setHighlight(start, end, true);
        this.timeline.setOffset(start, end, true);
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

}
