import Dom from '../Dom';

export default class Button extends Dom {

    /**
     * A simple button based on an HTML button element
     *
     * @class Button
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.label=null] A text to add as a label
     */
    constructor(configs) {
        // call the super constructor.
        super('<button/>');

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.disabled = false;

        if(this.configs.label){
            this.setLabel(this.configs.label);
        }

        this.addListener('click', this.onClick.bind(this));
    }

    static getDefaults(){
        return {
            'label': null
        };
    }

    /**
     * The click event handler
     *
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    onClick(evt){
        if(this.disabled){
            evt.stopPropagation();
        }
    }

    /**
     * Set the button's text
     *
     * @method setLabel
     * @param {String} text The text to use as the label
     * @chainable
     */
    setLabel(text){
        if(typeof this.label === "undefined"){
            this.label = new Dom('<span/>', {'class': 'label'})
                .appendTo(this);
        }

        this.label.text(text);

        return this;
    }

    /**
     * Disable the button
     *
     * @method disable
     * @chainable
     */
    disable() {
        this.disabled = true;

        this.addClass('disabled');

        return this;
    }

    /**
     * Enable the button
     *
     * @method enable
     * @chainable
     */
    enable() {
        this.disabled = false;

        this.removeClass('disabled');

        return this;
    }

}
