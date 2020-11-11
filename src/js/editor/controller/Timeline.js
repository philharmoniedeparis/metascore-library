import Dom from '../../core/Dom';
import {MasterClock} from '../../core/media/Clock';
import Track from './timeline/Track';
import ResizeObserver from 'resize-observer-polyfill';

import {className} from '../../../css/editor/controller/Timeline.scss';

/**
 * The editor's timeline
 * @emits {trackadd} Fired when a track is added
 * @param {Track} track The track
 *
 * @emits {trackremove} Fired when a track is removed
 * @param {Track} track The track
 *
 * @emits {offsetupdate} Fired when the offset is updated
 * @param {Number} start The start time of the offset in centiseconds
 * @param {Number} end The end time of the offset in centiseconds
 */
export default class Timeline extends Dom {

    static defaults = {
        'playheadWidth': 1,
        'playheadColor': '#0000fe'
    };

    /**
     * Instantiate
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `timeline ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        this.playhead_position = 0;

        this.tracks = {};

        this.offset = 0;

        /**
         * The tracks container
         * @type {Dom}
         */
        this.tracks_container = new Dom('<div/>', {'class': 'tracks-container'})
            .addDelegate('.track', 'dragstart', this.onTrackDragStart.bind(this), true)
            .addDelegate('.track', 'dragend', this.onTrackDragEnd.bind(this), true)
            .addDelegate('.track', 'resizestart', this.onTrackResizeStart.bind(this), true)
            .addDelegate('.track', 'resizeend', this.onTrackResizeEnd.bind(this), true)
            .addDelegate('.handle', 'dragstart', this.onHandleDragStart.bind(this), true)
            .addDelegate('.handle', 'dragover', this.onHandleDragOver.bind(this), true)
            .addDelegate('.handle', 'dragleave', this.onHandleDragLeave.bind(this), true)
            .addDelegate('.handle', 'drop', this.onHandleDrop.bind(this), true)
            .addDelegate('.handle', 'dragend', this.onHandleDragEnd.bind(this), true)
            .appendTo(this);

        const playhead_wrapper = new Dom('<div/>', {'class': 'playhead'})
            .appendTo(this);

        /**
         * The playhead <canvas> element
         * @type {Dom}
         */
        this.playhead = new Dom('<canvas/>')
            .appendTo(playhead_wrapper);

        const resize_observer = new ResizeObserver(this.onResize.bind(this));
        resize_observer.observe(this.get(0));

