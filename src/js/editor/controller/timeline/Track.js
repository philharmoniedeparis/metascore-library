import Dom from '../../../core/Dom';
import Handle from './track/Handle';

import {className} from '../../../../css/editor/controller/timeline/Track.less';

/**
 * A timeline track
 */
export default class Track extends Dom {

    /**
     * Instantiate
     */
    constructor(component) {
        // call parent constructor
        super('<div/>', {'class': `track ${className}`});

        const id = component.getId();

        this.duration = 0;

        this.component = component
            .addListener('propchange', this.onComponentPropChange.bind(this));

        this.info = new Dom('<div/>', {'class': 'info'})
            .appendTo(this);

        this.handle = new Handle()
            .data('component', id)
            .setName(component.getName());

        this
            .data('component', id)
            .data('type', component.getType())
            .updateSize();
    }

    /**
     * Component propchange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponentPropChange(evt){
        if(evt.detail.component !== this.component){
            // Caught a bubbled event, skip
            return;
        }

        switch(evt.detail.property){
            case 'start-time':
            case 'end-time':
                this.updateSize();
                break;
        }
    }

    setDuration(duration){
        this.duration = duration;

        this.updateSize();

        return this;
    }

    updateSize(){
        const start_time = this.component.getPropertyValue('start-time');
        const end_time = this.component.getPropertyValue('end-time');

        if(start_time !== null){
            this.info.css('left', `${(start_time / this.duration) * 100}%`);
        }
        else{
            this.info.css('left', 0);
        }

        if(end_time !== null){
            this.info.css('width', `${((end_time - start_time) / this.duration) * 100}%`);
        }
        else{
            this.info.css('width', null);
        }
    }

    getHandle(){
        return this.handle;
    }

    remove(){
        this.handle.remove();
        return super.remove();
    }

}
