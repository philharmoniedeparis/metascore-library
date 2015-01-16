/**
 * GuideDetails
 *
 * @requires ../metaScore.editor.Ovelay.js
 * @requires ../../helpers/metaScore.ajax.js
 */
 
metaScore.namespace('editor.overlay').GuideDetails = (function () {
  
  function GuideDetails(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    GuideDetails.parent.call(this, this.configs);
    
    this.addClass('guide-details');
    
    this.setupUI();
  }

  GuideDetails.defaults = {    
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,
    
    /**
    * The overlay's title
    */
    title: metaScore.String.t('Edit')
  };
  
  metaScore.editor.Overlay.extend(GuideDetails);
  
  GuideDetails.prototype.setupUI = function(){
  
    var contents = this.getContents();
    
    this.fields = {};
    this.buttons = {};
    
    this.fields.title = new metaScore.editor.field.Text({
        label: metaScore.String.t('Title')
      })
      .appendTo(contents);
    
    this.fields.description = new metaScore.editor.field.Textarea({
        label: metaScore.String.t('Description')
      })
      .appendTo(contents);
    
    /*this.fields.thumbnail = new metaScore.editor.field.Image({
        label: metaScore.String.t('Thumbnail')
      })
      .appendTo(contents);*/
    
    this.fields.css = new metaScore.editor.field.Textarea({
        label: metaScore.String.t('CSS')
      })
      .appendTo(contents);
    
    // Buttons      
    this.buttons.apply = new metaScore.editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
      .appendTo(contents);
      
    this.buttons.cancel = new metaScore.editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
      .appendTo(contents);
  
  };
  
  GuideDetails.prototype.setValues = function(data){
    this.fields.title.setValue(data.title || null);
    this.fields.description.setValue(data.description || null);
    //this.fields.thumbnail.setValue(data.thumbnail || null);
    this.fields.css.setValue(data.css || null);
  };
  
  GuideDetails.prototype.getValues = function(){
    return {
      'title': this.fields.title.getValue(),
      'description': this.fields.description.getValue(),
      //'thumbnail': this.fields.thumbnail.getValue(),
      'css': this.fields.css.getValue()
    };  
  };
  
  GuideDetails.prototype.onApplyClick = function(evt){    
    this.triggerEvent('submit', {'overlay': this, 'values': this.getValues()}, true, false);    
    this.hide();
  };
  
  GuideDetails.prototype.onCancelClick = GuideDetails.prototype.onCloseClick = function(evt){
    this.setValues(this.previousValues);    
    this.hide();
  };
  
  GuideDetails.prototype.show = function(){
    this.previousValues = this.getValues();
  
    return GuideDetails.parent.prototype.show.call(this);
  };
    
  return GuideDetails;
  
})();