        MasterClock
            .addListener('rendererchange', this.onMediaClockRendererChange.bind(this))
            .addListener('timeupdate', this.onMediaClockTimeUpdate.bind(this));
    }

    /**
     * ResizeObserver callback
     *
     * @private
     */
    onResize() {
        this.updateSize();
    }

    /**
     * Handle dragstart event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onHandleDragStart(evt){
        const component_id = Dom.data(evt.target, 'component');
        const track = this.getTrack(component_id);

        const handle = track.getHandle();

        this._drag_ghost = new Dom(track.get(0).cloneNode(true))
            .appendTo(this.tracks_container);

        evt.dataTransfer.effectAllowed = 'move';
        evt.dataTransfer.setData('metascore/timeline', component_id);
        evt.dataTransfer.setDragImage(this._drag_ghost.get(0), 0, 0);

        // dragover does not have access to dataTransfer data
        this._dragging_handle = handle;

        track.addClass('dragging');

        evt.stopPropagation();
    }

    /**
     * Handle dragover event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onHandleDragOver(evt) {
        if(evt.dataTransfer.types.includes('metascore/timeline')){
            const component_id = Dom.data(evt.target, 'component');
            const track = this.getTrack(component_id);
            const handle = track.getHandle();

            if(handle.parents().get(0) === this._dragging_handle.parents().get(0)){
                const handle_rect = handle.get(0).getBoundingClientRect();
                const y = evt.clientY - handle_rect.top;
                const above = y < handle_rect.height/2;

                track
                    .addClass('dragover', above)
                    .toggleClass('drag-above', above)
                    .toggleClass('drag-below', !above);

                evt.preventDefault();
            }
        }
    }

    /**
     * Handle dragleave event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onHandleDragLeave(evt) {
        if(evt.dataTransfer.types.includes('metascore/timeline')){
            const component_id = Dom.data(evt.target, 'component');
            const track = this.getTrack(component_id);
            const handle = track.getHandle();

            track
                .removeClass('dragover')
                .removeClass('drag-below')
                .removeClass('drag-above');

            handle
                .removeClass('dragover')
                .removeClass('drag-below')
                .removeClass('drag-above');

            evt.preventDefault();
        }
    }

    /**
     * Handle drop event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onHandleDrop(evt){
        if(evt.dataTransfer.types.includes('metascore/timeline')){
            const component_id = Dom.data(evt.target, 'component');
            const track = this.getTrack(component_id);
            const handle = track.getHandle();
            const handle_parent = handle.parents();

            const dragging_component_id = evt.dataTransfer.getData('metascore/timeline');
            const dragging_track = this.getTrack(dragging_component_id);

            const index = handle_parent.children('.handle').index('.dragover');
            const above = track.hasClass('drag-above');
            const position = above ? index : index + 1;

            this.triggerEvent('trackdrop', {'component': dragging_track.getComponent(), 'position': position});

            track
                .removeClass('dragover')
                .removeClass('drag-below')
                .removeClass('drag-above');

            handle
                .removeClass('dragover')
                .removeClass('drag-below')
                .removeClass('drag-above');
        }

        evt.preventDefault();
    }

    /**
     * Handle dragend event callback
     *
     * @private
     * @param {Event} evt The event object
     */
    onHandleDragEnd(evt){
        const component_id = Dom.data(evt.target, 'component');
        const track = this.getTrack(component_id);
        const handle = track.getHandle();

        this._handle_drag_ghost.remove();
        delete this._handle_drag_ghost;

        delete this._dragging_handle;

        track.removeClass('dragging');
        handle.removeClass('dragging');
    }

    /**
     * Track dragstart event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTrackDragStart(evt){
        const behavior = evt.detail.behavior;
        const track_id = Dom.data(evt.target, 'component');

        this.setupTrackSnapGuides(track_id, behavior);
    }

    /**
     * Track dragend event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTrackDragEnd(evt){
        const draggable = evt.detail.behavior;
        draggable.clearSnapGudies();
    }

    /**
     * Track resizestart event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTrackResizeStart(evt){
        const behavior = evt.detail.behavior;
        const track_id = Dom.data(evt.target, 'component');

        this.setupTrackSnapGuides(track_id, behavior);
    }

    /**
     * Track resizeend event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTrackResizeEnd(evt){
        const resizable = evt.detail.behavior;
        resizable.clearSnapGudies();
    }

    /**
     * MasterClock rendererchange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onMediaClockRendererChange(evt){
        const renderer = evt.detail.renderer;

        if(renderer){
            const duration = renderer.getDuration();
            Object.values(this.tracks).forEach((track) => {
                track.setDuration(duration);
            });
        }

        this.updateSize();
    }

    /**
     * MasterClock timeupdate event callback
     *
     * @private
     */
    onMediaClockTimeUpdate(){
        this.updatePlayhead();
    }

    /**
     * Add a track
     *
     * @param {Component} component The component to associate with the track
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {Track} The added track
     */
    addTrack(component, supressEvent){
        const parent_component = component.getParent();
        const parent_track = parent_component ? this.getTrack(parent_component.getId()) : null;
        const renderer = MasterClock.getRenderer();

        if(parent_component && !parent_track){
            return this;
        }

        const track = new Track(component, {
            'draggableConfigs': {
                'snapGuideContainer': this.tracks_container
            },
            'resizableConfigs': {
                'snapGuideContainer': this.tracks_container
            },
        });

        if(renderer){
            track.setDuration(renderer.getDuration());
        }

        if(parent_component){
            const index = parent_component.getChildIndex(component);
            parent_track.addDescendent(track, index);
        }
        else{
            const index = component.parents().children().index(`#${component.getId()}`);
            track.insertAt(this.tracks_container, index);
        }

        this.tracks[component.getId()] = track;

        if(supressEvent !== true){
            this.triggerEvent('trackadd', {'track': track});
        }

        component.getChildren().forEach((child_component) => {
            this.addTrack(child_component);
        });

        return track;
    }

    /**
     * Get a track for a corresponding component
     *
     * @param {String} component_id The component id associated with the track
     * @return {Track} The associated track, or null if not found
     */
    getTrack(component_id){
        if(component_id in this.tracks){
            return this.tracks[component_id];
        }

        return null;
    }

    /**
     * Remove a track for a corresponding component
     *
     * @param {Component} component The component associated with the track
     * @param {Boolean} [supressEvent=false] Whether to supress the trackremove event
     * @return {this}
     */
    removeTrack(component, supressEvent){
        const id = component.getId();

        if(id in this.tracks){
            const track = this.tracks[id];

            track.remove();

            delete this.tracks[id];

            if(supressEvent !== true){
                this.triggerEvent('trackremove', {'track': track});
            }
        }

        return this;
    }

    /**
     * Setup drag or resize snap guides
     *
     * @private
     * @param {String} id The track's id
     * @param {Draggable|Resizable} behavior The draggable or resizable behavior
     * @return {this}
     */
    setupTrackSnapGuides(id, behavior){
        // Add snapping to playhead
        const {left: playhead_left} = this.playhead.get(0).getBoundingClientRect();
        behavior.addSnapGuide('x', this.playhead_position + playhead_left);

        // Add snapping to other tracks
        Object.entries(this.tracks).forEach(([track_id, track]) => {
            if(track_id === id ||track.time.hidden()){
                return;
            }

            const {left, right} = track.time.get(0).getBoundingClientRect();
            behavior.addSnapGuide('x', left);
            behavior.addSnapGuide('x', right);
            console.log('x', left, 'x', right);
        });

        return this;
    }

    /**
     * Set the current timeline's offset
     *
     * @param {Number} start The timeline's left most visible position
     * @param {Number} end The timeline's right most visible position
     * @param {Boolean} [supressEvent=false] Whether to supress the offsetupdate event
     * @return {this}
     */
    setOffset(start, end, supressEvent){
        const renderer = MasterClock.getRenderer();

        if(renderer){
            const duration = renderer.getDuration();

            this.zoom = duration / (end - start);
            this.offset = start / (end - start);

            this.tracks_container.css('--timline-zoom', `${this.zoom * 100}%`);
            this.tracks_container.css('--timline-offert', this.offset);

            this.updatePlayhead();

            if(supressEvent !== true){
                this.triggerEvent('offsetupdate', {'start': start, 'end': end});
            }
        }
    }

    /**
     * Update the <canvas> sizes
     *
     * @return {this}
     */
    updateSize(){
        const canvas = this.playhead.get(0);
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;

        this.updatePlayhead();

        return this;
    }

    /**
     * Update the playhead layer
     *
     * @return {this}
     */
    updatePlayhead(){
        const renderer = MasterClock.getRenderer();
        const canvas = this.playhead.get(0);
        const {width} = canvas.getBoundingClientRect();

        if(renderer){
            const time = MasterClock.getTime();
            const duration = renderer.getDuration();
            this.playhead_position = Math.floor(((time / duration * this.zoom) - this.offset) * width);
        }
        else{
            this.playhead_position = 0;
        }

        if(canvas.width > 0 && canvas.height > 0){
            const context = canvas.getContext('2d');
            const x = this.playhead_position + 0.5;

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
            context.lineWidth = this.configs.playheadWidth;
            context.strokeStyle = this.configs.playheadColor;
            context.stroke();
        }

        return this;
    }

    /**
     * Update the track labels of a block's pages
     *
     * @return {this}
     */
    updateBlockPagesTrackLabels(block, index){
        // Update Timeline labels of sibling pages.
        block.getChildren().forEach((page, page_index) => {
            if(typeof index === 'undefined' || page_index >= index){
                const track = this.getTrack(page.getId());
                if(track){
                    track.updateLabel();
                }
            }
        });
    }

    /**
     * Clear the playhead and remove all tracks
     *
     * @return {this}
     */
    clear(){
        this.find('canvas').forEach((canvas) => {
            const context = canvas.getContext('2d');
            context.clearRect(0, 0, canvas.width, canvas.height);
        });

        Object.entries(this.tracks).forEach(([id, track]) => {
            track.remove();
            delete this.tracks[id];
        });

        return this;
    }

}
