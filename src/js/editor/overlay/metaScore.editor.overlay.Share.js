/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').Share = (function () {

    /**
     * An overlay to share a guide
     *
     * @class Share
     * @namespace editor.overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.parent='.metaScore-editor'] The parent element in which the overlay will be appended
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.title='Guide Info'] The overlay's title
     * @param {Object} [configs.url=''] The player's url
     */
    function Share(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Share.parent.call(this, this.configs);

        this.addClass('share');
        
        this.getField('link').setValue(this.configs.url);
        this.getField('embed').setValue(this.getEmbedCode());
    }

    Share.defaults = {
        'parent': '.metaScore-editor',
        'toolbar': true,
        'title': metaScore.Locale.t('editor.overlay.Share.title', 'Share'),
        'url': ''
    };

    metaScore.Overlay.extend(Share);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    Share.prototype.setupUI = function(){
        var contents,
            options_wrapper, options_toggle_id, options;

        // call parent method
        Share.parent.prototype.setupUI.call(this);

        contents = this.getContents();

        this.fields = {};

        // Link
        this.fields['link'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.Share.fields.link.label', 'Link'),
                'readonly': true
            })
            .data('name', 'link')
            .addListener('click', function(evt){
                evt.target.focus();
                evt.target.select();
            })
            .appendTo(contents);

        // Embed
        this.fields['embed'] = new metaScore.editor.field.Textarea({
                'label': metaScore.Locale.t('editor.overlay.Share.fields.embed.label', 'Embed'),
                'readonly': true
            })
            .data('name', 'embed')
            .addListener('click', function(evt){
                evt.target.focus();
                evt.target.select();
            })
            .appendTo(contents);
            
        // Embed options
        options_wrapper = new metaScore.Dom('<div>', {'class': 'collapsible'})
            .appendTo(contents);
        
        options_toggle_id = 'toggle-'+ metaScore.String.uuid(5);
        new metaScore.Dom('<input>', {'type': 'checkbox', 'id': options_toggle_id})
            .data('role', 'collapsible-toggle')
            .appendTo(options_wrapper);
        
        new metaScore.Dom('<label>', {'text': metaScore.Locale.t('editor.overlay.Share.options.label', 'Embed options'), 'for': options_toggle_id})
            .data('role', 'collapsible-label')
            .appendTo(options_wrapper);
            
        options = new metaScore.Dom('<div>', {'class': 'options'})
            .data('role', 'collapsible')
            .appendTo(options_wrapper);

        this.fields['width'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.Share.fields.width.label', 'Width'),
                'value': '100%'
            })
            .data('name', 'width')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(options);
            
        this.fields['height'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.Share.fields.height.label', 'Height'),
                'value': '100%'
            })
            .data('name', 'height')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(options);

        this.fields['keyboard'] = new metaScore.editor.field.Boolean({
                'label': metaScore.Locale.t('editor.overlay.Share.fields.keyboard.label', 'Enable keyboard shortcuts')
            })
            .data('name', 'keyboard')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(options);

        this.fields['api'] = new metaScore.editor.field.Boolean({
                'label': metaScore.Locale.t('editor.overlay.Share.fields.api.label', 'Enable controlling the player through the JavaScript API')
            })
            .data('name', 'api')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(options);
    };

    /**
     * Get a field by name
     * 
     * @method getField
     * @param {String} name The field's name
     * @return {editor.Field} The field object
     */
    Share.prototype.getField = function(name){
        var fields = this.fields;

        if(name){
            return fields[name];
        }

        return fields;
    };

    /**
     * The fields change event handler
     * 
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    Share.prototype.onFieldValueChange = function(evt){
        this.getField('embed').setValue(this.getEmbedCode());
    };

    /**
     * Construct and retur the embed code
     * 
     * @method getEmbedCode
     * @private
     * @return {String} The embed code
     */
    Share.prototype.getEmbedCode = function(){
        var width = this.getField('width').getValue(),
            height = this.getField('height').getValue(),
            keyboard = this.getField('keyboard').getValue(),
            api = this.getField('api').getValue(),
            url = this.configs.url,
            query = [];
        
        if(keyboard){
            query.push('keyboard=1');
        }
        
        if(api){
            query.push('api=1');
        }
        
        if(query.length > 0 ){
            url += '?' + query.join('&');
        }
            
        return metaScore.Locale.formatString('<iframe type="text/html" src="!url" width="!width" height="!height" frameborder="0" allowfullscreen="true" class="metascore-embed"></iframe>', {
            '!url': url,
            '!width': width,
            '!height': height
        });
    };

    return Share;

})();