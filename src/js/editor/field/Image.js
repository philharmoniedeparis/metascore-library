import Field from '../Field';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import iFrame from '../../core/ui/overlay/iFrame';

import {className} from '../../../css/editor/field/Image.less';

/**
 * An image field wich depends on an external file browser to function
 *
 * @emits {filebrowser} Fired when the external filebrowser should be opened
 * @param {Object} field The field instance
 * @param {Function} callback The callback to invoke once a file is selected throught the external file browser
 * @emits {resize} Fired when the resize button is clicked
 * @param {Object} field The field instance
 * @param {Mixed} value The field value
 */
export default class Image extends Field {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [placeholder="Browse..."] A placeholder text
     * @property {Boolean} [resizeButton=false] Whether to show the resize button
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.addClass(`image ${className}`);
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'placeholder': Locale.t('editor.field.Image.placeholder', 'Browse...')
        });
    }

    /**
     * Setup the field's UI
     *
     * @private
     */
    setupUI() {
        super.setupUI();

        this.input
            .attr('readonly', 'readonly')
            .attr('placeholder', this.configs.placeholder)
            .addListener('click', this.onClick.bind(this));

        const buttons = new Dom('<div/>', {'class': 'buttons'})
            .appendTo(this.input_wrapper);

        if(this.configs.resizeButton){
            /**
             * The resize button
             * @type {Dom}
             */
            this.resize = new Dom('<button/>', {'text': '.', 'data-action': 'resize', 'title': Locale.t('editor.field.Image.resize.tooltip', 'Adapt container size to image')})
                .addListener('click', this.onResizeClick.bind(this))
                .appendTo(buttons);
        }

        new Dom('<button/>', {'text': '.', 'data-action': 'clear', 'title': Locale.t('editor.field.Image.clear.tooltip', 'Clear value')})
            .addListener('click', this.onClearClick.bind(this))
            .appendTo(buttons);
    }

    /**
     * Set the field'S value
     *
     * @param {String} value The image file's url
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValue(value, supressEvent){
        super.setValue(value, supressEvent);

        this.input.attr('title', value);

        return this;
    }

    /**
     * The click event handler
     * If a url is assigned to the event's details object, an iFrame overlay is opened with that URL
     *
     * @private
     */
    onClick(){
        if(this.disabled){
            return;
        }

        const data = {
            'field': this,
            'callback': this.onFileSelect.bind(this)
        };

        this.triggerEvent('filebrowser', data, true, false);

        if('url' in data){
            /**
             * The file browser
             * @type {iFrame}
             */
            this.browser = new iFrame({
                'parent': '.metaScore-editor',
                'title': Locale.t('editor.field.Image.browser.title', 'Select file'),
                'url': data.url,
                'autoShow': true
            });
        }
    }

    /**
     * The resize button click event handler
     *
     * @private
     */
    onResizeClick(){
        this.triggerEvent('resize', {'field': this, 'value': this.value}, true, false);
    }

    /**
     * The clear button click event handler
     *
     * @private
     */
    onClearClick(){
        this.setValue(null);
    }

    /**
     * The file select event handler
     *
     * @private
     * @param {String} url The image file's url
     */
    onFileSelect(url){
        this.setValue(url);

        if(this.browser){
            this.browser.hide();
        }
    }

    /**
     * Toggle the readonly attribute of the field
     *
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @return {this}
     */
    readonly(readonly){
        /**
         * Whether the field is in a readonly state
         * @type {Boolean}
         */
        this.is_readonly = readonly === true;

        this.toggleClass('readonly', this.is_readonly);

        return this;
    }

}
