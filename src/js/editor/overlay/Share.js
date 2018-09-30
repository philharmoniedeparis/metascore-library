import Overlay from '../../core/ui/Overlay';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import {uuid} from '../../core/utils/String';
import CheckboxField from '../field/Checkbox';
import TextField from '../field/Text';
import TextareaField from '../field/Textarea';

import '../../../css/editor/overlay/Share.less';

export default class Share extends Overlay {

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
     * @param {String} [configs.url=''] The player's url
     * @param {String} [configs.api_help_url=''] The player's api help url
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass('share');

        this.getField('link').setValue(this.configs.url);
        this.getField('embed').setValue(this.getEmbedCode());
    }

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
     * @method setupUI
     * @private
     */
    setupUI() {
        // call parent method
        super.setupUI();

        const contents = this.getContents();

        this.fields = {};

        // Link
        this.fields.link = new TextField({
                'label': Locale.t('editor.overlay.Share.fields.link.label', 'Link'),
                'readonly': true
            })
            .data('name', 'link')
            .addListener('click', (evt) => {
                evt.target.focus();
                evt.target.select();
            })
            .appendTo(contents);

        // Embed
        this.fields.embed = new TextareaField({
                'label': Locale.t('editor.overlay.Share.fields.embed.label', 'Embed'),
                'readonly': true
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

        this.fields.width = new TextField({
                'label': Locale.t('editor.overlay.Share.fields.width.label', 'Width'),
                'value': this.configs.embed_defaults.width
            })
            .data('name', 'width')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(options);

        this.fields.height = new TextField({
                'label': Locale.t('editor.overlay.Share.fields.height.label', 'Height'),
                'value': this.configs.embed_defaults.height
            })
            .data('name', 'height')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(options);

        this.fields.keyboard = new CheckboxField({
                'label': Locale.t('editor.overlay.Share.fields.keyboard.label', 'Disable keyboard shortcuts'),
                'checked': this.configs.embed_defaults.keyboard
            })
            .data('name', 'keyboard')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(options);

        this.fields.api = new CheckboxField({
                'label': Locale.t('editor.overlay.Share.fields.api.label', 'Enable controlling the player through the <a href="!url" target="_blank">JavaScript API</a>', {'!url': this.configs.api_help_url}),
                'checked': this.configs.embed_defaults.api
            })
            .data('name', 'api')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(options);
    }

    /**
     * Get a field by name
     *
     * @method getField
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
     * @method onFieldValueChange
     * @private
     */
    onFieldValueChange(){
        this.getField('embed').setValue(this.getEmbedCode());
    }

    /**
     * Construct and retur the embed code
     *
     * @method getEmbedCode
     * @private
     * @return {String} The embed code
     */
    getEmbedCode() {
        let url = this.configs.url;
        const width = this.getField('width').getValue();
        const height = this.getField('height').getValue();
        const keyboard = this.getField('keyboard').getValue();
        const api = this.getField('api').getValue();
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

        return Locale.formatString('<iframe type="text/html" src="!url" width="!width" height="!height" frameborder="0" allowfullscreen="true" class="metascore-embed"></iframe>', {
            '!url': url,
            '!width': width,
            '!height': height
        });
    }

}
