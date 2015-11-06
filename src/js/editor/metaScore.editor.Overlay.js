/**
* Description
* @class editor.Overlay
* @extends Dom
*/

metaScore.namespace('editor').Overlay = (function(){

  /**
   * Fired when the overlay is shown
   *
   * @event show
   * @param {Object} overlay The overlay instance
   */
  var EVT_SHOW = 'show';

  /**
   * Fired when the overlay is hidden
   *
   * @event hide
   * @param {Object} overlay The overlay instance
   */
  var EVT_HIDE = 'hide';

  /**
   * Initialize
   * @constructor
   * @param {} configs
   */
  function Overlay(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Overlay.parent.call(this, '<div/>', {'class': 'overlay clearfix'});
    
    this.setupDOM();

    if(this.configs.autoShow){
      this.show();
    }
  }

  Overlay.defaults = {

    /**
    * The parent element in which the overlay will be appended
    */
    parent: '.metaScore-editor',

    /**
    * True to create a mask underneath that covers its parent and does not allow the user to interact with any other Components until this is dismissed
    */
    modal: true,

    /**
    * True to make this draggable
    */
    draggable: true,

    /**
    * True to show automatically
    */
    autoShow: false,

    /**
    * True to add a toolbar with title and close button
    */
    toolbar: false,

    /**
    * The overlay's title
    */
    title: ''
  };

  metaScore.Dom.extend(Overlay);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Overlay.prototype.setupDOM = function(){

    if(this.configs.modal){
      this.mask = new metaScore.Dom('<div/>', {'class': 'overlay-mask'});
    }

    if(this.configs.toolbar){
      this.toolbar = new metaScore.editor.overlay.Toolbar({'title': this.configs.title})
        .appendTo(this);

      this.toolbar.addButton('close')
        .addListener('click', metaScore.Function.proxy(this.onCloseClick, this));
    }

    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this);

    if(this.configs.draggable){
      this.draggable = new metaScore.Draggable({'target': this, 'handle': this.configs.toolbar ? this.toolbar : this});
    }
  
  };

  /**
   * Description
   * @method show
   * @return ThisExpression
   */
  Overlay.prototype.show = function(){
    if(this.configs.modal){
      this.mask.appendTo(this.configs.parent);
    }

    this.appendTo(this.configs.parent);
    
    this.triggerEvent(EVT_SHOW, {'overlay': this}, true, false);

    return this;
  };

  /**
   * Description
   * @method hide
   * @return ThisExpression
   */
  Overlay.prototype.hide = function(){
    if(this.configs.modal){
      this.mask.remove();
    }

    this.remove();
    
    this.triggerEvent(EVT_HIDE, {'overlay': this}, true, false);

    return this;
  };

  /**
   * Description
   * @method getToolbar
   * @return MemberExpression
   */
  Overlay.prototype.getToolbar = function(){
    return this.toolbar;
  };

  /**
   * Description
   * @method getContents
   * @return MemberExpression
   */
  Overlay.prototype.getContents = function(){
    return this.contents;
  };

  /**
   * Description
   * @method onCloseClick
   * @return 
   */
  Overlay.prototype.onCloseClick = function(){
    this.hide();
  };

  return Overlay;

})();