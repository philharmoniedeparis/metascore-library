import Overlay from '../../core/ui/Overlay';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import {uuid} from '../../core/utils/String';
import Field from '../Field';

import {className} from '../../../css/editor/overlay/Share.less';

/**
 * An overlay to share a guide
 */
export default class Share extends Overlay {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [parent='.metaScore-editor'] The parent element in which the overlay will be appended
     * @property {Boolean} [toolbar=true] Whether to show a toolbar with a title and close button
     * @property {String} [title='Guide Info'] The overlay's title
     * @property {String} [url=''] The player's url
     * @property {String} [api_help_url=''] The player's api help url
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`share ${className}`);

        this.getField('link').setValue(this.configs.url);
        this.getField('embed').setValue(this.getEmbedCode());
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'parent': '.metaScore-editor',
            'toolbar': true,
            'title': Locale.t('editor.overlay.Share.title', 'Share'),
            'url': '',
            'api_help_url': '',
            'embed_defaults': {
                'width': '100%',
                'height': '100%',
                'keyboard': true,
                'api': false,
            }
        });
    }

    /**
     * Setup the overlay's UI
     *
     * @private
     */
    setupUI() {
        // call parent method
        super.setupUI();

        const contents = this.getContents();

        /**
         * The list of fields
         * @type {Object}
         */
        this.fields = {};

        // Link
        this.fields.link = new Field({
                'type': 'text',
                'input': {
                    'readonly': true,
                },
                'label': Locale.t('editor.overlay.Share.fields.link.label', 'Link')
            })
            .data('name', 'link')
            .addListener('click', (evt) => {
                evt.target.focus();
                evt.target.select();
            })
            .appendTo(contents);

        // Embed
        this.fields.embed = new Field({
                'type': 'textarea',
                'input': {
                    'readonly': true
                },
                'label': Locale.t('editor.overlay.Share.fields.embed.label', 'Embed')
            })
            .data('name', 'embed')
            .addListener('click', (evt) => {
                evt.target.focus();
                evt.target.select();
            })
            .appendTo(contents);

        // Embed options
        const options_wrapper = new Dom('<div>', {'class': 'collapsible'})
            .appendTo(contents);

        const options_toggle_id = `toggle-${uuid(5)}`;
        new Dom('<input>', {'type': 'checkbox', 'id': options_toggle_id})
            .data('role', 'collapsible-toggle')
            .appendTo(options_wrapper);

        new Dom('<label>', {'text': Locale.t('editor.overlay.Share.options.label', 'Embed options'), 'for': options_toggle_id})
            .data('role', 'collapsible-label')
            .appendTo(options_wrapper);

        const options = new Dom('<div>', {'class': 'options'})
            .data('role', 'collapsible')
            .appendTo(options_wrapper);

        this.fields.width = new Field({
                'type': 'text',
                'input': {
                    'value': this.configs.embed_defaults.width,
                },
                'label': Locale.t('editor.overlay.Share.fields.width.label', 'Width')
            })
            .data('name', 'width')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(options);

        this.fields.height = new Field({
                'type': 'text',
                'input': {
                    'value': this.configs.embed_defaults.height
                },
                'label': Locale.t('editor.overlay.Share.fields.height.label', 'Height')
            })
            .data('name', 'height')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(options);

        this.fields.keyboard = new Field({
                'type': 'checkbox',
                'input': {
                    'checked': this.configs.embed_defaults.keyboard
                },
                'label': Locale.t('editor.overlay.Share.fields.keyboard.label', 'Disable keyboard shortcuts')
            })
            .data('name', 'keyboard')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(options);

        this.fields.api = new Field({
                'type': 'checkbox',
                'input': {
                    'checked': this.configs.embed_defaults.api
                },
                'label': Locale.t('editor.overlay.Share.fields.api.label', 'Enable controlling the player through the <a href="!url" target="_blank">JavaScript API</a>', {'!url': this.configs.api_help_url}),
            })
            .data('name', 'api')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(options);
    }

    /**
     * Get a field by name
     *
     * @param {String} name The field's name
     * @return {editor.Field} The field object
     */
    getField(name){
        const fields = this.fields;

        if(name){
            return fields[name];
        }

        return fields;
    }

    /**
     * The fields change event handler
     *
     * @private
     */
    onFieldValueChange(){
        this.getField('embed').getInput().setValue(this.getEmbedCode());
    }

    /**
     * Construct and retur the embed code
     *
     * @private
     * @return {String} The embed code
     */
    getEmbedCode() {
        let url = this.configs.url;
        const width = this.getField('width').getInput().getValue();
        const height = this.getField('height').getInput().getValue();
        const keyboard = this.getField('keyboard').getInput().getValue();
        const api = this.getField('api').getInput().getValue();
        const query = [];

        if(keyboard !== this.configs.embed_defaults.keyboard){
            query.push(`keyboard=${keyboard ? '1' : '0'}`);
        }

        if(api !== this.configs.embed_defaults.api){
            query.push(`api=${api ? '1' : '0'}`);
        }

        if(query.length > 0 ){
            url += `?${query.join('&')}`;
        }

        return Locale.formatString('<iframe type="text/html" src="!url" width="!width" height="!height" frameborder="0" allowfullscreen="true" allow="autoplay; fullscreen" class="metascore-embed"></iframe>', {
            '!url': url,
            '!width': width,
            '!height': height
        });
    }

}
