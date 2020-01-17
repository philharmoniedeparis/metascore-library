import Dom from '../../../core/Dom';
import Handle from './Handle';
import Resizable from '../../../core/ui/Resizable';
import Draggable from '../../../core/ui/Draggable';
import * as icons from '../../ComponentIcons';

import {className} from '../../../../css/editor/controller/timeline/Track.scss';

/**
 * A timeline track
 */
export default class Track extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(component, configs) {
        // call parent constructor
        super('<div/>', {'class': `track ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        const component_id = component.getId();
        const component_type = component.getType();

        this.duration = 0;

        this.component = component
            .addListener('selected', this.onComponentSelected.bind(this), true)
            .addListener('deselected', this.onComponentDeselected.bind(this))
            .addListener('propchange', this.onComponentPropChange.bind(this));

        const inner = new Dom('<div/>', {'class': 'inner'})
            .appendTo(this);

        this.info = new Dom('<div/>', {'class': 'info'})
            .addListener('dragstart', this.onInfoDragStart.bind(this))
            .addListener('drag', this.onInfoDrag.bind(this))
            .addListener('dragend', this.onInfoDragEnd.bind(this))
            .addListener('resizestart', this.onInfoResizeStart.bind(this))
            .addListener('resize', this.onInfoResize.bind(this))
            .addListener('resizeend', this.onInfoResizeEnd.bind(this))
            .appendTo(inner);

        let icon = null;
        switch(component_type){
            case 'Block':
                icon = icons.block[component.getPropertyValue('synched') ? 'synched' : 'non_synched'];
                break;

            case 'Media':
                icon = icons.media[component.getPropertyValue('tag')];
                break;

            default:
                icon = icons[component_type.toLowerCase()];
                break;
        }

        this.handle = new Handle({
                'icon': icon
            })
            .data('component', component_id)
            .data('type', component_type)
            .addDelegate('button[data-action="expander"]', 'click', this.onHandleExpanderClick.bind(this))
            .addDelegate('.togglers .input', 'valuechange', this.onHandleToggleValueChange.bind(this));

        if(component_type !== 'Page'){
            this.handle.attr('draggable', 'true');
        }

        this.handle.getToggler('lock').setValue(component.getPropertyValue('editor.locked'), true);

        this
            .data('component', component_id)
            .data('type', component_type)
            .updateLabel()
            .updateSize();
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'draggableConfigs': null,
            'resizableConfigs': null
        };
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
        if(evt.target !== evt.currentTarget){
            // Caught a bubbled event, skip
            return;
        }

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
     * Info dragstart event callback
     *
     * @private
     */
    onInfoDragStart(evt){
        const {width} = this.get(0).getBoundingClientRect();
        this._drag_multiplier = this.duration / width;

        this.triggerEvent('dragstart', evt.detail, false, true);

        evt.stopPropagation();
    }

    /**
     * Info drag event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onInfoDrag(evt){
        const component = this.getComponent();
        const state = evt.detail.behavior.getState();
        const diff = state.offsetX * this._drag_multiplier;

        component.setPropertyValues({
            'start-time': component.getPropertyValue('start-time') + diff,
            'end-time': component.getPropertyValue('end-time') + diff
        });

        this.triggerEvent('drag', evt.detail, false, true);

        evt.stopPropagation();
    }

    /**
     * Info dragend event callback
     *
     * @private
     */
    onInfoDragEnd(evt){
        delete this._drag_multiplier;

        this.triggerEvent('dragend', evt.detail, false, true);

        evt.stopPropagation();
    }

    /**
     * Info resizestart event callback
     *
     * @private
     */
    onInfoResizeStart(evt){
        const {width} = this.get(0).getBoundingClientRect();
        this._resize_multiplier = this.duration / width;

        this.triggerEvent('resizestart', evt.detail, false, true);

        evt.stopPropagation();
    }

    /**
     * Info resize event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onInfoResize(evt){
        const component = this.getComponent();
        const state = evt.detail.behavior.getState();
        const property = state.direction === 'left' ? 'start-time' : 'end-time';

        let new_value = 0;

        if(property === 'start-time'){
            new_value =state.new_values.left;
        }
        else{
            new_value = state.original_values.left + state.new_values.width;
        }

        new_value *= this._resize_multiplier;

        component.setPropertyValue(property, new_value);

        this.triggerEvent('resize', evt.detail, false, true);

        evt.stopPropagation();
    }

    /**
     * Info resizeend event callback
     *
     * @private
     */
    onInfoResizeEnd(evt){
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
                    'target': this.info,
                    'handle': this.info,
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
                        'target': this.info,
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
     * Update size according to associated component time values
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

        this.info
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

    /**
     * @inheritdoc
     */
    show(){
        this.getHandle().show();
        super.show();
    }

    /**
     * @inheritdoc
     */
    hide(){
        this.getHandle().hide();
        super.hide();
    }

    /**
     * @inheritdoc
     */
    remove(){
        this.getHandle().remove();
        return super.remove();
    }

}
