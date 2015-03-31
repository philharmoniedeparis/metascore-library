/**
* Description
* @class GuideInfo
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').GuideInfo = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function GuideInfo(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    GuideInfo.parent.call(this, this.configs);

    this.addClass('guide-details');
  }

  GuideInfo.defaults = {
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,

    /**
    * The overlay's title
    */
    title: metaScore.Locale.t('editor.overlay.GuideInfo.title', 'Guide Info')
  };

  metaScore.editor.Overlay.extend(GuideInfo);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  GuideInfo.prototype.setupDOM = function(){
    var contents;

    // call parent method
    GuideInfo.parent.prototype.setupDOM.call(this);

    contents = this.getContents();

    this.fields = {};
    this.buttons = {};

    this.fields.title = new metaScore.editor.field.Text({
        label: metaScore.Locale.t('editor.overlay.GuideInfo.fields.title', 'Title')
      })
      .appendTo(contents);

    this.fields.description = new metaScore.editor.field.Textarea({
        label: metaScore.Locale.t('editor.overlay.GuideInfo.fields.description', 'Description')
      })
      .appendTo(contents);

    /*this.fields.thumbnail = new metaScore.editor.field.Image({
        label: metaScore.Locale.t('editor.overlay.GuideInfo.fields.thumbnail', 'Thumbnail')
      })
      .appendTo(contents);*/

    this.fields.css = new metaScore.editor.field.Textarea({
        label: metaScore.Locale.t('editor.overlay.GuideInfo.fields.css', 'CSS')
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

  /**
   * Description
   * @method setValues
   * @param {} data
   * @return 
   */
  GuideInfo.prototype.setValues = function(data){
    this.fields.title.setValue(data.title || null);
    this.fields.description.setValue(data.description || null);
    //this.fields.thumbnail.setValue(data.thumbnail || null);
    this.fields.css.setValue(data.css || null);
  };

  /**
   * Description
   * @method getValues
   * @return ObjectExpression
   */
  GuideInfo.prototype.getValues = function(){
    return {
      'title': this.fields.title.getValue(),
      'description': this.fields.description.getValue(),
      //'thumbnail': this.fields.thumbnail.getValue(),
      'css': this.fields.css.getValue()
    };
  };

  /**
   * Description
   * @method onApplyClick
   * @param {} evt
   * @return 
   */
  GuideInfo.prototype.onApplyClick = function(evt){
    this.triggerEvent('submit', {'overlay': this, 'values': this.getValues()}, true, false);
    this.hide();
  };

  GuideInfo.prototype.onCancelClick = 
/**
  * Description
  * @method onCloseClick
  * @param {} evt
  * @return 
  */
 GuideInfo.prototype.onCloseClick = function(evt){
    this.setValues(this.previousValues);
    this.hide();
  };

  /**
   * Description
   * @method show
   * @return CallExpression
   */
  GuideInfo.prototype.show = function(){
    this.previousValues = this.getValues();

    return GuideInfo.parent.prototype.show.call(this);
  };

  return GuideInfo;

})();