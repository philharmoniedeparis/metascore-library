/**
 * Player Block
 *
 * @requires metaScore.player.pager.js
 * @requires metaScore.player.page.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
 
metaScore.namespace('player');

metaScore.player.Block = (function () {

  function Block(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Block.parent.call(this);
    
    this.dom = new metaScore.Dom('<div/>', {'class': 'metaScore-block'});
    this.dom.get(0)._metaScore = this;
    
    if(this.configs.container){
      this.dom.appendTo(this.configs.container);
    }
          
    this.pages = new metaScore.Dom('<div/>', {'class': 'pages'}).appendTo(this.dom);
    this.pager = new metaScore.player.Pager().appendTo(this.dom);
      
    this.pager.addDelegate('.button', 'click', metaScore.Function.proxy(this.onPagerClick, this));
      
    this.dom.addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    metaScore.Array.each(this.configs.pages, function(index, page){
      this.addPage(page);
    }, this);
  }
  
  Block.defaults = {
    'container': null,
    'pages': []
  };
  
  metaScore.Evented.extend(Block);
  
  Block.prototype.getPages = function(){  
    return this.pages.children('.page');  
  };
  
  Block.prototype.addPage = function(configs){
    var page;
    
    if(configs instanceof metaScore.player.Page){
      page = configs;
    }
    else{
      page = new metaScore.player.Page(configs);
    }
  
    page.dom.appendTo(this.pages);
    
    page
      .addListener('click', metaScore.Function.proxy(this.onPageClick, this))
      .addListener('elementclick', metaScore.Function.proxy(this.onElementClick, this));
    
    this.setActivePage(this.getPages().count() - 1);
    
    return page;
  };
  
  Block.prototype.getActivePage = function(){    
    var pages = this.getPages(),
      index = this.getActivePageIndex();
  
    if(index < 0){
      return null;
    }
  
    return this.getPages().get(index)._metaScore;
  };
  
  Block.prototype.getActivePageIndex = function(){    
    var pages = this.getPages(),
      index = pages.index('.active');
  
    return index;  
  };
  
  Block.prototype.getPageCount = function(){  
    return this.getPages().count();  
  };
  
  Block.prototype.setActivePage = function(page){    
    var pages = this.getPages();
      
    if(metaScore.Var.is(page, "number")){
      page = pages.get(page)._metaScore;
    }
  
    pages.removeClass('active');
    
    page.dom.addClass('active');
    
    this.updatePager();
    
    this.triggerEvent('pageactivate', {'page': page});
  };
  
  Block.prototype.updatePager = function(){  
    var index = this.getActivePageIndex();
    var count = this.getPageCount();
  
    this.pager.updateCount(index, count);  
  };
  
  Block.prototype.isSynched = function(){    
    return this.dom.data('synched') === "true";    
  };
  
  Block.prototype.onClick = function(evt){
    this.triggerEvent('click');
    
    evt.stopPropagation();    
  };
  
  Block.prototype.onPageClick = function(evt){
    this.triggerEvent('pageclick', {'page': evt.target});
  };
  
  Block.prototype.onElementClick = function(evt){
    this.triggerEvent('elementclick', {'element': evt.detail.element});
  };
  
  Block.prototype.onPagerClick = function(evt){
    var active = !metaScore.Dom.hasClass(evt.target, 'inactive'),
      action, index;
      
    if(active){
      action = metaScore.Dom.data(evt.target, 'action');
    
      switch(action){
        case 'first':
          this.setActivePage(0);
          break;
        case 'previous':
          this.setActivePage(this.getActivePageIndex() - 1);
          break;
        case 'next':
          this.setActivePage(this.getActivePageIndex() + 1);
          break;
      }
    }
    
    evt.stopPropagation();
  };
  
  Block.prototype.destroy = function(){
    this.dom.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Block;
  
})();