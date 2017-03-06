/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').GuideDetails = (function () {

    /**
     * Fired when the submit button is clicked
     *
     * @event submit
     * @param {Object} overlay The overlay instance
     * @param {Object} values The field values
     */
    var EVT_SUBMIT = 'submit';

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
    function GuideDetails(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        GuideDetails.parent.call(this, this.configs);

        this.changed = {};
        this.previous_values = null;

        this.addClass('guide-details');
    }

    GuideDetails.defaults = {
        'parent': '.metaScore-editor',
        'toolbar': true,
        'title': metaScore.Locale.t('editor.overlay.GuideDetails.title', 'Guide Info'),
        'groups': {},
        'submit_text': metaScore.Locale.t('editor.overlay.GuideDetails.submitText', 'Save')
    };

    metaScore.Overlay.extend(GuideDetails);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    GuideDetails.prototype.setupUI = function(){
        var contents, form;

        // call parent method
        GuideDetails.parent.prototype.setupUI.call(this);

        contents = this.getContents();

        this.fields = {};

        form = new metaScore.Dom('<form>')
            .addListener('submit', metaScore.Function.proxy(this.onFormSubmit, this))
            .appendTo(contents);

        // Fields
        this.fields['type'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.type.label', 'Type'),
                'options': [
                    {
                        'value': '',
                        'text': ''
                    },
                    {
                        'value': 'audio',
                        'text': metaScore.Locale.t('editor.overlay.GuideDetails.fields.type.options.audio', 'Audio')
                    },
                    {
                        'value': 'video',
                        'text': metaScore.Locale.t('editor.overlay.GuideDetails.fields.type.options.video', 'Video')
                    }
                ],
                'required': true
            })
            .data('name', 'type')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['title'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.title.label', 'Title'),
                'required': true
            })
            .data('name', 'title')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['description'] = new metaScore.editor.field.Textarea({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.description.label', 'Description')
            })
            .data('name', 'description')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['credits'] = new metaScore.editor.field.Textarea({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.credits.label', 'Credits')
            })
            .data('name', 'credits')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['thumbnail'] = new metaScore.editor.field.File({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.thumbnail.label', 'Thumbnail'),
                'description': metaScore.Locale.t('editor.overlay.GuideDetails.fields.thumbnail.description', 'Prefered dimensions: !dimentions pixels<br/>Allowed file types: !types', {'!dimentions': '155x123', '!types': 'png gif jpg jpeg'}),
                'accept': '.png,.gif,.jpg,.jpeg'
            })
            .data('name', 'thumbnail')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['media'] = new metaScore.editor.field.File({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.media.label', 'Media'),
                'description': metaScore.Locale.t('editor.overlay.GuideDetails.fields.media.description', 'Allowed file types: !types', {'!types': 'mp4 m4v m4a mp3'}),
                'accept': '.mp4,.m4v,.m4a,.mp3',
                'required': true
            })
            .data('name', 'media')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['css'] = new metaScore.editor.field.Textarea({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.css.label', 'CSS')
            })
            .data('name', 'css')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['tags'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.tags.label', 'Tags'),
                'description': metaScore.Locale.t('editor.overlay.GuideDetails.fields.tags.description', 'Comma separated list of tags'),
            })
            .data('name', 'tags')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);
        
        if(!metaScore.Var.isEmpty(this.configs.groups)){
            this.fields['groups'] = new metaScore.editor.field.Checkboxes({
                    'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.groups.label', 'Groups'),
                    'description': metaScore.Locale.t('editor.overlay.GuideDetails.fields.groups.description', 'The checked groups are those in which this guide is shared'),
                    'multiple': true
                })
                .data('name', 'groups')
                .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
                .appendTo(form);
                
            metaScore.Array.each(this.configs.groups, function(index, group){
                this.fields['groups'].addCheckbox(group.id, group.title);
            }, this);
        }

        // Buttons
        new metaScore.Button({'label': this.configs.submit_text})
            .addClass('submit')
            .appendTo(form);

        new metaScore.Button({'label': metaScore.Locale.t('editor.overlay.GuideDetails.buttons.cancel.label', 'Cancel')})
            .addClass('cancel')
            .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
            .appendTo(form);

        // Information
        new metaScore.Dom('<div/>', {'class': 'info', 'text': metaScore.Locale.t('editor.overlay.GuideDetails.info', 'The guide needs to be saved in order for applied changes to become permanent')})
            .appendTo(form);
    };

    /**
     * Get a field by name
     * 
     * @method getField
     * @param {String} name The field's name
     * @return {editor.Field} The field object
     */
    GuideDetails.prototype.getField = function(name){
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
    GuideDetails.prototype.setValues = function(values, supressEvent){
        metaScore.Object.each(values, function(name, value){
            var field;
            
            if(name in this.fields){
                field = this.fields[name];
                
                if(name === 'shared_with'){
                    field.clear();
                    
                    if(values['available_groups']){
                        metaScore.Object.each(values['available_groups'], function(gid, group_name){
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
    GuideDetails.prototype.clearValues = function(supressEvent){
        metaScore.Object.each(this.fields, function(name, field){
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
    GuideDetails.prototype.getValues = function(){
        return metaScore.Object.extend({}, this.changed);
    };

    /**
     * The fields change event handler
     * 
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    GuideDetails.prototype.onFieldValueChange = function(evt){
        var field = evt.detail.field,
            value = evt.detail.value,
            name = field.data('name'),
            file;

        if(field instanceof metaScore.editor.field.File){
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
    GuideDetails.prototype.onFormSubmit = function(evt){
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
    GuideDetails.prototype.onCloseClick = function(evt){
        if(this.previous_values){
            this.clearValues(true)
                .setValues(this.previous_values, true);
        }

        this.hide();

        evt.preventDefault();
    };

    /**
     * The cancel button click event handler
     * 
     * @method onCancelClick
     * @private
     * @param {Event} evt The event object
     */
    GuideDetails.prototype.onCancelClick = GuideDetails.prototype.onCloseClick;

    return GuideDetails;

})();