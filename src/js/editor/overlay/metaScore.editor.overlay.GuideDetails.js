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
    
    'url': null,
    
    'ajax': {},
    
    'data': {}
  };

  metaScore.editor.Overlay.extend(GuideDetails);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  GuideDetails.prototype.setupDOM = function(){
    var contents;

    // call parent method
    GuideDetails.parent.prototype.setupDOM.call(this);

    contents = this.getContents();
    
    this.form = new metaScore.Dom('<form/>')
      .attr('method', 'POST')
      .attr('action', this.configs.url)
      .attr('enctype', 'multipart/form-data')
      .addListener('submit', metaScore.Function.proxy(this.onSubmit, this))
      .appendTo(contents);

    // Fields
    new metaScore.editor.field.Text({
        'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.title', 'Title'),
        'name': 'title',
        'value': 'title' in this.configs.data ? this.configs.data.title : null
      })
      .appendTo(this.form);

    new metaScore.editor.field.Textarea({
        'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.description', 'Description'),
        'name': 'description',
        'value': 'description' in this.configs.data ? this.configs.data.description : null
      })
      .appendTo(this.form);

    new metaScore.editor.field.File({
        'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.thumbnail', 'Thumbnail'),
        'name': 'files[thumbnail]',
        'accept': '.png,.gif,.jpg,.jpeg'
      })
      .appendTo(this.form);

    new metaScore.editor.field.File({
        'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.media', 'Media'),
        'name': 'files[media]',
        'accept': '.mp4,.m4v,.m4a'
      })
      .appendTo(this.form);

    new metaScore.editor.field.Textarea({
        'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.css', 'CSS'),
        'name': 'css',
        'value': 'css' in this.configs.data ? this.configs.data.css : null
      })
      .appendTo(this.form);

    // Buttons
    new metaScore.editor.Button({'label': 'Save'})
      .addClass('save')
      .appendTo(this.form);

    new metaScore.editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
      .appendTo(this.form);

  };

  /**
   * Description
   * @method onApplyClick
   * @param {} evt
   * @return 
   */
  GuideDetails.prototype.onSubmit = function(evt){
     
    var form = evt.target,
      data = new FormData(form),
      options;

    options = metaScore.Object.extend({}, {
      'data': data,
      'success': metaScore.Function.proxy(this.onSaveSuccess, this),
      'error': metaScore.Function.proxy(this.onSaveError, this)
    }, this.configs.ajax);

    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'autoShow': true
    });

    metaScore.Ajax.post(form.action, options);
    
    evt.preventDefault();
  };
  
  /**
  * Description
  * @method onSaveSuccess
  * @param {} evt
  * @return 
  */
  GuideDetails.prototype.onSaveSuccess = function(xhr){
    var data = JSON.parse(xhr.response);
    
    this.loadmask.hide();
    delete this.loadmask;
    
    this.triggerEvent('data', {'overlay': this, 'data': data}, true, false);
    this.hide();
  };
  
  /**
  * Description
  * @method onSaveError
  * @param {} evt
  * @return 
  */
  GuideDetails.prototype.onSaveError = function(xhr){
    this.loadmask.hide();
    delete this.loadmask;

    new metaScore.editor.overlay.Alert({
      'text': metaScore.Locale.t('editor.overlay.GuideDetails.onSaveError.msg', 'The following error occured:<br/><strong><em>@error (@code)</em></strong><br/>Please try again.', {'@error': xhr.statusText, '@code': xhr.status}),
      'buttons': {
        'ok': metaScore.Locale.t('editor.overlay.GuideDetails.onSaveError.ok', 'OK'),
      },
      'autoShow': true
    });
  };
  
  /**
  * Description
  * @method onCloseClick
  * @param {} evt
  * @return 
  */
  GuideDetails.prototype.onCloseClick = function(evt){
    this.hide();
    
    evt.preventDefault();
  };

  GuideDetails.prototype.onCancelClick = GuideDetails.prototype.onCloseClick;

  return GuideDetails;

})();