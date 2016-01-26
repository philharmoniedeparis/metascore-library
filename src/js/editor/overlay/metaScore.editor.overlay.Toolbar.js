/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').Toolbar = (function(){

    /**
     * A title toolbar for overlay's
     *
     * @class Toolbar
     * @namespace editor.overlay
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.title=null] The text to display as a title
     */
    function Toolbar(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Toolbar.parent.call(this, '<div/>', {'class': 'toolbar clearfix'});

        this.title = new metaScore.Dom('<div/>', {'class': 'title'})
            .appendTo(this);

        this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        if(this.configs.title){
            this.title.text(this.configs.title);
        }
    }

    Toolbar.defaults = {
        'title': null
    };

    metaScore.Dom.extend(Toolbar);

    /**
     * Get the title's Dom
     * 
     * @method getTitle
     * @return {Dom} The Dom object
     */
    Toolbar.prototype.getTitle = function(){
        return this.title;
    };

    /**
     * Add a button
     * 
     * @method addButton
     * @param {String} action The action associated with the button
     * @return {editor.Button} The created button
     */
    Toolbar.prototype.addButton = function(action){
        var button = new metaScore.editor.Button().data('action', action)
            .appendTo(this.buttons);

        return button;
    };

    /**
     * Get a button by associated action
     * 
     * @method getButton
     * @param {String} action The action associated with the button
     * @return {Dom} The button
     */
    Toolbar.prototype.getButton = function(action){
        return this.buttons.children('[data-action="'+ action +'"]');
    };

    return Toolbar;

})();