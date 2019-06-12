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
            .addListener('beforeresize', this.onBeforeResize.bind(this))
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

        this._resizable = new Resizable({
            'target': this.info,
            'relative': true,
            'directions': ['left', 'right']
        });

        this.addClass('selected');
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

        this._resizable.destroy();

        this.removeClass('selected');
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
        const component = this.getComponent();

        this._before_resize_state = {
            'start-time': component.getPropertyValue('start-time'),
            'end-time': component.getPropertyValue('end-time')
        }
    }

    onBeforeResize(evt){
        const component = this.getComponent();

        switch(evt.detail.start_state.direction){
            case 'left': {
                const start_time = this._before_resize_state['start-time'];
                component.setPropertyValue('start-time', start_time * evt.detail.new_state.left / evt.detail.start_state.left);
                break;
            }
            case 'right': {
                const old_right = evt.detail.start_state.left + evt.detail.start_state.width;
                const new_right = evt.detail.start_state.left + evt.detail.new_state.width;
                const end_time = this._before_resize_state['end-time'];
                component.setPropertyValue('end-time', end_time * new_right / old_right);
                break;
            }
        }

        evt.preventDefault();
    }

    onResizeEnd(){
        delete this._before_resize_state;
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

        const true_start_time = this.getComponentTrueTimeLimit(component, 'start');
        const true_end_time = this.getComponentTrueTimeLimit(component, 'end');

        if(true_start_time !== null){
            this.info.css('left', `${(true_start_time / this.duration) * 100}%`);
        }
        else{
            this.info.css('left', 0);
        }

        if(true_end_time !== null){
            this.info.css('width', `${((true_end_time - true_start_time) / this.duration) * 100}%`);
        }
        else{
            this.info.css('width', null);
        }

        if(start_time !== true_start_time){
            this.addClass('truncated-start');
        }
        else{
            this.removeClass('truncated-start');
        }

        if(end_time !== true_end_time){
            this.addClass('truncated-end');
        }
        else{
            this.removeClass('truncated-end');
        }
    }

    getComponent(){
        return this.component;
    }

    getComponentTrueTimeLimit(component, limit){
        let time = component.getPropertyValue(`${limit}-time`);
        const parent = component.getParent();

        if(parent){
            const parent_time = this.getComponentTrueTimeLimit(parent, limit);

            if(time === null){
                time = parent_time;
            }
            else if(parent_time !== null){
                const fn = limit === 'start' ? 'max' : 'min';
                time = Math[fn](time, parent_time);
            }
        }

        return time;
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
