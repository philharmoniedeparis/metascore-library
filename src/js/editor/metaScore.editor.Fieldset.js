/**
 * @module Editor
 */

metaScore.namespace('editor').Fieldset = (function () {

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
    function Fieldset(configs) {
        this.configs = this.getConfigs(configs);

        // call the super constructor.
        metaScore.Dom.call(this, '<fieldset/>');

        this.setupUI();
        
    }

    Fieldset.defaults = {
        'legend_text': null,
        'collapsible': false,
        'collapsed': false
    };

    metaScore.Dom.extend(Fieldset);

    /**
     * Setup the fieldset's UI
     *
     * @method setupUI
     * @private
     */
    Fieldset.prototype.setupUI = function(){
        var uid = 'fieldset-'+ metaScore.String.uuid(5);
        
        this.attr('id', uid);

        this.legend = new metaScore.Dom('<legend/>', {'text': this.configs.legend_text})
            .appendTo(this);

        this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
            .appendTo(this);
            
        if(this.configs.collapsible){
            this.addClass('collapsible');
            
            if(this.configs.collapsed){
                this.toggle(true);
            }
            
            this.legend.addListener('click', this.onLegendClick.bind(this));
        }
    };

    /**
     * The legend's click handler
     *
     * @method onLegendClick
     * @private
     * @param {Event} evt The event object
     */
    Fieldset.prototype.onLegendClick = function(evt){
        this.toggle();
    };

    /**
     * Toggle the fieldset's collapsed state
     *
     * @method toggle
     * @param {Boolean} [collapse] Whether to collapse or expand the fieldset. The state is toggled if not specified
     * @chainable
     */
    Fieldset.prototype.toggle = function(collapse){
        this.toggleClass('collapsed', collapse);
        
        return this;
    };

    /**
     * Get the fieldset's contents
     *
     * @method getContents
     * @return {Dom} The contents
     */
    Fieldset.prototype.getContents = function(){        
        return this.contents;
    };

    return Fieldset;

})();