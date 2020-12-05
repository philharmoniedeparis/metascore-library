import Dom from '../../../../core/Dom';
import Draggable from '../../../../core/ui/Draggable';
import {formatTime} from '../../../../core/utils/Media';
import {clamp, round} from '../../../../core/utils/Math';

import {className} from '../../../../../css/editor/controller/timeline/track/Keyframe.scss';

/**
 * A track keyframe.
 */
export default class Keyframe extends Dom {

    static defaults = {
        'draggableConfigs': null
    };

    /**
     * Instantiate
     *
     * @param {number} time The keyframe time.
     * @param {Mixed} value The assocaited value.
     */
    constructor(time, value, configs) {
        // call parent constructor
        super('<div/>', {'class': `keyframe ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        this
            .setTime(time)
            .setValue(value)
            .updateTitle()
            .addListener('dragstart', this.onDragStart.bind(this))
            .addListener('drag', this.onDrag.bind(this))
            .addListener('dragend', this.onDragEnd.bind(this));

        this._draggable = new Draggable(Object.assign({}, this.configs.draggableConfigs, {
            'target': this,
            'handle': this,
            'autoUpdate': false,
            'snapPositions': {
                'x': [0, 1]
            }
        }));
    }

    /**
     * Set the associated time.
     *
     * @param {number} time The time.
     * @return {this}.
     */
    setTime(time) {
        /**
         * The assocaited time.
         * @type {number}
         */
        this.time = round(time, 2);

        this.css('--keyframe-time', this.time);

        return this;
    }

    /**
     * Get the associated time.
     *
     * @return {number} The time.
     */
    getTime() {
        return this.time;
    }

    /**
     * Set the associated value.
     *
     * @param {Mixed} value The value.
     * @return {this}.
     */
    setValue(value) {
        /**
         * The assocaited value.
         * @type {Mixed}
         */
        this.value = value;

        return this;
    }

    /**
     * Get the associated value.
     *
     * @return {Mixed} The value.
     */
    getValue() {
        return this.value;
    }

    /**
     * Update the title attribute.
     *
     * @private
     * @return {this}
     */
    updateTitle() {
        const time = this.getTime();
        const value = this.getValue();

        this.attr('title', `${formatTime(time)} : ${value}`);

        return this;
    }

    /**
     * Keyframe dragstart event callback
     *
     * @private
     */
    onDragStart(){
        const duration = parseFloat(this.css('--timeline-duration'));
        const {width} = this.parents().get(0).getBoundingClientRect();
        this._drag_multiplier = duration / width;
    }

    /**
     * Keyframe drag event callback
     *
     * @private
     * @param {CustomEvent} evt The event object
     */
    onDrag(evt){
        const state = evt.detail.behavior.getState();
        const duration = parseFloat(this.css('--timeline-duration'));
        const prev_time = this.getTime();
        const diff = state.offsetX * this._drag_multiplier;

        // Adjust diff to prevent time from going below 0 and above duration.
        const new_time = clamp(prev_time + diff, 0, duration);

        this.setTime(new_time).updateTitle();
    }

    /**
     * Keyframe dragend event callback
     *
     * @private
     */
    onDragEnd(){
        delete this._drag_multiplier;
    }
}
