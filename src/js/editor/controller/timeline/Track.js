import Dom from '../../../core/Dom';
import Handle from './Handle';
import Resizable from '../../../core/ui/Resizable';
import Draggable from '../../../core/ui/Draggable';

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
            .addListener('selected', this.onComponentSelected.bind(this), true)
            .addListener('unselected', this.onComponentUnselected.bind(this))
            .addListener('propchange', this.onComponentPropChange.bind(this));

        const inner = new Dom('<div/>', {'class': 'inner'})
            .appendTo(this);

        this.info = new Dom('<div/>', {'class': 'info'})
            .addListener('dragstart', this.onDragStart.bind(this))
            .addListener('drag', this.onDrag.bind(this))
            .addListener('dragend', this.onDragEnd.bind(this))
            .addListener('resizestart', this.onResizeStart.bind(this))
            .addListener('resize', this.onResize.bind(this))
            .addListener('resizeend', this.onResizeEnd.bind(this))
            .appendTo(inner);

        this.handle = new Handle()
            .data('component', id)
            .addDelegate('.expander', 'click', this.onHandleExpanderClick.bind(this))
            .setLabel(name);

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
            // Caught a bubbled event, this is a parent component
            // This is applied first, as the listener is registered on the capturing phase

            // Expand the parent
            this.addClass('auto-expanded')
                .getHandle().addClass('auto-expanded');
        }
        else{
            const component = this.getComponent();

            // Add a draggable behavior if applicable
            if(component.instanceOf('Element')){
                if(component.getPropertyValue('start-time') !== null && component.getPropertyValue('end-time') !== null){
                    this._draggable = new Draggable({
                        'target': this.info,
                        'handle': this.info
                    });
                }
            }

            // Add a resizable behavior if applicable
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
                    'directions': directions
                });
            }

            // Add the selected class to the track and handle
            this.addClass('selected')
                .getHandle().addClass('selected');

            this.triggerEvent('select', {'track': this});
        }
    }

    /**
     * Component unselected event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponentUnselected(evt){
        if(evt.target !== evt.currentTarget){
            // Caught a bubbled event, this is a parent component

            // Check if a desendent is selected in the parent
            const expanded_descendents = this.descendents.find('.selected');
            if(expanded_descendents.count() === 0){
                // Shrik the parent
                this.removeClass('auto-expanded')
                    .getHandle().removeClass('auto-expanded');
            }
        }
        else{
            if(this._draggable){
                this._draggable.destroy();
            }
            if(this._resizable){
                this._resizable.destroy();
            }

            this.removeClass('selected');
            this.getHandle().removeClass('selected');

            this.triggerEvent('unselect', {'track': this});
        }
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
                this.handle.setLabel(evt.detail.value);
                this.attr('title', evt.detail.value);
                break;
        }
    }

    /**
     * The dragstart event callback
     *
     * @private
     */
    onDragStart(){
        const {width} = this.get(0).getBoundingClientRect();
        this._drag_multiplier = this.duration / width;
    }

    /**
     * The drag event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onDrag(evt){
        const component = this.getComponent();
        const diff = evt.detail.offsetX * this._drag_multiplier;

        component.setPropertyValues({
            'start-time': component.getPropertyValue('start-time') + diff,
            'end-time': component.getPropertyValue('end-time') + diff
        });
    }

    /**
     * The dragend event callback
     *
     * @private
     */
    onDragEnd(){
        delete this._drag_multiplier;
    }

    /**
     * The resizestart event callback
     *
     * @private
     */
    onResizeStart(){
        const {width} = this.get(0).getBoundingClientRect();
        this._resize_multiplier = this.duration / width;
    }

    /**
     * The resize event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onResize(evt){
        const component = this.getComponent();
        const property = evt.detail.direction === 'left' ? 'start-time' : 'end-time';
        let new_value = 0;

        if(property === 'start-time'){
            new_value = evt.detail.new_values.left;
        }
        else{
            new_value = evt.detail.original_values.left + evt.detail.new_values.width;
        }

        new_value *= this._resize_multiplier;

        component.setPropertyValue(property, new_value);
    }

    /**
     * The resizeend event callback
     *
     * @private
     */
    onResizeEnd(){
        delete this._resize_multiplier;
    }

    /**
     * Descendents childremove event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onDescendentsChildRemove(evt){
        const child = evt.detail.child;
        if(!Dom.is(child, `.${className}`)){
            return;
        }

        this.toggleClass('has-descendents', this.descendents.is(':empty'));
    }

    /**
     * Handle exonader click event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onHandleExpanderClick(evt){
        const expand = !(this.hasClass('user-expanded') || this.hasClass('auto-expanded'));
        const handle = this.getHandle();

        this.toggleClass('user-expanded', expand);
        handle.toggleClass('user-expanded', expand);

        if(!expand){
            // Force shrink
            this.removeClass('auto-expanded');
            handle.removeClass('auto-expanded');

            // Shrink children
            this.find('.user-expanded').removeClass('user-expanded');
            handle.find('.user-expanded').removeClass('user-expanded');
        }

        evt.stopPropagation();
    }

    /**
     * Set the media's duration variable
     *
     * @param {Number} duration The media's duration in centiseconds
     * @return {this}
     */
    setDuration(duration){
        this.duration = duration;

        this.updateSize();

        return this;
    }

    /**
     * Update size according to associated component time values
     *
     * @private
     * @return {this}
     */
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

        return this;
    }

    /**
     * Get the associated component
     *
     * @return {Component} The associated component
     */
    getComponent(){
        return this.component;
    }

    /**
     * Get the associated handle
     *
     * @return {Handle} The associated handle
     */
    getHandle(){
        return this.handle;
    }

    /**
     * Add a descendent track
     *
     * @param {Track} track The track to add
     * @param {Integer} index The position at which the track should be added
     * @return {this}
     */
    addDescendent(track, index){
        if(!this.descendents){
            this.descendents = new Dom('<div/>', {'class': 'descendents'})
                .addListener('childremove', this.onDescendentsChildRemove.bind(this))
                .appendTo(this);
        }

        track.insertAt(this.descendents, index);

        this.addClass('has-descendents');

        return this;
    }

    /**
     * @inheritdoc
     */
    remove(){
        this.handle.remove();
        return super.remove();
    }

}
