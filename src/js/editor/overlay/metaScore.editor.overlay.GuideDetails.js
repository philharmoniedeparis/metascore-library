/**
* Description
* @class GuideDetails
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').GuideDetails = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
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
    /**
    * True to add a toolbar with title and close button
    */
    'toolbar': true,

    /**
    * The overlay's title
    */
    'title': metaScore.Locale.t('editor.overlay.GuideDetails.title', 'Guide Info'),

    /**
    * The overlay's apply button text
    */
    'submit_text': metaScore.Locale.t('editor.overlay.GuideDetails.submit_text', 'Save')
  };

  metaScore.editor.Overlay.extend(GuideDetails);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  GuideDetails.prototype.setupDOM = function(){
    var contents, form;

    // call parent method
    GuideDetails.parent.prototype.setupDOM.call(this);

    contents = this.getContents();
    
    this.fields = {};
    
    form = new metaScore.Dom('<form>')
      .addListener('submit', metaScore.Function.proxy(this.onFormSubmit, this))
      .appendTo(contents);

    // Fields
    this.fields['type'] = new metaScore.editor.field.Select({
        'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.type.label', 'Type'),
        'options': {
          '': '',
          'audio': metaScore.Locale.t('editor.overlay.GuideDetails.fields.type.options.audio', 'Audio'),
          'video': metaScore.Locale.t('editor.overlay.GuideDetails.fields.type.options.video', 'Video')
        },
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
        'description': metaScore.Locale.t('editor.overlay.GuideDetails.fields.thumbnail.description', 'Allowed file types: !types', {'!types': 'png gif jpg jpeg'}),
        'accept': '.png,.gif,.jpg,.jpeg'
      })
      .data('name', 'thumbnail')
      .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
      .appendTo(form);

    this.fields['media'] = new metaScore.editor.field.File({
        'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.media.label', 'Media'),
        'description': metaScore.Locale.t('editor.overlay.GuideDetails.fields.media.description', 'Allowed file types: !types', {'!types': 'mp4 m4v m4a mp3'}),
        'accept': '.mp4,.m4v,.m4a,.mp3'
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

    // Buttons
    new metaScore.editor.Button({'label': this.configs.submit_text})
      .addClass('apply')
      .appendTo(form);

    new metaScore.editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
      .appendTo(form);

  };

  /**
   * Description
   * @method getField
   * @param {} evt
   * @return 
   */
  GuideDetails.prototype.getField = function(name){
    var fields = this.fields;
    
    if(name){
      return fields[name];
    }
    
    return fields;
  };

  /**
   * Description
   * @method setValues
   * @param {} evt
   * @return 
   */
  GuideDetails.prototype.setValues = function(values, supressEvent){  
    metaScore.Object.each(values, function(key, value){
      if(key in this.fields){
        this.fields[key].setValue(value, supressEvent);
      }
    }, this);
    
    this.previous_values = values;
    
    return this;
  };

  /**
   * Description
   * @method clearValues
   * @param {} evt
   * @return 
   */
  GuideDetails.prototype.clearValues = function(supressEvent){
    metaScore.Object.each(this.fields, function(key, field){
      field.setValue(null, supressEvent);
    }, this);
    
    return this;
  };

  /**
   * Description
   * @method getValues
   * @param {} evt
   * @return 
   */
  GuideDetails.prototype.getValues = function(){
    return metaScore.Object.extend({}, this.changed);
  };

  /**
   * Description
   * @method onFieldValueChange
   * @param {} evt
   * @return 
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
   * Description
   * @method onFormSubmit
   * @param {} evt
   * @return 
   */
  GuideDetails.prototype.onFormSubmit = function(evt){  
    this.triggerEvent('submit', {'overlay': this, 'values': this.getValues()}, true, false);
    
    evt.preventDefault();
    evt.stopPropagation();
  };
  
  /**
  * Description
  * @method onCloseClick
  * @param {} evt
  * @return 
  */
  GuideDetails.prototype.onCloseClick = function(evt){    
    if(this.previous_values){
      this.clearValues(true)
        .setValues(this.previous_values, true);
    }
  
    this.hide();
    
    evt.preventDefault();
  };

  GuideDetails.prototype.onCancelClick = GuideDetails.prototype.onCloseClick;

  return GuideDetails;

})();