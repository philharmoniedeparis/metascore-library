import Dom from '../../core/Dom';
import Track from './timeline/Track';

import {className} from '../../../css/editor/controller/Timeline.less';

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

        this.tracks = {};

        this.setupUI();
    }

    /**
     * Get the default config values
     *
     * @return {Object} The default values
     */
    static getDefaults(){
        return {
            'playheadWidth': 1,
            'playheadColor': '#000',
            'handlesContriner': null
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
        this.handles_container = this.configs.handlesContriner ? this.configs.handlesContriner : new Dom('<div/>', {'class': 'handles-container'}).appendTo(this);

        /**
         * The tracks outer container
         * @type {Dom}
         */
        this.tracks_container_outer = new Dom('<div/>', {'class': 'tracks-container-outer'})
            .appendTo(this);

        /**
         * The tracks inner container
         * @type {Dom}
         */
        this.tracks_container_inner = new Dom('<div/>', {'class': 'tracks-container-inner'})
            .appendTo(this.tracks_container_outer);

        /**
         * The playhead <canvas> element
         * @type {Dom}
         */
        this.playhead = new Dom('<canvas/>', {'class': 'playhead'})
            .appendTo(this.tracks_container_outer);
    }

    /**
     * Set the associated media
     *
     * @param {Media} media The media component
     * @return {this}
     */
    setMedia(media){
        /**
         * The associated media
         * @type {Media}
         */
        this.media = media;

        const duration = this.media.getDuration();
        Object.values(this.tracks).forEach((track) => {
            track.setDuration(duration);
        });

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

        if(parent_component && !parent_track){
            return this;
        }

        const track = new Track(component);

        if(this.media){
            track.setDuration(this.media.getDuration());
        }

        const handle = track.getHandle();

        if(parent_component){
            const index = parent_component.getChildIndex(component);
            parent_track.addSubTrack(track, index);
            parent_track.getHandle().addSubHandle(handle, index);
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
        const duration = this.media.getDuration();
        const zoom = duration / (end - start);
        const scroll = this.tracks_container_outer.get(0).clientWidth * start / duration;

        this.tracks_container_outer.get(0).scrollLeft = scroll * zoom;
        this.tracks_container_inner.css('width', `${zoom * 100}%`);

        if(supressEvent !== true){
            this.triggerEvent('offsetupdate', {'start': start, 'end': end});
        }
    }

    /**
     * Update the <canvas> sizes
     *
     * @return {this}
     */
    updateSize(){
        const width = this.tracks_container_inner.get(0).clientWidth;
        const height = this.tracks_container_inner.get(0).clientHeight;

        this.find('canvas').forEach((canvas) => {
            canvas.width = width;
            canvas.height = height;
        });

        return this;
    }

    /**
     * Update the playhead layer
     *
     * @return {this}
     */
    updatePlayhead(position){
        const canvas = this.playhead.get(0);

        if(canvas.width > 0 && canvas.height > 0){
            const context = canvas.getContext('2d');

            context.clearRect(0, 0, canvas.width, canvas.height);
            context.beginPath();
            context.moveTo(position, 0);
            context.lineTo(position, canvas.height);
            context.lineWidth = this.configs.playheadWidth;
            context.strokeStyle = this.configs.playheadColor;
            context.stroke();
        }

        return this;
    }

    /**
     * Get the x position in pixels corresponding to a time in centiseconds
     *
     * @param {Number} time The time in centiseconds
     * @return {Number} The corresponding x position
     */
    getPositionAt(time){
        if(this.media){
            const canvas = this.playhead.get(0);
            return Math.round(time / this.media.getDuration() * canvas.width);
        }

        return null;
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
