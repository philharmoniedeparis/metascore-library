/**
 * GuideSelector
 *
 * @requires ../metaScore.editor.overlay.js
 * @requires ../../helpers/metaScore.ajax.js
 */
 
metaScore.namespace('editor.overlay').GuideSelector = (function () {
  
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
    title: metaScore.String.t('Select a guide'),
    
    /**
    * The text to display when no guides are available
    */
    emptyText: metaScore.String.t('No guides available'),
    
    /**
    * The url from which to retreive the list of guides
    */
    url: null,
    
    /**
    * A function to call when a guide is selected
    */
    selectCallback: metaScore.Function.emptyFn,
    
    /**
    * Whether to automatically hide the overlay when a guide is selected
    */
    hideOnSelect: true
  };
  
  metaScore.editor.Overlay.extend(GuideSelector);
  
  GuideSelector.prototype.show = function(){    
    this.loadmask = new metaScore.editor.overlay.LoadMask({
      'autoShow': true
    });
    
    metaScore.Ajax.get(this.configs.url, {
      'success': metaScore.Function.proxy(this.onLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onLoadError, this)
    });
  };
  
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