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
        this.onComponentSelected = this.onComponentSelected.bind(this);
        this.onComponentDeselected = this.onComponentDeselected.bind(this);
        this.onComponentPropChange = this.onComponentPropChange.bind(this);
        this.onKeyframesWrapperClick = this.onKeyframesWrapperClick.bind(this);

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
            .addListener('selected', this.onComponentSelected, true)
            .addListener('deselected', this.onComponentDeselected)
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
            .addDelegate('.keyframes-wrapper', 'click', this.onKeyframesWrapperClick)
            .data('property', this.property)
            .attr('title', this.property)
            .updateKeyframes()
            .updateKeyframesWrapperTitle();
    }

    /**
     * Component selected event callback
     *
     * @private
     */
    onComponentSelected(){
        this.updateKeyframesWrapperTitle();
    }

    /**
     * Component deselected event callback
     *
     * @private
     */
    onComponentDeselected(){
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
     * Keyframes wrapper click event handler.
     *
     * @private
     * @param {MouseEvent} evt The event object
     */
    onKeyframesWrapperClick(evt) {
        const component = this.getComponent();
        if (!component.hasClass('selected')) {
            return;
        }

        const property = this.getProperty();
        const previous = clone(component.getPropertyValue(property));
        const duration = parseFloat(this.css('--timeline-duration'));
        const {width, left} = evt.target.getBoundingClientRect();
        const x = evt.pageX - left;
        const time = (x / width) * duration;
        const value = component.getAnimatedPropertyValueAtTime(this.property, time);

        this.addKeyframe(time, value).select();

        const values = this.getKeyframes().map((keyframe) => {
            return [
                keyframe.getTime(),
                keyframe.getValue()
            ];
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
        let added = false;

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
                added = true;
            }
        });

        if (added) {
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
     * Get the currently selected keyframes.
     *
     * @return {[Keyframe]} The selected keyframes.
     */
    getSelectedKeyframes() {
        return this.keyframes.filter(k => k.isSelected());
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
            .removeListener('selected', this.onComponentSelected, true)
            .removeListener('deselected', this.onComponentDeselected)
            .removeListener('propchange', this.onComponentPropChange);

        super.remove();
    }
}
