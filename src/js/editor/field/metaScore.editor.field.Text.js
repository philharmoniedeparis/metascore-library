/**
* Description
* @class editor.field.Text
* @extends editor.Field
*/

metaScore.namespace('editor.field').Text = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function TextField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        TextField.parent.call(this, this.configs);

        this.addClass('textfield');
    }

    TextField.defaults = {
        /**
        * Defines the default value
        */
        value: ''
    };

    metaScore.editor.Field.extend(TextField);

    return TextField;

})();