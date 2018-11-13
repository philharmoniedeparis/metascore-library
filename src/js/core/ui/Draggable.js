import Dom from '../Dom';

import {className} from '../../../css/core/ui/Draggable.less';

/**
 * A class for adding draggable behaviors
 *
 * @emits {beforedrag} Fired before the dragging starts. The dragging can be canceled by invoking preventDefault on the event
 * @emits {dragstart} Fired when the dragging started
 * @emits {drag} Fired when a drag occured
 * @emits {dragend} Fired when the dragging ended
 */
export default class Draggable {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Dom} target The Dom object to add the behavior to
     * @property {Dom} handle The Dom object to use as a dragging handle
     */
    constructor(configs) {
        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * The target's owner document
         * @type {Dom}
         */
        this.doc = new Dom(this.configs.target.get(0).ownerDocument);

        // fix event handlers scope
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onClick = this.onClick.bind(this);

        this.configs.handle.addListener('mousedown', this.onMouseDown);

        this.enable();
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'target': null,
            'handle': null
        };
    }

    /**
     * The mousedown event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseDown(evt){
        if(!this.enabled){
            return;
        }

        if(!this.configs.target.triggerEvent('beforedrag', null, true, true)){
            return;
        }

        /**
         * The state at which the target was on mouse down
         * @type {Object}
         */
        this._start_state = {
            'x': evt.clientX,
            'y': evt.clientY
        };

        this.doc
            .addListener('mousemove', this.onMouseMove)
            .addListener('mouseup', this.onMouseUp);

        this.configs.target
            .addClass('dragging')
            .triggerEvent('dragstart', null, false, true);

        evt.stopPropagation();
        evt.preventDefault();
    }

    /**
     * The mousemove event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseMove(evt){
        const offsetX = evt.clientX - this._start_state.x;
        const offsetY = evt.clientY - this._start_state.y;

        this._start_state.x = evt.clientX;
        this._start_state.y = evt.clientY;

        /**
         * Whether the target is being dragged
         * @type {Boolean}
         */
        this._dragged = true;

        this.configs.target.triggerEvent('drag', {'offsetX': offsetX, 'offsetY': offsetY}, false, true);

        evt.stopPropagation();
        evt.preventDefault();
    }

    /**
     * The mouseup event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseUp(evt){
        this.doc
            .removeListener('mousemove', this.onMouseMove)
            .removeListener('mouseup', this.onMouseUp);

        // if a drag did occur, prevent the next click event from propagating
        if(this._dragged){
            delete this._dragged;
            this.doc.addOneTimeListener('click', this.onClick, true);
        }

        this.configs.target
            .removeClass('dragging')
            .triggerEvent('dragend', null, false, true);

        delete this._start_state;

        evt.stopPropagation();
        evt.preventDefault();
    }

    /**
    * The click event handler
    *
    * @private
    * @param {Event} evt The event object
    */
    onClick(evt){
        evt.stopPropagation();
        evt.preventDefault();
    }

    /**
     * Enable the behavior
     *
     * @return {this}
     */
    enable() {
        this.configs.target.addClass(`draggable ${className}`);

        this.configs.handle.addClass('drag-handle');

        /**
         * Whether the behavior is enabled
         * @type {Boolean}
         */
        this.enabled = true;

        return this;
    }

    /**
     * Disable the behavior
     *
     * @return {this}
     */
    disable() {
        this.configs.target.removeClass(`draggable ${className}`);

        this.configs.handle.removeClass('drag-handle');

        this.enabled = false;

        return this;
    }

    /**
     * Destroy the behavior
     *
     * @return {this}
     */
    destroy() {
        this.disable();

        this.configs.handle.removeListener('mousedown', this.onMouseDown);

        return this;
    }

}
