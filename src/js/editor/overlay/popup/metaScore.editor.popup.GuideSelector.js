/**
 * GuideSelector
 *
 * @requires ../metaScore.editor.popup.js
 * @requires ../../helpers/metaScore.ajax.js
 */
 
metaScore.namespace('editor.overlay.popup').GuideSelector = (function () {
  
  function GuideSelector(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    GuideSelector.parent.call(this, this.configs);
    
    this.addClass('guide-selector loading');
    
    new metaScore.Dom('<div/>', {'class': 'loading', 'text': metaScore.String.t('Loading...')})
      .appendTo(this.getContents());
    
    metaScore.Ajax.get(this.configs.url, {
      'success': metaScore.Function.proxy(this.onLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onLoadError, this)
    });
  }

  GuideSelector.defaults = {
    /**
    * The popup's title
    */
    title: metaScore.String.t('Select a guide'),
    
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
    draggable: false,
    
    /**
    * The url from which to retreive the list of guides
    */
    url: null,
    
    /**
    * A function to call when a guide is selected
    */
    selectCallback: metaScore.Function.emptyFn,
    
    /**
    * Whether to automatically hide the popup when a guide is selected
    */
    hideOnSelect: true
  };
  
  metaScore.editor.overlay.Popup.extend(GuideSelector);
  
  GuideSelector.prototype.onLoadSuccess = function(xhr){
  
    var contents = this.getContents(),
      data = JSON.parse(xhr.response),
      table, row;
      
    this.removeClass('loading');
      
    contents.empty();
      
    table = new metaScore.Dom('<table/>', {'class': 'guides'})
      .appendTo(contents);
    
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
  };
  
  GuideSelector.prototype.onLoadError = function(){    
  };
  
  GuideSelector.prototype.onGuideClick = function(guide){
    this.configs.selectCallback(guide);
    
    if(this.configs.hideOnSelect){
      this.hide();
    }
  };
    
  return GuideSelector;
  
})();