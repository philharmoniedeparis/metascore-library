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
     */
    constructor(configs) {
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.doc = new Dom(this.configs.target.get(0).ownerDocument);

        // fix event handlers scope
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onClick = this.onClick.bind(this);

        this.configs.handle.addListener('mousedown', this.onMouseDown);

        this.enable();
    }

    static getDefaults(){
        return {
            'target': null,
            'handle': null
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

        this._start_state = {
            'x': evt.clientX,
            'y': evt.clientY
        };

        this.doc
            .addListener('mousemove', this.onMouseMove)
            .addListener('mouseup', this.onMouseUp);

        this.configs.target
            .addClass('dragging')
            .triggerEvent(EVT_DRAGSTART, null, false, true);

        evt.stopPropagation();
        evt.preventDefault();
    }

    /**
     * The mousemove event handler
     *
     * @method onMouseMove
     * @private
     * @param {Event} evt The event object
     */
    onMouseMove(evt){
        const offsetX = evt.clientX - this._start_state.x;
        const offsetY = evt.clientY - this._start_state.y;

        this._start_state.x = evt.clientX;
        this._start_state.y = evt.clientY;
        this._dragged = true;

        this.configs.target.triggerEvent(EVT_DRAG, {'offsetX': offsetX, 'offsetY': offsetY}, false, true);

        evt.stopPropagation();
        evt.preventDefault();
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

        // if a drag did occur, prevent the next click event from propagating
        if(this._dragged){
            delete this._dragged;
            this.doc.addOneTimeListener('click', this.onClick, true);
        }

        this.configs.target
            .removeClass('dragging')
            .triggerEvent(EVT_DRAGEND, null, false, true);

        delete this._start_state;

        evt.stopPropagation();
        evt.preventDefault();
    }

    onClick(evt){
        evt.stopPropagation();
        evt.preventDefault();
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
