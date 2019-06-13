import Dom from '../../../core/Dom';
import Handle from './track/Handle';
import Resizable from '../../../core/ui/Resizable';

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
        const type = component.getType();
        const name = component.getName();

        this.duration = 0;

        this.component = component
            .addListener('selected', this.onComponentSelected.bind(this))
            .addListener('unselected', this.onComponentUnselected.bind(this))
            .addListener('propchange', this.onComponentPropChange.bind(this));

        const inner = new Dom('<div/>', {'class': 'inner'})
            .appendTo(this);

        this.info = new Dom('<div/>', {'class': 'info'})
            .addListener('resizestart', this.onResizeStart.bind(this))
            .addListener('resize', this.onResize.bind(this))
            .addListener('resizeend', this.onResizeEnd.bind(this))
            .appendTo(inner);

        this.handle = new Handle()
            .data('component', id)
            .setName(name);

        this
            .data('component', id)
            .data('type', type)
            .attr('title', name)
            .updateSize();
    }

    /**
     * Component selected event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponentSelected(evt){
        if(evt.target !== evt.currentTarget){
            // Caught a bubbled event, skip
            return;
        }

        // Add a resizable behavior if applicable
        const component = this.getComponent();
        const directions = [];
        if(component.hasProperty('start-time')){
            directions.push('left');
        }
        if(component.hasProperty('end-time')){
            directions.push('right');
        }
        if(directions.length > 0){
            this._resizable = new Resizable({
                'target': this.info,
                'relative': true,
                'directions': directions
            });
        }

        // Add the selected class to the track and handle
        this.addClass('selected');
        this.getHandle().addClass('selected');

        // Scroll into view
        this.get(0).scrollIntoView();
    }

    /**
     * Component unselected event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponentUnselected(evt){
        if(evt.target !== evt.currentTarget){
            // Caught a bubbled event, skip
            return;
        }

        if(this._resizable){
            this._resizable.destroy();
        }

        this.removeClass('selected');
        this.getHandle().removeClass('selected');
    }

    /**
     * Component propchange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponentPropChange(evt){
        if(evt.target !== evt.currentTarget){
            // Caught a bubbled event, skip
            return;
        }

        switch(evt.detail.property){
            case 'start-time':
            case 'end-time':
                this.updateSize();
                break;

            case 'name':
                this.handle.setName(evt.detail.value);
                this.attr('title', evt.detail.value);
                break;
        }
    }

    onResizeStart(){
        const {width} = this.get(0).getBoundingClientRect();
        this._resize_multiplier = this.duration / width;
    }

    onResize(evt){
        const component = this.getComponent();
        const property = evt.detail.start_state.direction === 'left' ? 'start-time' : 'end-time';
        let new_value = 0;

        if(property === 'start-time'){
            new_value = evt.detail.new_state.left;
        }
        else{
            new_value = evt.detail.start_state.left + evt.detail.new_state.width;
        }

        new_value *= this._resize_multiplier;

        component.setPropertyValue(property, new_value);

        evt.preventDefault();
    }

    onResizeEnd(){
        delete this._resize_multiplier;
    }

    setDuration(duration){
        this.duration = duration;

        this.updateSize();

        return this;
    }

    updateSize(){
        const component = this.getComponent();

        const start_time = component.getPropertyValue('start-time');
        const end_time = component.getPropertyValue('end-time');

        if(start_time !== null){
            this.info.css('left', `${(start_time / this.duration) * 100}%`);
        }
        else{
            this.info.css('left', null);
        }

        if(end_time !== null){
            const diff_time = end_time - (start_time !== null ? start_time : 0);
            this.info.css('width', `${diff_time / this.duration * 100}%`);
        }
        else{
            this.info.css('width', null);
        }
    }

    getComponent(){
        return this.component;
    }

    getHandle(){
        return this.handle;
    }

    addSubTrack(track, index){
        if(!this.subtracks){
            this.subtracks = new Dom('<div/>', {'class': 'sub-tracks'})
                .appendTo(this)
        }

        track.insertAt(this.subtracks, index);
    }

    remove(){
        this.handle.remove();
        return super.remove();
    }

}
