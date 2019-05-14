import Dom from '../core/Dom';
import BufferIndicator from './controller/BufferIndicator';
import WaveformOverview from './controller/WaveformOverview';
import WaveformZoom from './controller/WaveformZoom';
import TimeField from './field/Time';
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

        const progress_bar = new Dom('<div/>', {'class': 'progress-bar'})
            .addListener('playheadclick', this.onProgressBarPlayheadClick.bind(this))
            .appendTo(this);

        /**
         * The buffer indicator
         * @type {Dom}
         */
        this.buffer_indicator = new BufferIndicator()
            .appendTo(progress_bar);

        /**
         * The waveform overview
         * @type {Dom}
         */
        this.overview = new WaveformOverview()
            .appendTo(progress_bar);

        /**
         * The waveform zoom
         * @type {Dom}
         */
        this.zoom = new WaveformZoom()
            .addListener('offsetupdate', this.onZoomOffsetUpodate.bind(this))
            .appendTo(progress_bar);

        const resize_observer = new ResizeObserver(this.onProgressBarResize.bind(this));
        resize_observer.observe(progress_bar.get(0));
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
            .addListener('pause', this.onMediaPause);

        this.timefield.setMax(media.getDuration());

        this.buffer_indicator.setMedia(media);
        this.overview.setMedia(media);
        this.zoom.setMedia(media);

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
                .removeListener('pause', this.onMediaPause);
        }

        this.buffer_indicator.clear();
        this.overview.clear();
        this.zoom.clear();

        this.addClass('disabled');

        return this;
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
     * Progress bar's playhead click event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onProgressBarPlayheadClick(evt){
        const time = evt.detail.time;

        if(!Dom.is(evt.target, '.zoom')){
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
     * Progress bar's resize event callback
     *
     * @private
     */
    onProgressBarResize() {
        this.buffer_indicator.updateSize();
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
