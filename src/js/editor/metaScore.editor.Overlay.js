/**
 * @module Editor
 */

metaScore.namespace('editor').Overlay = (function(){

    /**
     * Fired when the overlay is shown
     *
     * @event show
     * @param {Object} overlay The overlay instance
     */
    var EVT_SHOW = 'show';

    /**
     * Fired when the overlay is hidden
     *
     * @event hide
     * @param {Object} overlay The overlay instance
     */
    var EVT_HIDE = 'hide';

    /**
     * A generic overlay class
     *
     * @class Overlay
     * @namespace editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.parent='.metaScore-editor'] The parent element in which the overlay will be appended
     * @param {Boolean} [configs.modal=true] Whether to create a mask underneath that covers its parent and does not allow the user to interact with any other Components until this is dismissed
     * @param {Boolean} [configs.draggable=true] Whether the overlay is draggable
     * @param {Boolean} [configs.autoShow=true] Whether to show the overlay automatically
     * @param {Boolean} [configs.toolbar=false] Whether to add a toolbar with title and close button
     * @param {String} [configs.title=''] The overlay's title
     */
    function Overlay(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Overlay.parent.call(this, '<div/>', {'class': 'overlay clearfix'});

        this.setupUI();

        if(this.configs.autoShow){
            this.show();
        }
    }

    Overlay.defaults = {
        'parent': '.metaScore-editor',
        'modal': true,
        'draggable': true,
        'autoShow': false,
        'toolbar': false,
        'title': ''
    };

    metaScore.Dom.extend(Overlay);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    Overlay.prototype.setupUI = function(){

        if(this.configs.modal){
            this.mask = new metaScore.Dom('<div/>', {'class': 'overlay-mask'});
        }

        if(this.configs.toolbar){
            this.toolbar = new metaScore.editor.overlay.Toolbar({'title': this.configs.title})
                .appendTo(this);

            this.toolbar.addButton('close')
                .addListener('click', metaScore.Function.proxy(this.onCloseClick, this));
        }

        this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
            .appendTo(this);

        if(this.configs.draggable){
            this.draggable = new metaScore.Draggable({
                'target': this,
                'handle': this.configs.toolbar ? this.toolbar : this
            });
        }

    };

    /**
     * Show the overlay
     *
     * @method show
     * @chainable
     */
    Overlay.prototype.show = function(){
        if(this.configs.modal){
            this.mask.appendTo(this.configs.parent);
        }

        this.appendTo(this.configs.parent);

        this.triggerEvent(EVT_SHOW, {'overlay': this}, true, false);

        return this;
    };

    /**
     * Hide the overlay
     *
     * @method hide
     * @chainable
     */
    Overlay.prototype.hide = function(){
        if(this.configs.modal){
            this.mask.remove();
        }

        this.remove();

        this.triggerEvent(EVT_HIDE, {'overlay': this}, true, false);

        return this;
    };

    /**
     * Get the overlay's toolbar
     *
     * @method getToolbar
     * @return {editor.overlay.Toolbar} The toolbar
     */
    Overlay.prototype.getToolbar = function(){
        return this.toolbar;
    };

    /**
     * Get the overlay's contents
     *
     * @method getContents
     * @return {Dom} The contents
     */
    Overlay.prototype.getContents = function(){
        return this.contents;
    };

    /**
     * The close button's click handler
     *
     * @method onCloseClick
     * @private
     * @param {Event} evt The event object
     */
    Overlay.prototype.onCloseClick = function(evt){
        this.hide();
    };

    return Overlay;

})();