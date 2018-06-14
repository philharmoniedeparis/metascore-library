import Dom from '../Dom';

/**
 * Fired before the dragging starts
 * The dragging can be canceled by invoking preventDefault on the event
 *
 * @event beforedrag
 */
const EVT_BEFOREDRAG = 'beforedrag';

/**
 * Fired when the dragging started
 *
 * @event dragstart
 */
const EVT_DRAGSTART = 'dragstart';

/**
 * Fired when a drag occured
 *
 * @event drag
 */
const EVT_DRAG = 'drag';

/**
 * Fired when the dragging ended
 *
 * @event dragend
 */
const EVT_DRAGEND = 'dragend';

/**
 * A class for adding draggable behaviors
 */
export default class Draggable {

    /**
     * Create a Draggable behaviour
     * @param {Object} configs Custom configs to override defaults
     * @param {Dom} configs.target The Dom object to add the behavior to
     * @param {Dom} configs.handle The Dom object to use as a dragging handle
     * @param {Object} [configs.limits={'top': null, 'left': null}] The limits of the dragging
     */
    constructor(configs) {
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.doc = new Dom(this.configs.target.get(0).ownerDocument);

        // fix event handlers scope
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);

        this.configs.handle.addListener('mousedown', this.onMouseDown);

        this.enable();
    }

    static getDefaults(){
        return {
            'target': null,
            'handle': null,
            'limits': {
                'top': null,
                'left': null
            }
        };
    }

    /**
     * The mousedown event handler
     *
     * @method onMouseDown
     * @private
     * @param {Event} evt The event object
     */
    onMouseDown(evt){
        if(!this.enabled){
            return;
        }

        if(!this.configs.target.triggerEvent(EVT_BEFOREDRAG, null, true, true)){
            return;
        }

        this.start_state = {
            'left': parseInt(this.configs.target.css('left'), 10) - evt.clientX,
            'top': parseInt(this.configs.target.css('top'), 10) - evt.clientY
        };

        this.doc
            .addListener('mouseup', this.onMouseUp)
            .addListener('mousemove', this.onMouseMove);

        this.configs.target
            .addClass('dragging')
            .triggerEvent(EVT_DRAGSTART, null, false, true);

        evt.stopPropagation();
    }

    /**
     * The mousemove event handler
     *
     * @method onMouseMove
     * @private
     * @param {Event} evt The event object
     */
    onMouseMove(evt){
        let left = evt.clientX + this.start_state.left,
            top = evt.clientY + this.start_state.top;

        if(!isNaN(this.configs.limits.top)){
            top = Math.max(top, this.configs.limits.top);
        }

        if(!isNaN(this.configs.limits.left)){
            left = Math.max(left, this.configs.limits.left);
        }

        this.configs.target
            .css('left', `${left}px`)
            .css('top', `${top}px`)
            .triggerEvent(EVT_DRAG, null, false, true);

        evt.stopPropagation();
    }

    /**
     * The mouseup event handler
     *
     * @method onMouseUp
     * @private
     * @param {Event} evt The event object
     */
    onMouseUp(evt){
        this.doc
            .removeListener('mousemove', this.onMouseMove)
            .removeListener('mouseup', this.onMouseUp);

        this.configs.target
            .removeClass('dragging')
            .triggerEvent(EVT_DRAGEND, null, false, true);

        evt.stopPropagation();
    }

    /**
     * Enable the behavior
     *
     * @method enable
     * @chainable
     */
    enable() {
        this.configs.target.addClass('draggable');

        this.configs.handle.addClass('drag-handle');

        this.enabled = true;

        return this;
    }

    /**
     * Disable the behavior
     *
     * @method disable
     * @chainable
     */
    disable() {
        this.configs.target.removeClass('draggable');

        this.configs.handle.removeClass('drag-handle');

        this.enabled = false;

        return this;
    }

    /**
     * Destroy the behavior
     *
     * @method destroy
     * @chainable
     */
    destroy() {
        this.disable();

        this.configs.handle.removeListener('mousedown', this.onMouseDown);

        return this;
    }

}
