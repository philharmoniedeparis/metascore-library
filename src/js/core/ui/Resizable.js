import Dom from '../Dom';

/**
 * Fired when a resize started
 *
 * @event resizestart
 */
const EVT_RESIZESTART = 'resizestart';

/**
 * Fired when a resize occured
 *
 * @event resize
 */
const EVT_RESIZE = 'resize';

/**
 * Fired when a resize ended
 *
 * @event resizeend
 */
const EVT_RESIZEEND = 'resizeend';

export default class Resizable {

    /**
     * A class for adding resizable behaviors
     *
     * @class Resizable
     * @extends Class
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Dom} configs.target The Dom object to add the behavior to
     * @param {Object} [configs.directions={'top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'}] The directions at which a resize is allowed
     */
    constructor(configs) {
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.doc = new Dom(this.configs.target.get(0).ownerDocument);

        this.handles = {};

        // fix event handlers scope
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);


        this.configs.directions.forEach((direction) => {
            this.handles[direction] = new Dom('<div/>', {'class': 'resize-handle'})
                .data('direction', direction)
                .addListener('mousedown', this.onMouseDown)
                .appendTo(this.configs.target);
        });

        this.enable();
    }

    static getDefaults(){
        return {
            'target': null,
            'directions': [
                'top',
                'right',
                'bottom',
                'left',
                'top-left',
                'top-right',
                'bottom-left',
                'bottom-right'
            ]
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

        this.start_state = {
            'handle': evt.target,
            'x': evt.clientX,
            'y': evt.clientY,
            'left': parseInt(this.configs.target.css('left'), 10),
            'top': parseInt(this.configs.target.css('top'), 10),
            'w': parseInt(this.configs.target.css('width'), 10),
            'h': parseInt(this.configs.target.css('height'), 10)
        };

        this.doc
            .addListener('mousemove', this.onMouseMove, this)
            .addListener('mouseup', this.onMouseUp, this);

        this.configs.target
            .addClass('resizing')
            .triggerEvent(EVT_RESIZESTART, null, false, true);

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
        let handle = new Dom(this.start_state.handle),
            w, h, top, left;

        switch(handle.data('direction')){
            case 'top':
                h = this.start_state.h - evt.clientY + this.start_state.y;
                top = this.start_state.top + evt.clientY    - this.start_state.y;
                break;
            case 'right':
                w = this.start_state.w + evt.clientX - this.start_state.x;
                break;
            case 'bottom':
                h = this.start_state.h + evt.clientY - this.start_state.y;
                break;
            case 'left':
                w = this.start_state.w - evt.clientX + this.start_state.x;
                left = this.start_state.left + evt.clientX - this.start_state.x;
                break;
            case 'top-left':
                w = this.start_state.w - evt.clientX + this.start_state.x;
                h = this.start_state.h - evt.clientY + this.start_state.y;
                top = this.start_state.top + evt.clientY    - this.start_state.y;
                left = this.start_state.left + evt.clientX - this.start_state.x;
                break;
            case 'top-right':
                w = this.start_state.w + evt.clientX - this.start_state.x;
                h = this.start_state.h - evt.clientY + this.start_state.y;
                top = this.start_state.top + evt.clientY - this.start_state.y;
                break;
            case 'bottom-left':
                w = this.start_state.w - evt.clientX + this.start_state.x;
                h = this.start_state.h + evt.clientY - this.start_state.y;
                left = this.start_state.left + evt.clientX - this.start_state.x;
                break;
            case 'bottom-right':
                w = this.start_state.w + evt.clientX - this.start_state.x;
                h = this.start_state.h + evt.clientY - this.start_state.y;
                break;
        }

        if(top !== undefined){
            this.configs.target.css('top', `${top}px`);
        }
        if(left !== undefined){
            this.configs.target.css('left', `${left}px`);
        }

        this.configs.target
            .css('width', `${w}px`)
            .css('height', `${h}px`)
            .triggerEvent(EVT_RESIZE, null, false, true);

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
            .removeListener('mousemove', this.onMouseMove, this)
            .removeListener('mouseup', this.onMouseUp, this);

        this.configs.target
            .removeClass('resizing')
            .triggerEvent(EVT_RESIZEEND, null, false, true);

        evt.stopPropagation();
    }

    /**
     * Get a handle
     * @method getHandle
     * @param {String} direction The direction of the handle to get
     * @return {Dom} The handle
     */
    getHandle(direction){
        return this.handles[direction];
    }

    /**
     * Enable the behavior
     *
     * @method enable
     * @chainable
     */
    enable() {
        this.configs.target.addClass('resizable');

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
        this.configs.target.removeClass('resizable');

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

        if(this.handles){
            Object.entries(this.handles).forEach(([, handle]) => {
                handle.remove();
            });
        }

        return this;
    }

}
