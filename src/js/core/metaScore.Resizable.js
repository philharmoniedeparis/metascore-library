/**
 * @module Core
 */

metaScore.Resizable = (function () {

    /**
     * Fired when a resize started
     *
     * @event resizestart
     */
    var EVT_RESIZESTART = 'resizestart';

    /**
     * Fired when a resize occured
     *
     * @event resize
     */
    var EVT_RESIZE = 'resize';

    /**
     * Fired when a resize ended
     *
     * @event resizeend
     */
    var EVT_RESIZEEND = 'resizeend';

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
    function Resizable(configs) {
        this.configs = this.getConfigs(configs);

        this.doc = new metaScore.Dom(this.configs.target.get(0).ownerDocument);

        this.handles = {};

        // fix event handlers scope
        this.onMouseDown = metaScore.Function.proxy(this.onMouseDown, this);
        this.onMouseMove = metaScore.Function.proxy(this.onMouseMove, this);
        this.onMouseUp = metaScore.Function.proxy(this.onMouseUp, this);

        metaScore.Array.each(this.configs.directions, function(index, direction){
            this.handles[direction] = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
                .data('direction', direction)
                .addListener('mousedown', this.onMouseDown)
                .appendTo(this.configs.target);
        }, this);

        this.enable();
    }

    Resizable.defaults = {
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

    metaScore.Class.extend(Resizable);

    /**
     * The mousedown event handler
     * 
     * @method onMouseDown
     * @private
     * @param {Event} evt The event object
     */
    Resizable.prototype.onMouseDown = function(evt){
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
    };

    /**
     * The mousemove event handler
     * 
     * @method onMouseMove
     * @private
     * @param {Event} evt The event object
     */
    Resizable.prototype.onMouseMove = function(evt){
        var handle = new metaScore.Dom(this.start_state.handle),
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
            this.configs.target.css('top', top +'px');
        }
        if(left !== undefined){
            this.configs.target.css('left', left +'px');
        }

        this.configs.target
            .css('width', w +'px')
            .css('height', h +'px')
            .triggerEvent(EVT_RESIZE, null, false, true);

        evt.stopPropagation();
    };

    /**
     * The mouseup event handler
     * 
     * @method onMouseUp
     * @private
     * @param {Event} evt The event object
     */
    Resizable.prototype.onMouseUp = function(evt){
        this.doc
            .removeListener('mousemove', this.onMouseMove, this)
            .removeListener('mouseup', this.onMouseUp, this);

        this.configs.target
            .removeClass('resizing')
            .triggerEvent(EVT_RESIZEEND, null, false, true);

        evt.stopPropagation();
    };

    /**
     * Get a handle
     * @method getHandle
     * @param {String} direction The direction of the handle to get
     * @return {Dom} The handle
     */
    Resizable.prototype.getHandle = function(direction){
        return this.handles[direction];
    };

    /**
     * Enable the behavior
     * 
     * @method enable
     * @chainable
     */
    Resizable.prototype.enable = function(){
        this.configs.target.addClass('resizable');

        this.enabled = true;

        return this;
    };

    /**
     * Disable the behavior
     * 
     * @method disable
     * @chainable
     */
    Resizable.prototype.disable = function(){
        this.configs.target.removeClass('resizable');

        this.enabled = false;

        return this;
    };

    /**
     * Destroy the behavior
     * 
     * @method destroy
     * @chainable
     */
    Resizable.prototype.destroy = function(){
        this.disable();

        metaScore.Object.each(this.handles, function(index, handle){
            handle.remove();
        }, this);

        return this;
    };

    return Resizable;

})();