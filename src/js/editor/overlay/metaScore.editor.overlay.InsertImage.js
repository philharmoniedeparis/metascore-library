/**
* Description
* @class InsertImage
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').InsertImage = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function InsertImage(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    InsertImage.parent.call(this, this.configs);

    this.addClass('insert-image');

    if(this.configs.image){
      this.setValuesFromImage(this.configs.image);
    }
  }

  InsertImage.defaults = {
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,

    /**
    * The overlay's title
    */
    title: metaScore.Locale.t('editor.overlay.InsertImage.title', 'Insert Image'),

    /**
    * The current image
    */
    image: null
  };

  metaScore.editor.Overlay.extend(InsertImage);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  InsertImage.prototype.setupDOM = function(){
    var contents;

    // call parent method
    InsertImage.parent.prototype.setupDOM.call(this);

    contents = this.getContents();

    this.fields = {};
    this.buttons = {};

    // URL
    this.fields.image = new metaScore.editor.field.Image({
        label: metaScore.Locale.t('editor.overlay.InsertImage.fields.image', 'Image')
      })
      .addListener('valuechange', metaScore.Function.proxy(this.onURLChange, this))
      .appendTo(contents);
      
    // Width
    this.fields.width = new metaScore.editor.field.Number({
        label: metaScore.Locale.t('editor.overlay.InsertImage.fields.width', 'Width'),
        min: 0
      })
      .appendTo(contents);
      
    // Height
    this.fields.height = new metaScore.editor.field.Number({
        label: metaScore.Locale.t('editor.overlay.InsertImage.fields.height', 'Height'),
        min: 0
      })
      .appendTo(contents);
      
    // Alignment
    this.fields.alignment = new metaScore.editor.field.Select({
        label: metaScore.Locale.t('editor.overlay.InsertImage.fields.alignment', 'Alignment'),
        options: {
          '': metaScore.Locale.t('editor.overlay.InsertImage.fields.alignment.unset', '&lt;not set&gt;'),
          'left': metaScore.Locale.t('editor.overlay.InsertImage.fields.alignment.left', 'Left'),
          'right': metaScore.Locale.t('editor.overlay.InsertImage.fields.alignment.right', 'Right')
        }
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
   * @method setValuesFromLink
   * @param {} link
   * @return 
   */
  InsertImage.prototype.setValuesFromImage = function(image){
    this.fields.image.setValue(image.url);
  };

  /**
   * Description
   * @method onURLChange
   * @param {} evt
   * @return 
   */
  InsertImage.prototype.onURLChange = function(evt){
    var url = evt.detail.value;
    
    if(url){
      new metaScore.Dom('<img/>')
        .addListener('load', metaScore.Function.proxy(function(evt){
          var img = evt.target;
          
          this.fields.width.setValue(img.width);
          this.fields.height.setValue(img.height);
        }, this))
        .attr('src', url);
    }
  };

  /**
   * Description
   * @method onApplyClick
   * @param {} evt
   * @return 
   */
  InsertImage.prototype.onApplyClick = function(evt){
    var url, width, height, alignment;
    
    url = this.fields.image.getValue();
    width = this.fields.width.getValue();
    height = this.fields.height.getValue();
    alignment = this.fields.alignment.getValue();

    this.triggerEvent('submit', {'overlay': this, 'url': url, 'width': width, 'height': height, 'alignment': alignment}, true, false);

    this.hide();
  };

  /**
   * Description
   * @method onCancelClick
   * @param {} evt
   * @return 
   */
  InsertImage.prototype.onCancelClick = function(evt){
    this.hide();
  };

  return InsertImage;

})();