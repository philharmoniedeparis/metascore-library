import Overlay from '../../core/ui/Overlay';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Button from '../../core/ui/Button';
import {isEmpty} from '../../core/utils/Var';
import {formatFileSize} from '../../core/utils/Number';
import Field from '../Field';

import {className} from '../../../css/editor/overlay/GuideDetails.scss';

/**
 * An overlay to update a guide's details (title, description, thumbnail, etc)
 *
 * @emits {submit} Fired when the submit button is clicked
 * @param {Object} overlay The overlay instance
 * @param {Object} values The field values
 */
export default class GuideDetails extends Overlay {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     * @property {String} [parent='.metaScore-editor'] The parent element in which the overlay will be appended
     * @property {Boolean} [toolbar=true] Whether to show a toolbar with a title and close button
     * @property {String} [title='Guide Info'] The overlay's title
     * @property {String} [submit_text='Save'] The overlay's submit button label
     * @property {Array} [groups=[]] The groups the user belongs to
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        /**
         * The changed values
         * @type {Object}
         */
        this.changed = {};

        /**
         * The previous values
         * @type {Object}
         */
        this.previous_values = null;

        this.addClass(`guide-details ${className}`);
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
            'title': Locale.t('editor.overlay.GuideDetails.title', 'Guide Info'),
            'thumbnail_upload_extensions': ['png', 'jpeg', 'gif'],
            'thumbnail_upload_max_filesize': 0,
            'media_upload_extensions': ['mp4', 'mp3'],
            'media_upload_max_filesize': 0,
            'groups': [],
            'submit_text': Locale.t('editor.overlay.GuideDetails.submitText', 'Save')
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

        const form = new Dom('<form>')
            .addListener('submit', this.onFormSubmit.bind(this))
            .appendTo(contents);

        // Fields
        this.fields.action = new Field({
                'type': 'hidden'
            })
            .data('name', 'action')
            .appendTo(form);


        this.fields.type = new Field({
                'type': 'select',
                'input': {
                    'options': [
                        {
                            'value': 'audio',
                            'text': Locale.t('editor.overlay.GuideDetails.fields.type.options.audio', 'Audio')
                        },
                        {
                            'value': 'video',
                            'text': Locale.t('editor.overlay.GuideDetails.fields.type.options.video', 'Video')
                        }
                    ],
                    'required': true
                },
                'label': Locale.t('editor.overlay.GuideDetails.fields.type.label', 'Type')
            })
            .data('name', 'type')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        this.fields.title = new Field({
                'type': 'text',
                'input': {
                    'required': true
                },
                'label': Locale.t('editor.overlay.GuideDetails.fields.title.label', 'Title')
            })
            .data('name', 'title')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        this.fields.description = new Field({
                'type': 'textarea',
                'label': Locale.t('editor.overlay.GuideDetails.fields.description.label', 'Description')
            })
            .data('name', 'description')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        this.fields.credits = new Field({
                'type': 'textarea',
                'label': Locale.t('editor.overlay.GuideDetails.fields.credits.label', 'Credits')
            })
            .data('name', 'credits')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        const thumbnail_upload_extensions = `.${this.configs.thumbnail_upload_extensions.join(`, .`)}`;
        this.fields.thumbnail = new Field({
                'type': 'file',
                'input': {
                    'accept': thumbnail_upload_extensions
                },
                'label': Locale.t('editor.overlay.GuideDetails.fields.thumbnail.label', 'Thumbnail'),
                'description': Locale.t('editor.overlay.GuideDetails.fields.thumbnail.description', 'Prefered dimensions: !dimentions pixels<br/>Files must be less than: !size<br/>Supported file types: !types', {'!dimentions': '155x123', '!size': formatFileSize(this.configs.thumbnail_upload_max_filesize), '!types': thumbnail_upload_extensions})
            })
            .data('name', 'thumbnail')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        const media_upload_extensions = `.${this.configs.media_upload_extensions.join(`, .`)}`;
        this.fields.media = new new Field({
                'type': 'fileorurl',
                'input': {
                    'sources': {
                        'upload': {
                            'label': Locale.t('overlay.GuideDetails.fields.media.sources.upload.label', 'Upload'),
                            'accept': media_upload_extensions,
                            'description': Locale.t('editor.overlay.GuideDetails.fields.media.upload.description', 'Files must be less than: !size<br/>Supported file types: !types', {'!size': formatFileSize(this.configs.media_upload_max_filesize),'!types': media_upload_extensions}),
                        },
                        'url': {
                            'label': Locale.t('overlay.GuideDetails.fields.media.sources.url.label', 'URL'),
                            'description': Locale.t('editor.overlay.GuideDetails.fields.media.url.description', 'Supported file types: !types', {'!types': `${media_upload_extensions}, .m3u8 (HLS), .mpd (MPEG-Dash)`}),
                        }
                    },
                    'required': true
                },
                'label': Locale.t('editor.overlay.GuideDetails.fields.media.label', 'Media')
            })
            .data('name', 'media')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        this.fields.css = new Field({
                'type': 'textarea',
                'label': Locale.t('editor.overlay.GuideDetails.fields.css.label', 'CSS')
            })
            .data('name', 'css')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        this.fields.tags = new Field({
                'type': 'text',
                'label': Locale.t('editor.overlay.GuideDetails.fields.tags.label', 'Tags'),
                'description': Locale.t('editor.overlay.GuideDetails.fields.tags.description', 'Comma separated list of tags'),
            })
            .data('name', 'tags')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        if(!isEmpty(this.configs.groups)){
            this.fields.groups = new Field({
                    'type': 'checkboxes',
                    'input': {
                        'multiple': true
                    },
                    'label': Locale.t('editor.overlay.GuideDetails.fields.groups.label', 'Groups'),
                    'description': Locale.t('editor.overlay.GuideDetails.fields.groups.description', 'The checked groups are those in which this guide is shared')
                })
                .data('name', 'groups')
                .addListener('valuechange', this.onFieldValueChange.bind(this))
                .appendTo(form);

            this.configs.groups.forEach((group) => {
                this.fields.groups.addCheckbox(group.id, group.title);
            });
        }

