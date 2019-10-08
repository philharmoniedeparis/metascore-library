import Dom from '../../core/Dom';
import MasterClock from '../../core/clock/MasterClock';
import Track from './timeline/Track';

import {className} from '../../../css/editor/controller/Timeline.scss';

/**
 * The editor's timeline
 * @emits {addtrack} Fired when a track is added
 * @param {Track} track The track
 * @emits {removetrack} Fired when a track is removed
 * @param {Track} track The track
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

        MasterClock.addListener('rendererchange', this.onMediaClockRendererChange.bind(this));
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
         * The playhead <canvas> element
         * @type {Dom}
         */
        this.playhead = new Dom('<canvas/>', {'class': 'playhead'})
            .appendTo(this.tracks_container_outer);

        /**
         * The tracks inner container
         * @type {Dom}
         */
        this.tracks_container_inner = new Dom('<div/>', {'class': 'tracks-container-inner'})
            .addDelegate('.track', 'select', this.onTrackSelect.bind(this))
            .addDelegate('.track', 'dragstart', this.onTrackDragStart.bind(this), true)
            .addDelegate('.track', 'dragend', this.onTrackDragEnd.bind(this), true)
            .addDelegate('.track', 'resizestart', this.onTrackResizeStart.bind(this), true)
            .addDelegate('.track', 'resizeend', this.onTrackResizeEnd.bind(this), true)
            .appendTo(this.tracks_container_outer);
    }

    /**
     * Track select event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTrackSelect(){
        // Scroll the track into view
        // TODO
    }

    /**
     * Track dragstart event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTrackDragStart(evt){
        const draggable = evt.detail.behavior;
        const track_id = Dom.data(evt.target, 'component');

        Object.entries(this.tracks).forEach(([id, track]) => {
            if(track.hidden()){
                return;
            }

            if(id === track_id){
                return;
            }

            const rect = track.info.get(0).getBoundingClientRect();
            draggable
                .addSnapGuide('x', rect.left)
                .addSnapGuide('x', rect.right);
        });
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
        const resizable = evt.detail.behavior;
        const track_id = Dom.data(evt.target, 'component');

        Object.entries(this.tracks).forEach(([id, track]) => {
            if(track.hidden()){
                return;
            }

            if(id === track_id){
                return;
            }

            const rect = track.info.get(0).getBoundingClientRect();
            resizable
                .addSnapGuide('x', rect.left)
                .addSnapGuide('x', rect.right);
        });
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
     * Set the associated media
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
     * Add a track
     *
     * @param {Component} component The component to associate with the track
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
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
            track.appendTo(this.tracks_container_inner);
            handle.appendTo(this.handles_container);
        }

        this.tracks[component.getId()] = track;

        if(supressEvent !== true){
            this.triggerEvent('addtrack', {'track': track});
        }

        component.getChildren().forEach((child_component) => {
            this.addTrack(child_component);
        });

        return this;
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
     * @param {Boolean} [supressEvent=false] Whether to supress the removetrack event
     * @return {this}
     */
    removeTrack(component, supressEvent){
        const id = component.getId();

        if(id in this.tracks){
            const track = this.tracks[id];

            track.remove();

            delete this.tracks[id];

            if(supressEvent !== true){
                this.triggerEvent('removetrack', {'track': track});
            }
        }

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
        const width = this.get(0).clientWidth;
        const height = this.get(0).clientHeight;

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
    updatePlayheadPosition(position){
        this.playhead_position = position;

        this.updatePlayhead();
    }

    /**
     * Update the playhead layer
     *
     * @return {this}
     */
    updatePlayhead(){
        const canvas = this.playhead.get(0);

        if(canvas.width > 0 && canvas.height > 0){
            const context = canvas.getContext('2d');

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            context.moveTo(this.playhead_position, 0);
            context.lineTo(this.playhead_position, canvas.height);
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
