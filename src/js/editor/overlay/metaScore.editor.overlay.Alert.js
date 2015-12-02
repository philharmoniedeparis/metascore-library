/**
* Description
*
* @class editor.overlay.Alert
* @extends editor.Overlay
*/

metaScore.namespace('editor.overlay').Alert = (function () {

    /**
     * Fired when a button is clicked
     *
     * @event buttonclick
     * @param {Object} alert The alert instance
     * @param {String} action The buttons's action
     */
    var EVT_BUTTONCLICK = 'buttonclick';

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function Alert(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Alert.parent.call(this, this.configs);

        this.addClass('alert');
    }

    Alert.defaults = {
        /**
        * True to make this draggable
        */
        draggable: false,

        text: '',

        buttons: []
    };

    metaScore.editor.Overlay.extend(Alert);

    /**
     * Description
     * @method setupDOM
     * @return
     */
    Alert.prototype.setupDOM = function(){
        // call parent method
        Alert.parent.prototype.setupDOM.call(this);

        this.text = new metaScore.Dom('<div/>', {'class': 'text'})
            .appendTo(this.contents);

        if(this.configs.text){
            this.setText(this.configs.text);
        }

        this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .addDelegate('button', 'click', metaScore.Function.proxy(this.onButtonClick, this))
            .appendTo(this.contents);

        if(this.configs.buttons){
            metaScore.Object.each(this.configs.buttons, function(action, label){
                this.addButton(action, label);
            }, this);
        }

    };

    /**
     * Description
     * @method setText
     * @param {} str
     * @return
     */
    Alert.prototype.setText = function(str){
        this.text.text(str);
    };

    /**
     * Description
     * @method addButton
     * @param {} action
     * @param {} label
     * @return button
     */
    Alert.prototype.addButton = function(action, label){
        var button = new metaScore.editor.Button()
            .setLabel(label)
            .data('action', action)
            .appendTo(this.buttons);

        return button;
    };

    /**
     * Description
     * @method onButtonClick
     * @param {} evt
     * @return
     */
    Alert.prototype.onButtonClick = function(evt){
        var action = new metaScore.Dom(evt.target).data('action');

        this.hide();

        this.triggerEvent(EVT_BUTTONCLICK, {'alert': this, 'action': action}, false);

        evt.stopPropagation();
    };

    return Alert;

})();