        /**
         * The list of buttons
         * @type {Object}
         */
        this.buttons = {};
        this.buttons.submit = new Button({'label': this.configs.submit_text})
            .addClass('submit')
            .appendTo(form);

        this.buttons.cancel = new Button({'label': Locale.t('editor.overlay.GuideDetails.buttons.cancel.label', 'Cancel')})
            .addClass('cancel')
            .addListener('click', this.onCloseClick.bind(this))
            .appendTo(form);

        /**
         * The information container
         * @type {Dom}
         */
        this.info = new Dom('<div/>', {'class': 'info'})
            .appendTo(form);
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
     * Set the field values
     *
     * @param {Object} values A list of field values in name/value pairs
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    setValues(values, supressEvent){
		Object.entries(values).forEach(([name, value]) => {
            const field = this.getField(name);

            if(field){
                field.getInput().setValue(value, supressEvent);
            }
        });

        this.previous_values = values;

        return this;
    }

    /**
     * Get all changed field values
     *
     * @return {Object} The values of changed fields in name/value pairs
     */
    getValues() {
        return Object.assign({}, this.changed);
    }

    /**
     * Clears all field values
     *
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @return {this}
     */
    clearValues(supressEvent){
		Object.entries(this.fields).forEach(([, field]) => {
            field.getInput().setValue(null, supressEvent);
        });

        return this;
    }

    /**
     * The fields change event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onFieldValueChange(evt){
        const name = evt.detail.field.data('name');
        const value = evt.detail.value;

        this.changed[name] = value;
    }

    /**
     * The form submit event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onFormSubmit(evt){
        this.triggerEvent('submit', {'overlay': this, 'values': this.getValues()}, true, false);

        evt.preventDefault();
        evt.stopPropagation();
    }

    /**
     * The close button click event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onCloseClick(evt){
        this.hide();

        evt.preventDefault();
    }

    /**
     * Hide the overlay
     *
     * @return {this}
     */
    hide(){
        super.hide();

        this.clearValues(true);
        this.changed = {};
        this.previous_values = null;

        return this;

    }

}
