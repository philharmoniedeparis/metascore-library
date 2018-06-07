import Dom from '../core/Dom';
import {uuid} from '../core/utils/String';

export default class Fieldset extends Dom {

    /**
     * A collapsible fieldset
     *
     * @todo replace with the HTML5 details tag when support reaches IE
     *
     * @class Fieldset
     * @namespace editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.legend_text=null] The text to use for the fieldset's legend
     * @param {Boolean} [configs.collapsible=false] Whether or not the fieldset can be collapsed
     * @param {Boolean} [configs.collapsed=false] Whether or not the fieldset is collapsed by default
     */
    constructor(configs) {
        // call the super constructor.
        super('<fieldset/>');

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.setupUI();

    }

    static getDefaults() {
        return {
            'legend_text': null,
            'collapsible': false,
            'collapsed': false
        };
    }

    /**
     * Setup the fieldset's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        const uid = `fieldset-${uuid(5)}`;

        this.attr('id', uid);

        this.legend = new Dom('<legend/>', {'text': this.configs.legend_text})
            .appendTo(this);

        this.contents = new Dom('<div/>', {'class': 'contents'})
            .appendTo(this);

        if(this.configs.collapsible){
            this.addClass('collapsible');

            if(this.configs.collapsed){
                this.toggle(true);
            }

            this.legend.addListener('click', this.onLegendClick.bind(this));
        }
    }

    /**
     * The legend's click handler
     *
     * @method onLegendClick
     * @private
     */
    onLegendClick(){
        this.toggle();
    }

    /**
     * Toggle the fieldset's collapsed state
     *
     * @method toggle
     * @param {Boolean} [collapse] Whether to collapse or expand the fieldset. The state is toggled if not specified
     * @chainable
     */
    toggle(collapse){
        this.toggleClass('collapsed', collapse);

        return this;
    }

    /**
     * Get the fieldset's contents
     *
     * @method getContents
     * @return {Dom} The contents
     */
    getContents() {
        return this.contents;
    }

}
