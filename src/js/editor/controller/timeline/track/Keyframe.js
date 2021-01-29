import Dom from '../../../../core/Dom';
import Draggable from '../../../../core/ui/Draggable';
import {formatTime} from '../../../../core/utils/Media';
import {clamp, round} from '../../../../core/utils/Math';

import {className} from '../../../../../css/editor/controller/timeline/track/Keyframe.scss';

/**
 * A track keyframe.
 *
 * @emits {beforeselect} Fired before marked as selected.
 * The select can be canceled by invoking preventDefault.
 * @param {Object} keyframe The keyframe instance
 *
 * @emits {select} Fired when marked as selected
 * @param {Object} keyframe The keyframe instance
 *
 * @emits {deselect} Fired when unmarked as selected
 * @param {Object} keyframe The keyframe instance
 */
export default class Keyframe extends Dom {

    static defaults = {
        'draggableConfigs': null
    };

    /**
     * Instantiate
     *
     * @param {string} property The associated property's name
     * @param {number} time The keyframe time.
     * @param {Mixed} value The assocaited value.
     */
    constructor(property, time, value, configs) {
        // call parent constructor
        super('<div/>', {'class': `keyframe ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.defaults, configs);

        /**
         * The associated property
         * @type {String}
         */
        this.property = property;

        this
            .setTime(time)
            .setValue(value)
            .addListener('click', this.onClick.bind(this))
            .addListener('dragstart', this.onDragStart.bind(this))
            .addListener('drag', this.onDrag.bind(this))
            .addListener('dragend', this.onDragEnd.bind(this));
    }

    /**
     * Normalize a time value.
     *
     * @param {number} time The time.
     * @return {number} The normalized value.
     */
    static normalizeTime(time) {
        return round(time, 2);
    }

    /**
     * Get the associated property name.
     *
     * @return {string} The property's name.
     */
    getProperty() {
        return this.property;
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
        this.time = this.constructor.normalizeTime(time);

        this
            .css('--keyframe-time', this.time)
            .updateTitle();


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

        this.updateTitle();

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
     * Get the draggable behaviour
     *
     * @return {Draggable} The draggable behaviour
     */
    getDraggable() {
        if (!this._draggable){
            /**
             * The draggable behavior
             * @type {Draggable}
             */
            this._draggable = new Draggable(Object.assign({}, this.configs.draggableConfigs, {
                'target': this,
                'handle': this,
                'autoUpdate': false,
                'snapPositions': {
                    'x': [0, 1]
                }
            }));
        }

        return this._draggable;
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
     * Mark as selected.
     *
     * @param {Boolean} [supressEvent=false] Whether to supress the select event
     * @return {this}
     */
    select(supressEvent=false) {
        if (!this.isSelected()) {
            if(this.triggerEvent('beforeselect', {'keyframe': this}) !== false){
                this.addClass('selected');
                this.getDraggable().enable();

                if(supressEvent !== true){
                    this.triggerEvent('select', {'keyframe': this});
                }
            }
        }

        return this;
    }

    /**
     * Unmark as selected.
     *
     * @param {Boolean} [supressEvent=false] Whether to supress the select event
     * @return {this}
     */
    deselect(supressEvent=false) {
        if (this.isSelected()) {
            this.removeClass('selected');
            this.getDraggable().disable();

            if(supressEvent !== true){
                this.triggerEvent('deselect', {'keyframe': this});
            }
        }

        return this;
    }

    /**
     * Check if marked as selected.
     *
     * @return {Boolean} True if marked as selected, false otherwise.
     */
    isSelected() {
        return this.hasClass('selected');
    }

    /**
     * Click event callback
     *
     * @private
     */
    onClick(){
        this.select();
    }

    /**
     * Dragstart event callback
     *
     * @private
     */
    onDragStart(){
        const duration = parseFloat(this.css('--timeline-duration'));
        const {width} = this.parents().get(0).getBoundingClientRect();
        this._drag_multiplier = duration / width;
    }

    /**
     * Drag event callback
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

        this.setTime(new_time);
    }

    /**
     * Dragend event callback
     *
     * @private
     */
    onDragEnd(){
        delete this._drag_multiplier;
    }
}
