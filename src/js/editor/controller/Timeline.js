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

        this.onMediaTimeUpdate = this.onMediaTimeUpdate.bind(this);

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.duration = 0;
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
        if(this.media){
            this.media.removeListener('timeupdate', this.onMediaTimeUpdate);
        }

        /**
         * The associated media
         * @type {Media}
         */
        this.media = media;

        this.media.addListener('timeupdate', this.onMediaTimeUpdate);

        /**
         * The media's duration in centiseconds
         * @type {Number}
         */
        this.duration = this.media.getDuration();

        Object.values(this.tracks).forEach((track) => {
            track.setDuration(this.duration);
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
        const parent_track = parent_component ? this.getTrack(parent_component) : null;

        if(parent_component && !parent_track){
            return this;
        }

        const track = new Track(component)
            .setDuration(this.duration);

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

    getTrack(component){
        const id = component.getId();
        if(id in this.tracks){
            return this.tracks[id];
        }

        return null;
    }

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

    setOffset(start, end, supressEvent){
        const zoom = this.duration / (end - start);
        const scroll = this.tracks_container_outer.get(0).clientWidth * start / this.duration;

        this.tracks_container_outer.get(0).scrollLeft = scroll * zoom;
        this.tracks_container_inner.css('width', `${zoom * 100}%`);

        this.updateSize();

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

        this.updatePlayhead();

        return this;
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
            const x = this.getPositionAt(this.time) + 0.5;

            console.log(x);

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
     * Get the x position in pixels corresponding to a time in centiseconds
     *
     * @param {Number} time The time in centiseconds
     * @return {Number} The corresponding x position
     */
    getPositionAt(time){
        if(this.duration){
            const canvas = this.playhead.get(0);
            return Math.round(time / this.duration * canvas.width);
        }

        return null;
    }

    /**
     * Media timeupdate event callback
     *
     * @private
     */
    onMediaTimeUpdate(evt){
        /**
         * The current time in centiseconds
         * @type {Number}
         */
        this.time = evt.detail.time;

        if(this.duration){
            this.updatePlayhead();
        }
    }

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
