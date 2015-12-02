/**
* Description
* @class editor.Button
* @extends Dom
*/

metaScore.namespace('editor').Button = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
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
        /**
        * A text to add as a label
        */
        label: null
    };

    metaScore.Dom.extend(Button);

    /**
     * Description
     * @method onClick
     * @param {} evt
     * @return
     */
    Button.prototype.onClick = function(evt){
        if(this.disabled){
            evt.stopPropagation();
        }
    };

    /**
     * Description
     * @method setLabel
     * @param {} text
     * @return ThisExpression
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
     * @method disable
     * @return ThisExpression
     */
    Button.prototype.disable = function(){
        this.disabled = true;

        this.addClass('disabled');

        return this;
    };

    /**
     * Enable the button
     * @method enable
     * @return ThisExpression
     */
    Button.prototype.enable = function(){
        this.disabled = false;

        this.removeClass('disabled');

        return this;
    };

    return Button;

})();