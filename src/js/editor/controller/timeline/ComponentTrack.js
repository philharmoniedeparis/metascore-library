import Dom from '../../../core/Dom';
import Locale from '../../../core/Locale'
import Handle from './track/Handle';
import Resizable from '../../../core/ui/Resizable';
import Draggable from '../../../core/ui/Draggable';
import ComponentIcons from '../../ComponentIcons';
import {clamp} from '../../../core/utils/Math';
import {MasterClock} from '../../../core/media/MediaClock';

import locked_icon from '../../../../img/editor/controller/timeline/handle/locked.svg?svg-sprite';

import {className} from '../../../../css/editor/controller/timeline/ComponentTrack.scss';

/**
 * A timeline track for components
 */
export default class ComponentTrack extends Dom {

    static defaults = {
        'draggableConfigs': null,
        'resizableConfigs': null
    };

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(component, configs) {
        // call parent constructor
        super('<div/>', {'class': `component-track ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        const component_id = component.getId();
        const component_type = component.getType();

        this.duration = 0;

        this.component = component
            .addListener('selected', this.onComponentSelected.bind(this), true)
            .addListener('deselected', this.onComponentDeselected.bind(this))
            .addListener('propchange', this.onComponentPropChange.bind(this));

        let icon = null;
        switch(component_type){
            case 'Block':
                icon = ComponentIcons.Block[component.getPropertyValue('synched') ? 'synched' : 'non_synched'];
                break;

            case 'Media':
                icon = ComponentIcons.Element.Media[component.getPropertyValue('tag')];
                break;

            default:
                {
                    const component_types = component.getTypes();
                    component_types.shift();
                    icon = component_types.reduce((acc, cur) => {
                        return (cur in acc) ? acc[cur] : null;
                    }, ComponentIcons);
                }
                break;
        }

        this.handle = new Handle({
                'icon': icon,
                'expander': true,
            })
            .addToggler('lock', locked_icon, Locale.t('togglers.lock', 'Toggle lock'))
            .addDelegate('button[data-action="expander"]', 'click', this.onHandleExpanderClick.bind(this))
            .addDelegate('.togglers .input', 'valuechange', this.onHandleToggleValueChange.bind(this))
            .appendTo(this);

        if(component_type !== 'Page'){
            this.handle.attr('draggable', 'true');
        }

        this.handle.getToggler('lock').setValue(component.getPropertyValue('editor.locked'), true);

        this.time_wrapper = new Dom('<div/>', {'class': 'time-wrapper'})
            .appendTo(this);

        this.time = new Dom('<div/>', {'class': 'time'})
            .addListener('dragstart', this.onTimeDragStart.bind(this))
            .addListener('drag', this.onTimeDrag.bind(this))
            .addListener('dragend', this.onTimeDragEnd.bind(this))
            .addListener('resizestart', this.onTimeResizeStart.bind(this))
            .addListener('resize', this.onTimeResize.bind(this))
            .addListener('resizeend', this.onTimeResizeEnd.bind(this))
            .appendTo(this.time_wrapper);

        this
            .data('component', component_id)
            .data('type', component_type)
            .updateLabel()
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
            this.component.addListener('propchange', this.onSelectedComponentPropChange.bind(this));

            this.getHandle().addClass('selected');

            this
                .setDraggable(true)
                .setResizable(true)
                .addClass('selected')
                .triggerEvent('select', {'track': this});
        }
    }

    /**
     * Component deselected event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponentDeselected(evt){
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
            this.component.removeListener('propchange', this.onSelectedComponentPropChange.bind(this));

            this.getHandle().removeClass('selected');

            this
                .setDraggable(false)
                .setResizable(false)
                .removeClass('selected')
                .triggerEvent('deselect', {'track': this});
        }
    }

    /**
     * Component propchange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponentPropChange(evt){
        const property = evt.detail.property;
        const value = evt.detail.value;

        switch(property){
            case 'start-time':
            case 'end-time':
                this.updateSize();
                break;

            case 'name':
                this.getHandle().setLabel(value);
                this.attr('title', value);
                break;

            case 'editor.locked':
                this.getHandle().getToggler('lock').setValue(value, true);
                break;
        }
    }

    /**
     * Selected component propchange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onSelectedComponentPropChange(evt){
        if(evt.target !== evt.currentTarget){
            // Caught a bubbled event, skip
            return;
        }

        const property = evt.detail.property;
        const value = evt.detail.value;

        switch(property){
            case 'start-time':
            case 'end-time':
                this.setDraggable(value !== null);
                break;

            case 'editor.locked':
                this.setDraggable(!value).setResizable(!value);
                break;
        }
    }

    /**
     * Time dragstart event callback
     *
     * @private
     */
    onTimeDragStart(evt){
        const {width} = this.time_wrapper.get(0).getBoundingClientRect();
        this._drag_multiplier = this.duration / width;

        this.triggerEvent('dragstart', evt.detail, false, true);

        evt.stopPropagation();
    }

    /**
     * Time drag event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTimeDrag(evt){
        const component = this.getComponent();
        const state = evt.detail.behavior.getState();
        const start_time = component.getPropertyValue('start-time');
        const end_time = component.getPropertyValue('end-time');
        let diff = state.offsetX * this._drag_multiplier;

        // Adjust diff to prevent start-time from going below 0 and end-time above duration.
        diff = clamp(diff, -start_time, MasterClock.getRenderer().getDuration() - end_time);

        component.setPropertyValues({
            'start-time': start_time + diff,
            'end-time': end_time + diff
        });

        this.triggerEvent('drag', evt.detail, false, true);

        evt.stopPropagation();
    }

    /**
     * Time dragend event callback
     *
     * @private
     */
    onTimeDragEnd(evt){
        delete this._drag_multiplier;

        this.triggerEvent('dragend', evt.detail, false, true);

        evt.stopPropagation();
    }

    /**
     * Time resizestart event callback
     *
     * @private
     */
    onTimeResizeStart(evt){
        const {width} = this.time_wrapper.get(0).getBoundingClientRect();
        this._resize_multiplier = this.duration / width;

        this.triggerEvent('resizestart', evt.detail, false, true);

        evt.stopPropagation();
    }

    /**
     * Time resize event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onTimeResize(evt){
        const component = this.getComponent();
        const state = evt.detail.behavior.getState();
        const property = state.direction === 'left' ? 'start-time' : 'end-time';

        let new_value = 0;

        if(property === 'start-time'){
            new_value = state.new_values.left;
        }
        else{
            new_value = state.original_values.left + state.new_values.width;
        }

        new_value *= this._resize_multiplier;

        // Clamp value between 0 and duration.
        new_value = clamp(new_value, 0, MasterClock.getRenderer().getDuration());

        component.setPropertyValue(property, new_value);

        this.triggerEvent('resize', evt.detail, false, true);

        evt.stopPropagation();
    }

    /**
     * Time resizeend event callback
     *
     * @private
     */
    onTimeResizeEnd(evt){
        delete this._resize_multiplier;

        this.triggerEvent('resizeend', evt.detail, false, true);

        evt.stopPropagation();
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

        this.toggleClass('has-descendents', !this.descendents.is(':empty'));
    }

    /**
     * Properties childremove event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onPropertiesChildRemove() {

    }

    /**
     * Handle expander click event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onHandleExpanderClick(evt){
        const expand = !(this.hasClass('user-expanded') || this.hasClass('auto-expanded'));

        this.toggleClass('user-expanded', expand);

        if(!expand){
            // Force shrink
            this.removeClass('auto-expanded');

            // Shrink children
            this.find('.user-expanded').removeClass('user-expanded');
        }

        evt.stopPropagation();
    }

    onHandleToggleValueChange(evt){
        const action = Dom.data(evt.target, 'action');
        const value = evt.detail.value;

        switch(action){
            case 'lock':
                this.getComponent().setPropertyValue('editor.locked', value);
                break;
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
     * Set/Unset the draggable behaviour
     *
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {this}
     */
    setDraggable(draggable){
        if(draggable){
            const component = this.getComponent();

            if(!component.instanceOf('Element')){
                // Only add draggable to Element components
                return this;
            }

            if(component.getPropertyValue('editor.locked')){
                // Do not add draggable to a locked component
                return this;
            }

            if(component.getPropertyValue('start-time') === null || component.getPropertyValue('end-time') === null){
                // Do not add draggable to component that doesn't have both a start-time and end-time
                return this;
            }

            if(!this._draggable){
                const configs = Object.assign({}, this.configs.draggableConfigs, {
                    'target': this.time,
                    'handle': this.time,
                    'autoUpdate': false,
                    'snapPositions': {
                        'x': [0, 1]
                    }
                });

                /**
                 * The draggable behavior
                 * @type {Draggable}
                 */
                this._draggable = new Draggable(configs);
            }
        }
        else if(!draggable && this._draggable){
            this._draggable.destroy();
            delete this._draggable;
        }

        return this;
    }

    /**
     * Get the draggable behaviour
     *
     * @return {Draggable} The draggable behaviour
     */
    getDraggable(){
        return this._draggable;
    }

    /**
     * Set/Unset the resizable behaviour
     *
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {this}
     */
    setResizable(resizable){
        if(resizable){
            const component = this.getComponent();

            if(component.getPropertyValue('editor.locked')){
                // Do not add resizable to a locked component
                return this;
            }

            if(component.instanceOf('Page') && !component.getParent().getPropertyValue('synched')){
                // Do not add resizable to a page component that is in a non-synched block
                return this;
            }

            if(!this._resizable){
                const directions = [];
                if(component.hasProperty('start-time')){
                    directions.push('left');
                }
                if(component.hasProperty('end-time')){
                    directions.push('right');
                }
                if(directions.length > 0){
                    const configs = Object.assign({}, this.configs.resizableConfigs, {
                        'target': this.time,
                        'directions': directions,
                        'autoUpdate': false
                    });

                    /**
                     * The resizable behavior
                     * @type {Resizable}
                     */
                    this._resizable = new Resizable(configs);
                }
            }
        }
        else if(!resizable && this._resizable){
            this._resizable.destroy();
            delete this._resizable;
        }

        return this;
    }

    /**
     * Get the resizable behaviour
     *
     * @return {Resizable} The resizable behaviour
     */
    getResizable(){
        return this._resizable;
    }

    /**
     * Update size and classes according to associated component time values
     *
     * @private
     * @return {this}
     */
    updateSize(){
        const component = this.getComponent();

        const start_time = component.getPropertyValue('start-time');
        const end_time = component.getPropertyValue('end-time');

        const left = start_time === null ? 0 : start_time / this.duration;
        const right = end_time === null ? 1 : end_time / this.duration;
        const width = right - left;

        this
            .toggleClass('has-start-time', start_time !== null)
            .toggleClass('has-end-time', end_time !== null);

        this.time
            .css('left', `${left * 100}%`)
            .css('width', `${width * 100}%`);

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
     * Update the track's title and its handle's label
     *
     * @return {this}
     */
    updateLabel(){
        const component_name = this.getComponent().getName();

        this.attr('title', component_name);
        this.getHandle().setLabel(component_name);

        return this;
    }

}
