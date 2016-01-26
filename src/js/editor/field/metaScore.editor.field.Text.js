/**
 * @module Editor
 */

metaScore.namespace('editor.field').Text = (function () {

    /**
     * A single-line text field based on an HTML input[type=text] element
     *
     * @class TextField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.value=''] The default value
     */
    function TextField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        TextField.parent.call(this, this.configs);

        this.addClass('textfield');
    }

    TextField.defaults = {
        'value': ''
    };

    metaScore.editor.Field.extend(TextField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    TextField.prototype.setupUI = function(){
        TextField.parent.prototype.setupUI.call(this);

        this.input.attr('type', 'text');
    };

    return TextField;

})();