/**
* Description
* @class GuideSelector
* @namespace metaScore.editor.overlay
* @extends metaScore.editor.Overlay
*/

metaScore.namespace('editor.overlay').GuideSelector = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function GuideSelector(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    GuideSelector.parent.call(this, this.configs);

    this.addClass('guide-selector');
  }

  GuideSelector.defaults = {
    /**
    * True to add a toolbar with title and close button
    */
    toolbar: true,

    /**
    * The overlay's title
    */
    title: metaScore.Locale.t('editor.overlay.GuideSelector.title', 'Select a guide'),

    /**
    * The text to display when no guides are available
    */
    emptyText: metaScore.Locale.t('editor.overlay.GuideSelector.emptyText', 'No guides available'),

    /**
    * The url from which to retreive the list of guides
    */
    url: null
  };

  metaScore.editor.Overlay.extend(GuideSelector);

  /**
   * Description
   * @method show
   * @return 
   */
  GuideSelector.prototype.show = function(){
    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'autoShow': true
    });

    metaScore.Ajax.get(this.configs.url, {
      'success': metaScore.Function.proxy(this.onLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onLoadError, this)
    });
  };

  /**
   * Description
   * @method onLoadSuccess
   * @param {} xhr
   * @return 
   */
  GuideSelector.prototype.onLoadSuccess = function(xhr){
    var contents = this.getContents(),
      data = JSON.parse(xhr.response),
      table, row;

    table = new metaScore.Dom('<table/>', {'class': 'guides'})
      .appendTo(contents);

    if(metaScore.Var.isEmpty(data)){
      contents.text(this.configs.emptyText);
    }
    else{
      metaScore.Object.each(data, function(key, guide){
        row = new metaScore.Dom('<tr/>', {'class': 'guide guide-'+ guide.id})
          .addListener('click', metaScore.Function.proxy(this.onGuideClick, this, [guide]))
          .appendTo(table);

        new metaScore.Dom('<td/>', {'class': 'thumbnail'})
          .append(new metaScore.Dom('<img/>', {'src': guide.thumbnail}))
          .appendTo(row);

        new metaScore.Dom('<td/>', {'class': 'details'})
          .append(new metaScore.Dom('<h1/>', {'class': 'title', 'text': guide.title}))
          .append(new metaScore.Dom('<p/>', {'class': 'description', 'text': guide.description}))
          .append(new metaScore.Dom('<h2/>', {'class': 'author', 'text': guide.author.name}))
          .appendTo(row);
      }, this);
    }

    this.loadmask.hide();
    delete this.loadmask;

    if(this.configs.modal){
      this.mask.appendTo(this.configs.parent);
    }

    this.appendTo(this.configs.parent);
  };

  /**
   * Description
   * @method onLoadError
   * @return 
   */
  GuideSelector.prototype.onLoadError = function(){
  };

  /**
   * Description
   * @method onGuideClick
   * @param {} guide
   * @return 
   */
  GuideSelector.prototype.onGuideClick = function(guide){
    this.triggerEvent('select', {'overlay': this, 'guide': guide}, true, false);

    this.hide();
  };

  return GuideSelector;

})();