import Dom from '../Dom';

import {bodyClassName, className} from '../../../css/core/ui/Resizable.less';

/**
 * A class for adding resizable behaviors
 *
 * @emits {resizestart} Fired when a resize started
 * @emits {resize} Fired when a resize occured
 * @emits {resizeend} Fired when a resize ended
 */
export default class Resizable {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {Dom} target The Dom object to add the behavior to
     * @property {Object} [directions={'top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'}] The directions at which a resize is allowed
     */
    constructor(configs) {
        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * A list of resize handles
         * @type {Object}
         */
        this.handles = {};

        // fix event handlers scope
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onClick = this.onClick.bind(this);

        this.configs.directions.forEach((direction) => {
            this.handles[direction] = new Dom('<div/>', {'class': 'resize-handle'})
                .data('direction', direction)
                .addListener('mousedown', this.onMouseDown)
                .appendTo(this.configs.target);
        });

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
     * @private
     * @param {Event} evt The event object
     */
    onMouseDown(evt){
        if(!this.enabled){
            return;
        }

        /**
         * The state at which the target was on mouse down
         * @type {Object}
         */
        this._start_state = {
            'direction': Dom.data(evt.target, 'direction'),
            'x': evt.clientX,
            'y': evt.clientY,
            'left': parseInt(this.configs.target.css('left'), 10),
            'top': parseInt(this.configs.target.css('top'), 10),
            'width': parseInt(this.configs.target.css('width'), 10),
            'height': parseInt(this.configs.target.css('height'), 10)
        };

        if(!this.doc){
            /**
             * The target's owner document
             * @type {Dom}
             */
            this.doc = new Dom(Dom.getElementDocument(this.configs.target.get(0)));
        }

        this.doc
            .addListener('mousemove', this.onMouseMove)
            .addListener('mouseup', this.onMouseUp);

        Dom.addClass(this.doc.get(0).body, bodyClassName);

        this.configs.target
            .addClass('resizing')
            .triggerEvent('resizestart', {'start_state': this._start_state}, false, true);

        evt.stopPropagation();
    }

    /**
     * The mousemove event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onMouseMove(evt){
        const direction = this._start_state.direction;
        const new_state = {};

        switch(direction){
            case 'top':
                new_state.height = this._start_state.height - evt.clientY + this._start_state.y;
                new_state.top = this._start_state.top + evt.clientY    - this._start_state.y;
                break;
            case 'right':
                new_state.width = this._start_state.width + evt.clientX - this._start_state.x;
                break;
            case 'bottom':
                new_state.height = this._start_state.height + evt.clientY - this._start_state.y;
                break;
            case 'left':
                new_state.width = this._start_state.width - evt.clientX + this._start_state.x;
                new_state.left = this._start_state.left + evt.clientX - this._start_state.x;
                break;
            case 'top-left':
                new_state.width = this._start_state.width - evt.clientX + this._start_state.x;
                new_state.height = this._start_state.height - evt.clientY + this._start_state.y;
                new_state.top = this._start_state.top + evt.clientY    - this._start_state.y;
                new_state.left = this._start_state.left + evt.clientX - this._start_state.x;
                break;
            case 'top-right':
                new_state.width = this._start_state.width + evt.clientX - this._start_state.x;
                new_state.height = this._start_state.height - evt.clientY + this._start_state.y;
                new_state.top = this._start_state.top + evt.clientY - this._start_state.y;
                break;
            case 'bottom-left':
                new_state.width = this._start_state.width - evt.clientX + this._start_state.x;
                new_state.height = this._start_state.height + evt.clientY - this._start_state.y;
                new_state.left = this._start_state.left + evt.clientX - this._start_state.x;
                break;
            case 'bottom-right':
                new_state.width = this._start_state.width + evt.clientX - this._start_state.x;
                new_state.height = this._start_state.height + evt.clientY - this._start_state.y;
                break;
        }

        /**
         * Whether the target is being resized
         * @type {Boolean}
         */
        this._resized = true;

        if(this.configs.target.triggerEvent('beforeresize', {'start_state': this._start_state, 'new_state': new_state}, false) !== false){
            Object.entries(new_state).forEach(([key, value]) => {
                this.configs.target.css(key, `${value}px`);
            });

            this.configs.target.triggerEvent('resize', {'start_state': this._start_state}, false, true);
        }

        evt.stopPropagation();
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

        // if a resize did occur, prevent the next click event from propagating
        if(this._resized){
            delete this._resized;
            this.doc.addOneTimeListener('click', this.onClick, true);
        }

        Dom.removeClass(this.doc.get(0).body, bodyClassName);

        this.configs.target
            .removeClass('resizing')
            .triggerEvent('resizeend', {'start_state': this._start_state}, false, true);

        delete this._start_state;

        evt.stopPropagation();
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
     * Get a handle
     * @param {String} direction The direction of the handle to get
     * @return {Dom} The handle
     */
    getHandle(direction){
        return this.handles[direction];
    }

    /**
     * Enable the behavior
     *
     * @return {this}
     */
    enable() {
        this.configs.target.addClass(`resizable ${className}`);

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
        this.configs.target.removeClass(`resizable ${className}`);

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

        if(this.handles){
            Object.entries(this.handles).forEach(([, handle]) => {
                handle.remove();
            });
        }

        return this;
    }

}
