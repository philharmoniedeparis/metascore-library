import Dom from '../../../core/Dom';
import Locale from '../../../core/Locale'
import { History } from '../../UndoRedo';
import Handle from './track/Handle';
import Keyframe from './track/Keyframe';
import { clone } from '../../../core/utils/Array';

import animated_icon from '../../../../img/editor/controller/timeline/handle/animated.svg?svg-sprite';

import {className} from '../../../../css/editor/controller/timeline/PropertyTrack.scss';


/**
 * A timeline track for components
 */
export default class PropertyTrack extends Dom {

    static defaults = {
        'keyframe': {
            'draggableConfigs': null
        }
    };

    /**
     * Instantiate
     *
     * @param {Component} component The associated component
     * @param {string} property The associated property's name
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(component, property, configs) {
        // call parent constructor
        super('<div/>', {'class': `property-track ${className}`});

        // fix event handlers scope
        this.onComponentSelect = this.onComponentSelect.bind(this);
        this.onComponentDeselect = this.onComponentDeselect.bind(this);
        this.onComponentPropChange = this.onComponentPropChange.bind(this);

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        /**
         * The associated component.
         * @type {Component}
         */
        this.component = component
            .addListener('select', this.onComponentSelect, true)
            .addListener('deselect', this.onComponentDeselect)
            .addListener('propchange', this.onComponentPropChange);

        /**
         * The associated property name.
         * @type {string}
         */
        this.property = property;

        /**
         * The list of keyframes.
         * @type {Array}
         */
        this.keyframes = [];

        /**
         * The handle.
         * @type {Handle}
         */
        this.handle = new Handle({
                'icon': animated_icon
            })
            .appendTo(this);

        const {label} = this.getComponent().getProperty(this.property);
        this.handle.setLabel(label)

        /**
         * The keyframes DOM wrapper.
         * @type {Dom}
         */
        this.keyframes_wrapper = new Dom('<div/>', {'class': 'keyframes-wrapper'})
            .appendTo(this);

        this
            .data('property', this.property)
            .attr('title', this.property)
            .updateKeyframes()
            .updateKeyframesWrapperTitle();
    }

    /**
     * Component select event callback
     *
     * @private
     */
    onComponentSelect(){
        this.updateKeyframesWrapperTitle();
    }

    /**
     * Component deselect event callback
     *
     * @private
     */
    onComponentDeselect(){
        this.getKeyframes()
            .filter(k => k.isSelected())
            .forEach(k => k.deselect());

        this.updateKeyframesWrapperTitle();
    }

    /**
     * Component propchange event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onComponentPropChange(evt){
        const property = evt.detail.property;

        if (property !== this.property) {
            return;
        }

        if (!this.getComponent().isPropertyAnimated(property)) {
            this.remove();
        }
        else{
            this.updateKeyframes();
        }
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
     * Get the associated property
     *
     * @return {string} The associated property
     */
    getProperty(){
        return this.property;
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
     * Update the property's keyframes.
     *
     * @private
     * @return {this}
     */
    updateKeyframes(){
        const values = new Map(this.component.getPropertyValue(this.property));
        let reorder = false;

        // Remove keyframes of no-longer existing values.
        this.keyframes = this.keyframes.filter((keyframe) => {
            if(!values.has(keyframe.getTime())){
                keyframe.remove();
                return false;
            }
            return true;
        });

        values.forEach((value, time) => {
            let keyframe = this.keyframes.find((k) => k.getTime() === Keyframe.normalizeTime(time));

            if(keyframe){
                // Update existing keyframe.
                keyframe.setValue(value);
            }
            else {
                // Add new keyframe.
                keyframe = this.addKeyframe(time, value);
                reorder = true;
            }
        });

        if (reorder) {
            this.keyframes.sort((a, b) => a.getTime() - b.getTime());
        }

        return this;
    }

    /**
     * Get the list of keyframes.
     *
     * @return {Array} The keyframes.
     */
    getKeyframes() {
        return this.keyframes;
    }

    /**
     * Get a keyframe by time.
     *
     * @param {number} time The time.
     * @return {Keyframe} The keyframe.
     */
    getKeyframe(time) {
        return this.keyframes.find((keyframe) => {
            return keyframe.getTime() === time;
        });
    }

    /**
     * Add a new keyframe.
     *
     * @private
     * @param {Number} time The associated time.
     * @param {Mixed} value The associated value.
     * @return {Keyframe} The keyframe.
     */
    addKeyframe(time, value) {
        const keyframe = new Keyframe(this, time, value, this.configs.keyframe)
            .addListener('dragstart', this.onKeyframeDragStart.bind(this))
            .addListener('drag', this.onKeyframeDrag.bind(this))
            .addListener('dragend', this.onKeyframeDragEnd.bind(this))
            .appendTo(this.keyframes_wrapper);

        this.keyframes.push(keyframe);

        return keyframe;
    }

    /**
     * Remove a keyframe.
     *
     * @param {Keyframe} keyframe The keyframe.
     * @return {this}
     */
    removeKeyframe(keyframe) {
        const component = this.getComponent();
        const property = this.getProperty();
        const previous = clone(component.getPropertyValue(property));

        keyframe.remove();

        this.keyframes = this.keyframes.filter(k => k !== keyframe);

        const values = this.keyframes.map((keyframe) => {
            return [keyframe.getTime(), keyframe.getValue()];
        });

        component.setPropertyValue(property, values);

        History.add({
            'undo': () => {
                component.setPropertyValue(property, previous);
            },
            'redo': () => {
                component.setPropertyValue(property, values);
            }
        });

        return this;
    }

    /**
     * Keyframe dragstart event handler.
     *
     * @private
     */
    onKeyframeDragStart() {
        const component = this.getComponent();
        const property = this.getProperty();

        /**
        * Values of x and y when dragging starts
        * @type {Array}
        */
        this._before_drag_values = clone(component.getPropertyValue(property));
    }

    /**
     * Keyframe drag event handler.
     *
     * @private
     */
    onKeyframeDrag() {
        const component = this.getComponent();
        const property = this.getProperty();

        const values = this.keyframes.map((keyframe) => {
            return [keyframe.getTime() , keyframe.getValue()];
        });

        component.setPropertyValue(property, values);
    }

    /**
     * Keyframe dragend event handler.
     *
     * @private
     */
    onKeyframeDragEnd() {
        const component = this.getComponent();
        const property = this.getProperty();

        const previous_values = this._before_drag_values;
        const new_values = clone(component.getPropertyValue(property));

        History.add({
            'undo': () => {
                component.setPropertyValue(property, previous_values);
            },
            'redo': () => {
                component.setPropertyValue(property, new_values);
            }
        });

        delete this._before_drag_values;
    }

    /**
     * Update the keyframes wrapper's title attribute.
     *
     * @private
     * @return {this}
     */
    updateKeyframesWrapperTitle() {
        let title = null;

        if (this.component.hasClass('selected')) {
            title =  Locale.t(
                'editor.controller.timeline.PropertyTrack.keyframes-wrapper.title',
                'Add keyframe'
            );
        }

        this.keyframes_wrapper.attr('title', title);

        return this;
    }

    /**
     * @inheritdoc
     */
    remove() {
        this.component
            .removeListener('select', this.onComponentSelect, true)
            .removeListener('deselect', this.onComponentDeselect)
            .removeListener('propchange', this.onComponentPropChange);

        super.remove();
    }
}