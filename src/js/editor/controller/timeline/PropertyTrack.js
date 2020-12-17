import Dom from '../../../core/Dom';
import Handle from './track/Handle';
import Keyframe from './track/Keyframe';
import {MasterClock} from '../../../core/media/MediaClock';
import {clone} from '../../../core/utils/Array';

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
            .addListener('propchange', this.onComponentPropChange.bind(this));

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
            .addDelegate('.keyframe', 'click', this.onKeyframeClick.bind(this))
            .appendTo(this);

        this
            .addDelegate('.keyframes-wrapper', 'click', this.onKeyframesWrapperClick.bind(this))
            .data('component', component.getId())
            .data('property', this.property)
            .attr('title', this.property);

        this.updateKeyframes();
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

        if (property !== this.property) {
            return;
        }

        if (!this.getComponent().isPropertyAnimated(property, value)) {
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
        const duration = parseFloat(this.css('--timeline-duration'));
        const {width, left} = evt.target.getBoundingClientRect();
        const x = evt.pageX - left;
        const time = (x / width) * duration;
        const values = clone(component.getPropertyValue(this.property));
        const value = component.getPropertyValueAtTime(this.property, time);

        values.push([time, value]);

        component.setPropertyValue(this.property, values);
    }

    /**
     * Keyframe click event handler.
     *
     * @private
     * @param {MouseEvent} evt The event object
     */
    onKeyframeClick(evt) {
        const time = Dom.css(evt.target, '--keyframe-time');
        MasterClock.setTime(time);
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
        const values = this.component.getPropertyValue(this.property);

        // Remove keyframes of no-longer existing values.
        const times = values.map(([time]) => time);
        this.keyframes = this.keyframes.filter((keyframe) => {
            const time = keyframe.getTime();
            if(!times.includes(time)){
                keyframe.remove();
                return false;
            }
            return true;
        });

        // Add keyframes for new values.
        values.forEach(([time, value]) => {
            const index = this.keyframes.findIndex((k) => k.getTime() === time);
            if(index === -1){
                const keyframe = new Keyframe(time, value, this.configs.keyframe)
                    .addListener('dragstart', this.onKeyframeDragStart.bind(this))
                    .addListener('drag', this.onKeyframeDrag.bind(this))
                    .addListener('dragend', this.onKeyframeDragEnd.bind(this))
                    .appendTo(this.keyframes_wrapper);

                this.keyframes.push(keyframe);
            }
        });

        this.keyframes.sort((a, b) => a.getTime() - b.getTime());
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
}
