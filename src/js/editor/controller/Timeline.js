import Dom from '../../core/Dom';
import Track from './timeline/Track';

import {className} from '../../../css/editor/controller/Timeline.less';

/**
 * The editor's timeline
 */
export default class Timeline extends Dom {

    /**
     * Instantiate
     */
    constructor() {
        // call parent constructor
        super('<div/>', {'class': `timeline ${className}`});

        this.duration = 0;
        this.tracks = {};

        this.setupUI();
    }

    /**
     * Setup the UI
     *
     * @private
     */
    setupUI() {
        this.track_handle_container = new Dom('<div/>', {'class': 'track-handles-container'})
            .appendTo(this);

        this.tracks_container = new Dom('<div/>', {'class': 'tracks-container-inner'});

        new Dom('<div/>', {'class': 'tracks-container'})
            .append(this.tracks_container)
            .appendTo(this);
    }

    /**
     * Set the media's duration
     *
     * @param {Number} duration The media's duration in centiseconds
     * @return {this}
     */
    setDuration(duration){
        this.duration = duration;

        Object.values(this.tracks).forEach((track) => {
            track.setDuration(this.duration);
        });
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
            track.appendTo(this.tracks_container);
            handle.appendTo(this.track_handle_container);
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

    clear(){
        Object.entries(this.tracks).forEach(([id, track]) => {
            track.remove();
            delete this.tracks[id];
        });

        return this;
    }

}
