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

    addTrack(component, supressEvent){
        const track = new Track(component)
            .setDuration(this.duration)
            .appendTo(this.tracks_container);

        track.getHandle()
            .appendTo(this.track_handle_container);

        this.tracks[component.getId()] = track;

        if(supressEvent !== true){
            this.triggerEvent('addtrack', {'track': track});
        }

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
