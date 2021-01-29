import Dom from '../../../core/Dom';
import Locale from '../../../core/Locale'
import Handle from './track/Handle';
import Keyframe from './track/Keyframe';
import {MasterClock} from '../../../core/media/MediaClock';

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
            .data('component', component.getId())
            .data('property', this.property)
            .attr('title', this.property);

        this.updateKeyframes();
    }

    /**
     * Component selected event callback
     *
     * @private
     */
    onComponentSelected(){
        this.keyframes_wrapper
            .addListener('click', this.onKeyframesWrapperClick)
            .attr('title', Locale.t(
                'editor.controller.timeline.PropertyTrack.keyframes-wrapper.title',
                'Add keyframe'
            ));
    }

    /**
     * Component deselected event callback
     *
     * @private
     */
    onComponentDeselected(){
        this.keyframes_wrapper
            .removeListener('click', this.onKeyframesWrapperClick)
            .attr('title', null);
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
        if(!Dom.is(evt.target, '.keyframes-wrapper')) {
            return;
        }

        const component = this.getComponent();
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

        component.setPropertyValue(this.property, values);
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
        const keyframe = new Keyframe(this.property, time, value, this.configs.keyframe)
            .addListener('beforeselect', this.onKeyframeBeforeSelect.bind(this))
            .addListener('select', this.onKeyframeSelect.bind(this))
            .addListener('dragstart', this.onKeyframeDragStart.bind(this))
            .addListener('drag', this.onKeyframeDrag.bind(this))
            .addListener('dragend', this.onKeyframeDragEnd.bind(this))
            .appendTo(this.keyframes_wrapper);

        this.keyframes.push(keyframe);

        return keyframe;
    }

    /**
     * Keyframe beforeselect event handler.
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onKeyframeBeforeSelect(evt) {
        const keyframe = evt.detail.keyframe;
        const selected = this.getSelectedKeyframe();

        if (selected && selected !== keyframe) {
            selected.deselect();
        }
    }

    /**
     * Keyframe select event handler.
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onKeyframeSelect(evt) {
        const keyframe = evt.detail.keyframe;
        MasterClock.setTime(keyframe.getTime());
    }

    /**
     * Keyframe dragstart event handler.
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onKeyframeDragStart(evt) {
        this.triggerEvent('keyframedragstart', evt.detail, false, true);
    }

    /**
     * Keyframe drag event handler.
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onKeyframeDrag(evt) {
        const component = this.getComponent();

        const values = this.keyframes.map((keyframe) => {
            return [keyframe.getTime() , keyframe.getValue()];
        });

        component.setPropertyValue(this.property, values);

        this.triggerEvent('keyframedrag', evt.detail, false, true);
    }

    /**
     * Keyframe dragend event handler.
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onKeyframeDragEnd(evt) {
        this.triggerEvent('keyframedragend', evt.detail, false, true);
    }

    /**
     * Get the currently selected keyframe if any.
     *
     * @return {Keyframe?} The selected keyframe.
     */
    getSelectedKeyframe() {
        return this.keyframes.find((keyframe) => {
            return keyframe.isSelected();
        });
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
