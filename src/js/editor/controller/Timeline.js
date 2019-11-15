import Dom from '../../core/Dom';
import {MasterClock} from '../../core/media/Clock';
import Track from './timeline/Track';
import ResizeObserver from 'resize-observer-polyfill';

import {className, handleDragGhostClassName} from '../../../css/editor/controller/Timeline.scss';

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
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.playhead_position = 0;

        this.tracks = {};

        this.setupUI();

        const resize_observer = new ResizeObserver(this.onResize.bind(this));
        resize_observer.observe(this.get(0));

        MasterClock
            .addListener('rendererchange', this.onMediaClockRendererChange.bind(this))
            .addListener('timeupdate', this.onMediaClockTimeUpdate.bind(this));
    }

    /**
     * Get the default config values
     *
     * @return {Object} The default values
     */
    static getDefaults(){
        return {
            'playheadWidth': 1,
            'playheadColor': '#0000fe'
        };
    }

    /**
     * Setup the UI
     *
     * @private
     */
    setupUI() {
        /**
         * The handles container
         * @type {Dom}
         */
        this.handles_container = new Dom('<div/>', {'class': 'handles-container'})
            .addDelegate('.handle', 'dragstart', this.onHandleDragStart.bind(this), true)
            .addDelegate('.handle', 'dragover', this.onHandleDragOver.bind(this), true)
            .addDelegate('.handle', 'dragleave', this.onHandleDragLeave.bind(this), true)
            .addDelegate('.handle', 'drop', this.onHandleDrop.bind(this), true)
            .addDelegate('.handle', 'dragend', this.onHandleDragEnd.bind(this), true)
            .appendTo(this);

        const tracks_container = new Dom('<div/>', {'class': 'tracks-container'})
            .appendTo(this);

        /**
         * The tracks outer container
         * @type {Dom}
         */
        this.tracks_container_outer = new Dom('<div/>', {'class': 'tracks-container-outer'})
            .appendTo(tracks_container);

        /**
         * The tracks inner container
         * @type {Dom}
         */
        this.tracks_container_inner = new Dom('<div/>', {'class': 'tracks-container-inner'})
            .addDelegate('.track', 'dragstart', this.onTrackDragStart.bind(this), true)
            .addDelegate('.track', 'dragend', this.onTrackDragEnd.bind(this), true)
            .addDelegate('.track', 'resizestart', this.onTrackResizeStart.bind(this), true)
            .addDelegate('.track', 'resizeend', this.onTrackResizeEnd.bind(this), true)
            .appendTo(this.tracks_container_outer);

        /**
         * The playhead <canvas> element
         * @type {Dom}
         */
        this.playhead = new Dom('<canvas/>', {'class': 'playhead'})
            .appendTo(tracks_container);
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

        this._handle_drag_ghost = new Dom(evt.target.cloneNode(true))
            .addClass(handleDragGhostClassName)
            .css('width', handle.css('width'))
            .appendTo(this.handles_container);

        evt.dataTransfer.effectAllowed = 'move';
        evt.dataTransfer.setData('metascore/timeline', component_id);
        evt.dataTransfer.setDragImage(this._handle_drag_ghost.get(0), 0, 0);

        // dragover does not have access to dataTransfer data
        this._dragging_handle = handle;

        track.addClass('dragging');
        handle.addClass('dragging');

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

                handle
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
     * @param {Media} media The media component
     * @return {this}
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

        return this;
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
                'snapGuideContainer': this.tracks_container_inner
            },
            'resizableConfigs': {
                'snapGuideContainer': this.tracks_container_inner
            },
        });

        if(renderer){
            track.setDuration(renderer.getDuration());
        }

        const handle = track.getHandle();

        if(parent_component){
            const index = parent_component.getChildIndex(component);
            parent_track.addDescendent(track, index);
            parent_track.getHandle().addDescendent(handle, index);
        }
        else{
            const index = component.parents().children().index(`#${component.getId()}`);
            track.insertAt(this.tracks_container_inner, index);
            handle.insertAt(this.handles_container, index);
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
        const container_rect = this.tracks_container_inner.get(0).getBoundingClientRect();
        behavior.addSnapGuide('x', this.playhead_position + container_rect.left);

        // Add snapping to other tracks
        Object.entries(this.tracks).forEach(([track_id, track]) => {
            if(track.hidden() || track_id === id){
                return;
            }

            const track_rect = track.info.get(0).getBoundingClientRect();
            behavior.addSnapGuide('x', track_rect.left);
            behavior.addSnapGuide('x', track_rect.right);
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
            const zoom = duration / (end - start);

            this.tracks_container_inner.css('width', `${zoom * 100}%`);

            const container_dom = this.tracks_container_outer.get(0);
            const scroll = container_dom.clientWidth * start / duration * zoom;
            const max_scroll = container_dom.scrollWidth - container_dom.clientWidth;

            container_dom.scrollLeft = Math.min(scroll, max_scroll);

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
        const container = this.tracks_container_outer.get(0);
        const width = container.clientWidth;
        const height = container.clientHeight;

        this.find('canvas').forEach((canvas) => {
            canvas.width = width;
            canvas.height = height;
        });

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

        if(renderer){
            const time = MasterClock.getTime();
            const rect = this.tracks_container_inner.get(0).getBoundingClientRect();
            this.playhead_position = time / renderer.getDuration() * rect.width;
        }
        else{
            this.playhead_position = 0;
        }

        const offset = this.tracks_container_outer.get(0).scrollLeft;
        const x = Math.floor(this.playhead_position - offset) + 0.5;
        const canvas = this.playhead.get(0);

        if(canvas.width > 0 && canvas.height > 0){
            const context = canvas.getContext('2d');

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

    getHandlesContainer(){
        return this.handles_container;
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
