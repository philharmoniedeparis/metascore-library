/**
 * @module Core
 */

metaScore.Button = (function () {

    /**
     * A simple button based on an HTML button element
     *
     * @class Button
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.label=null] A text to add as a label
     */
    function Button(configs) {
        this.configs = this.getConfigs(configs);

        // call the super constructor.
        metaScore.Dom.call(this, '<button/>');

        this.disabled = false;

        if(this.configs.label){
            this.setLabel(this.configs.label);
        }

        this.addListener('click', metaScore.Function.proxy(this.onClick, this));
    }

    Button.defaults = {
        'label': null
    };

    metaScore.Dom.extend(Button);

    /**
     * The click event handler
     *
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    Button.prototype.onClick = function(evt){
        if(this.disabled){
            evt.stopPropagation();
        }
    };

    /**
     * Set the button's text
     *
     * @method setLabel
     * @param {String} text The text to use as the label
     * @chainable
     */
    Button.prototype.setLabel = function(text){
        if(this.label === undefined){
            this.label = new metaScore.Dom('<span/>', {'class': 'label'})
                .appendTo(this);
        }

        this.label.text(text);

        return this;
    };

    /**
     * Disable the button
     *
     * @method disable
     * @chainable
     */
    Button.prototype.disable = function(){
        this.disabled = true;

        this.addClass('disabled');

        return this;
    };

    /**
     * Enable the button
     *
     * @method enable
     * @chainable
     */
    Button.prototype.enable = function(){
        this.disabled = false;

        this.removeClass('disabled');

        return this;
    };

    return Button;

})();