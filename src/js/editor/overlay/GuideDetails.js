import Overlay from '../../core/ui/Overlay';
import Dom from '../../core/Dom';
import Locale from '../../core/Locale';
import Button from '../../core/ui/Button';
import {isEmpty} from '../../core/utils/Var';
import {formatFileSize} from '../../core/utils/Number';
import HiddenField from '../field/Hidden';
import SelectField from '../field/Select';
import TextField from '../field/Text';
import TextareaField from '../field/Textarea';
import FileField from '../field/File';
import CheckboxesField from '../field/Checkboxes';

/**
 * Fired when the submit button is clicked
 *
 * @event submit
 * @param {Object} overlay The overlay instance
 * @param {Object} values The field values
 */
const EVT_SUBMIT = 'submit';

export default class GuideDetails extends Overlay {

    /**
     * An overlay to update a guide's details (title, description, thumbnail, etc)
     *
     * @class GuideDetails
     * @namespace editor.overlay
     * @extends Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.parent='.metaScore-editor'] The parent element in which the overlay will be appended
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.title='Guide Info'] The overlay's title
     * @param {Object} [configs.groups={}] The groups the user belongs to
     * @param {String} [configs.submit_text='Save'] The overlay's submit button label
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.changed = {};
        this.previous_values = null;

        this.addClass('guide-details');
    }

    static getDefaults(){
        return Object.assign({}, super.getDefaults(), {
            'parent': '.metaScore-editor',
            'toolbar': true,
            'title': Locale.t('editor.overlay.GuideDetails.title', 'Guide Info'),
            'thumbnail_upload_extensions': ['png', 'jpeg', 'gif'],
            'thumbnail_upload_max_filesize': 0,
            'media_upload_extensions': ['mp4', 'mp3'],
            'media_upload_max_filesize': 0,
            'groups': {},
            'submit_text': Locale.t('editor.overlay.GuideDetails.submitText', 'Save')
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

        const form = new Dom('<form>')
            .addListener('submit', this.onFormSubmit.bind(this))
            .appendTo(contents);

        // Fields
        this.fields.action = new HiddenField()
            .data('name', 'action')
            .appendTo(form);


        this.fields.type = new SelectField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.type.label', 'Type'),
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
            })
            .data('name', 'type')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        this.fields.title = new TextField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.title.label', 'Title'),
                'required': true
            })
            .data('name', 'title')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        this.fields.description = new TextareaField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.description.label', 'Description')
            })
            .data('name', 'description')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        this.fields.credits = new TextareaField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.credits.label', 'Credits')
            })
            .data('name', 'credits')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        const thumbnail_upload_extensions = `.${this.configs.thumbnail_upload_extensions.join(`, .`)}`;
        this.fields.thumbnail = new FileField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.thumbnail.label', 'Thumbnail'),
                'sources': {
                    'upload': {
                        'description': Locale.t('editor.overlay.GuideDetails.fields.thumbnail.description', 'Prefered dimensions: !dimentions pixels<br/>Files must be less than: !size<br/>Supported file types: !types', {'!dimentions': '155x123', '!size': formatFileSize(this.configs.thumbnail_upload_max_filesize), '!types': thumbnail_upload_extensions}),
                        'accept': thumbnail_upload_extensions
                    }
                }
            })
            .data('name', 'thumbnail')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        const media_upload_extensions = `.${this.configs.media_upload_extensions.join(`, .`)}`;
        this.fields.media = new FileField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.media.label', 'Media'),
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
            })
            .data('name', 'media')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        this.fields.css = new TextareaField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.css.label', 'CSS')
            })
            .data('name', 'css')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        this.fields.tags = new TextField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.tags.label', 'Tags'),
                'description': Locale.t('editor.overlay.GuideDetails.fields.tags.description', 'Comma separated list of tags'),
            })
            .data('name', 'tags')
            .addListener('valuechange', this.onFieldValueChange.bind(this))
            .appendTo(form);

        if(!isEmpty(this.configs.groups)){
            this.fields.groups = new CheckboxesField({
                    'label': Locale.t('editor.overlay.GuideDetails.fields.groups.label', 'Groups'),
                    'description': Locale.t('editor.overlay.GuideDetails.fields.groups.description', 'The checked groups are those in which this guide is shared'),
                    'multiple': true
                })
                .data('name', 'groups')
                .addListener('valuechange', this.onFieldValueChange.bind(this))
                .appendTo(form);

            this.configs.groups.forEach((group) => {
                this.fields.groups.addCheckbox(group.id, group.title);
            });
        }

        // Buttons
        this.buttons = {};
        this.buttons.submit = new Button({'label': this.configs.submit_text})
            .addClass('submit')
            .appendTo(form);

        this.buttons.cancel = new Button({'label': Locale.t('editor.overlay.GuideDetails.buttons.cancel.label', 'Cancel')})
            .addClass('cancel')
            .addListener('click', this.onCloseClick.bind(this))
            .appendTo(form);

        // Information
        this.info = new Dom('<div/>', {'class': 'info'})
            .appendTo(form);
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
     * Set the field values
     *
     * @method setValues
     * @param {Object} values A list of field values in name/value pairs
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    setValues(values, supressEvent){
		Object.entries(values).forEach(([name, value]) => {
            const field = this.getField(name);

            if(field){
                if(name === 'shared_with'){
                    field.clear();

                    if(values.available_groups){
                        Object.entries(values.available_groups).forEach(([gid, group_name]) => {
                            field.addOption(gid, group_name);
                        });
                    }
                }

                field.setValue(value, supressEvent);
            }
        });

        this.previous_values = values;

        return this;
    }

    /**
     * Clears all field values
     *
     * @method clearValues
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    clearValues(supressEvent){
		Object.entries(this.fields).forEach(([, field]) => {
            field.setValue(null, supressEvent);
        });

        return this;
    }

    /**
     * Get all changed field values
     *
     * @method getValues
     * @return {Object} The values of changed fields in name/value pairs
     */
    getValues() {
        return Object.assign({}, this.changed);
    }

    /**
     * The fields change event handler
     *
     * @method onFieldValueChange
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
     * @method onFormSubmit
     * @private
     * @param {Event} evt The event object
     */
    onFormSubmit(evt){
        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'values': this.getValues()}, true, false);

        evt.preventDefault();
        evt.stopPropagation();
    }

    /**
     * The close button click event handler
     *
     * @method onCloseClick
     * @private
     * @param {Event} evt The event object
     */
    onCloseClick(evt){
        if(this.previous_values){
            this.clearValues(true)
                .setValues(this.previous_values, true);
        }

        this.hide();

        evt.preventDefault();
    }

}
