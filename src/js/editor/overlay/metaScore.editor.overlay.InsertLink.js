/**
* Description
* @class InsertLink
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').InsertLink = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function InsertLink(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    InsertLink.parent.call(this, this.configs);

    this.addClass('insert-link');

    this.toggleFields();

    if(this.configs.link){
      this.setValuesFromLink(this.configs.link);
    }
  }

  InsertLink.defaults = {
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,

    /**
    * The overlay's title
    */
    title: metaScore.Locale.t('editor.overlay.InsertLink.title', 'Insert Link'),

    /**
    * The current link
    */
    link: null
  };

  metaScore.editor.Overlay.extend(InsertLink);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  InsertLink.prototype.setupDOM = function(){
    var contents;

    // call parent method
    InsertLink.parent.prototype.setupDOM.call(this);

    contents = this.getContents();

    this.fields = {};
    this.buttons = {};

    this.fields.type = new metaScore.editor.field.Select({
        label: metaScore.Locale.t('editor.overlay.InsertLink.fields.type', 'Type'),
        options: {
          url: metaScore.Locale.t('editor.overlay.InsertLink.fields.type.url', 'URL'),
          page: metaScore.Locale.t('editor.overlay.InsertLink.fields.type.page', 'Page'),
          time: metaScore.Locale.t('editor.overlay.InsertLink.fields.type.time', 'Time'),
        }
      })
      .addListener('valuechange', metaScore.Function.proxy(this.onTypeChange, this))
      .appendTo(contents);

    // URL
    this.fields.url = new metaScore.editor.field.Text({
        label: metaScore.Locale.t('editor.overlay.InsertLink.fields.url', 'URL')
      })
      .appendTo(contents);

    // Page
    this.fields.page = new metaScore.editor.field.Number({
        label: metaScore.Locale.t('editor.overlay.InsertLink.fields.page', 'Page')
      })
      .appendTo(contents);

    // Time
    this.fields.inTime = new metaScore.editor.field.Time({
        label: metaScore.Locale.t('editor.overlay.InsertLink.fields.in-time', 'Start time'),
        inButton: true
      })
      .appendTo(contents);

    this.fields.outTime = new metaScore.editor.field.Time({
        label: metaScore.Locale.t('editor.overlay.InsertLink.fields.out-time', 'End time'),
        inButton: true
      })
      .appendTo(contents);

    this.fields.rIndex = new metaScore.editor.field.Number({
        label: metaScore.Locale.t('editor.overlay.InsertLink.fields.r-index', 'Reading index')
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
  InsertLink.prototype.setValuesFromLink = function(link){
    var matches;

    if(matches = link.hash.match(/^#p=(\d+)/)){
      this.fields.type.setValue('page');
      this.fields.page.setValue(matches[1]);
    }
    else if(matches = link.hash.match(/^#t=(\d+),(\d+)&r=(\d+)/)){
      this.fields.type.setValue('time');
      this.fields.inTime.setValue(matches[1]);
      this.fields.outTime.setValue(matches[2]);
      this.fields.rIndex.setValue(matches[3]);
    }
    else{
      this.fields.type.setValue('url');
      this.fields.url.setValue(link.href);
    }
  };

  /**
   * Description
   * @method toggleFields
   * @return 
   */
  InsertLink.prototype.toggleFields = function(){
    var type = this.fields.type.getValue();

    switch(type){
      case 'page':
        this.fields.url.hide();
        this.fields.page.show();
        this.fields.inTime.hide();
        this.fields.outTime.hide();
        this.fields.rIndex.hide();
        break;

      case 'time':
        this.fields.url.hide();
        this.fields.page.hide();
        this.fields.inTime.show();
        this.fields.outTime.show();
        this.fields.rIndex.show();
        break;

      default:
        this.fields.url.show();
        this.fields.page.hide();
        this.fields.inTime.hide();
        this.fields.outTime.hide();
        this.fields.rIndex.hide();
    }

  };

  /**
   * Description
   * @method onTypeChange
   * @param {} evt
   * @return 
   */
  InsertLink.prototype.onTypeChange = function(evt){
    this.toggleFields();
  };

  /**
   * Description
   * @method onApplyClick
   * @param {} evt
   * @return 
   */
  InsertLink.prototype.onApplyClick = function(evt){
    var type = this.fields.type.getValue(),
      url;

    switch(type){
      case 'page':
        url = '#p='+ this.fields.page.getValue();
        break;

      case 'time':
        url = '#t='+ this.fields.inTime.getValue() +','+ this.fields.outTime.getValue();
        url += '&r='+ this.fields.rIndex.getValue();
        break;

      default:
        url = this.fields.url.getValue();
    }

    this.triggerEvent('submit', {'overlay': this, 'url': url}, true, false);

    this.hide();
  };

  /**
   * Description
   * @method onCancelClick
   * @param {} evt
   * @return 
   */
  InsertLink.prototype.onCancelClick = function(evt){
    this.hide();
  };

  return InsertLink;

})();