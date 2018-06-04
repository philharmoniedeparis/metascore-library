import {Overlay} from '../../core/ui/Overlay';
import {Dom} from '../../core/Dom';
import {Locale} from '../../core/Locale';
import {Button} from '../../core/utils/ui/Button';
import {_Function} from '../core/utils/Function';
import {_Var} from '../core/utils/Var';
import {_Object} from '../core/utils/Object';
import {_Array} from '../core/utils/Array';
import {SelectField} from '../field/Select';
import {TextField} from '../field/Text';
import {TextareaField} from '../field/Textarea';
import {FileField} from '../field/File';
import {CheckboxesField} from '../field/Checkboxes';

/**
 * Fired when the submit button is clicked
 *
 * @event submit
 * @param {Object} overlay The overlay instance
 * @param {Object} values The field values
 */
var EVT_SUBMIT = 'submit';

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
        this.configs = this.getConfigs(configs);

        // call parent constructor
        super(this.configs);

        this.changed = {};
        this.previous_values = null;

        this.addClass('guide-details');
    }

    GuideDetails.defaults = {
        'parent': '.metaScore-editor',
        'toolbar': true,
        'title': Locale.t('editor.overlay.GuideDetails.title', 'Guide Info'),
        'groups': {},
        'submit_text': Locale.t('editor.overlay.GuideDetails.submitText', 'Save')
    };

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    setupUI() {
        var contents, form;

        // call parent method
        super.setupUI();

        contents = this.getContents();

        this.fields = {};

        form = new Dom('<form>')
            .addListener('submit', _Function.proxy(this.onFormSubmit, this))
            .appendTo(contents);

        // Fields
        this.fields['type'] = new SelectField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.type.label', 'Type'),
                'options': [
                    {
                        'value': '',
                        'text': ''
                    },
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
            .addListener('valuechange', _Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['title'] = new TextField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.title.label', 'Title'),
                'required': true
            })
            .data('name', 'title')
            .addListener('valuechange', _Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['description'] = new TextareaField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.description.label', 'Description')
            })
            .data('name', 'description')
            .addListener('valuechange', _Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['credits'] = new TextareaField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.credits.label', 'Credits')
            })
            .data('name', 'credits')
            .addListener('valuechange', _Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['thumbnail'] = new FileField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.thumbnail.label', 'Thumbnail'),
                'description': Locale.t('editor.overlay.GuideDetails.fields.thumbnail.description', 'Prefered dimensions: !dimentions pixels<br/>Allowed file types: !types', {'!dimentions': '155x123', '!types': 'png gif jpg jpeg'}),
                'accept': '.png,.gif,.jpg,.jpeg'
            })
            .data('name', 'thumbnail')
            .addListener('valuechange', _Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['media'] = new FileField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.media.label', 'Media'),
                'description': Locale.t('editor.overlay.GuideDetails.fields.media.description', 'Allowed file types: !types', {'!types': 'mp4 m4v m4a mp3'}),
                'accept': '.mp4,.m4v,.m4a,.mp3',
                'required': true
            })
            .data('name', 'media')
            .addListener('valuechange', _Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['css'] = new TextareaField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.css.label', 'CSS')
            })
            .data('name', 'css')
            .addListener('valuechange', _Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['tags'] = new TextField({
                'label': Locale.t('editor.overlay.GuideDetails.fields.tags.label', 'Tags'),
                'description': Locale.t('editor.overlay.GuideDetails.fields.tags.description', 'Comma separated list of tags'),
            })
            .data('name', 'tags')
            .addListener('valuechange', _Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);
        
        if(!_Var.isEmpty(this.configs.groups)){
            this.fields['groups'] = new CheckboxesField({
                    'label': Locale.t('editor.overlay.GuideDetails.fields.groups.label', 'Groups'),
                    'description': Locale.t('editor.overlay.GuideDetails.fields.groups.description', 'The checked groups are those in which this guide is shared'),
                    'multiple': true
                })
                .data('name', 'groups')
                .addListener('valuechange', _Function.proxy(this.onFieldValueChange, this))
                .appendTo(form);
                
            _Array.each(this.configs.groups, function(index, group){
                this.fields['groups'].addCheckbox(group.id, group.title);
            }, this);
        }

        // Buttons
        new Button({'label': this.configs.submit_text})
            .addClass('submit')
            .appendTo(form);

        new Button({'label': Locale.t('editor.overlay.GuideDetails.buttons.cancel.label', 'Cancel')})
            .addClass('cancel')
            .addListener('click', _Function.proxy(this.onCloseClick, this))
            .appendTo(form);

        // Information
        new Dom('<div/>', {'class': 'info', 'text': Locale.t('editor.overlay.GuideDetails.info', 'The guide needs to be saved in order for applied changes to become permanent')})
            .appendTo(form);
    };

    /**
     * Get a field by name
     * 
     * @method getField
     * @param {String} name The field's name
     * @return {editor.Field} The field object
     */
    getField(name){
        var fields = this.fields;

        if(name){
            return fields[name];
        }

        return fields;
    };

    /**
     * Set the field values
     * 
     * @method setValues
     * @param {Object} values A list of field values in name/value pairs
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    setValues(values, supressEvent){
        _Object.each(values, function(name, value){
            var field;
            
            if(name in this.fields){
                field = this.fields[name];
                
                if(name === 'shared_with'){
                    field.clear();
                    
                    if(values['available_groups']){
                        _Object.each(values['available_groups'], function(gid, group_name){
                            field.addOption(gid, group_name);
                        });
                    }
                }
                
                field.setValue(value, supressEvent);
            }
        }, this);

        this.previous_values = values;

        return this;
    };

    /**
     * Clears all field values
     * 
     * @method clearValues
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    clearValues(supressEvent){
        _Object.each(this.fields, function(name, field){
            field.setValue(null, supressEvent);
        }, this);

        return this;
    };

    /**
     * Get all changed field values
     * 
     * @method getValues
     * @return {Object} The values of changed fields in name/value pairs
     */
    getValues() {
        return _Object.extend({}, this.changed);
    };

    /**
     * The fields change event handler
     * 
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    onFieldValueChange(evt){
        var field = evt.detail.field,
            value = evt.detail.value,
            name = field.data('name'),
            file;

        if(field instanceof FileField){
            if(file = field.getFile(0)){
                this.changed[name] = {
                    'name': file.name,
                    'url': URL.createObjectURL(file),
                    'mime': file.type,
                    'object': file
                };
            }
            else{
                delete this.changed[name];
            }
        }
        else{
            this.changed[name] = value;
        }
    };

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
    };

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
    };

}