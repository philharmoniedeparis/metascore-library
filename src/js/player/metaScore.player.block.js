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
    Block.parent.call(this, '<div/>', {'class': 'metaScore-block'});
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    if(this.configs.container){
      this.appendTo(this.configs.container);
    }
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
          
    this.pages = new metaScore.Dom('<div/>', {'class': 'pages'}).appendTo(this);
    this.pager = new metaScore.player.Pager().appendTo(this);
      
    this.pager.addDelegate('.button', 'click', metaScore.Function.proxy(this.onPagerClick, this));
    
    metaScore.Object.each(this.configs.listeners, function(key, value){
      this.addListener(key, value);
    }, this);
    
    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }
  
  Block.defaults = {
    'container': null,
    'player_id': null,
    'pages': []
  };
  
  metaScore.Dom.extend(Block);
  
  Block.prototype.onClick = function(evt){
    if(evt instanceof MouseEvent){
      this.triggerEvent('click', {'block': this});
    
      evt.stopPropagation();
    }
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
  
    page.appendTo(this.pages);
    
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
    
    page.addClass('active');
    
    this.updatePager();
    
    this.triggerEvent('pageactivate', {'page': page});
  };
  
  Block.prototype.updatePager = function(){  
    var index = this.getActivePageIndex();
    var count = this.getPageCount();
  
    this.pager.updateCount(index, count);  
  };
  
  Block.prototype.isSynched = function(){    
    return this.data('synched') === "true";    
  };
  
  Block.prototype.getProperty = function(prop){
    switch(prop){
      case 'id':
        return this.data('id');
        
      case 'name':
        return this.data('name');
        
      case 'x':
        return parseInt(this.css('left'), 10);
        
      case 'y':
        return parseInt(this.css('top'), 10);
        
      case 'width':
        return parseInt(this.css('width'), 10);
        
      case 'height':
        return parseInt(this.css('height'), 10);
        
      case 'bg-color':
        return this.css('background-color');
        
      case 'bg-image':
        return this.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        
     case  'synched':
        return this.data('synched') === "true";
    }
  };
  
  Block.prototype.setProperty = function(prop, value){
    switch(prop){
      case 'id':
        this.data('id', value);
        break;
        
      case 'name':
        this.data('name', value);
        break;
        
      case 'x':
        this.css('left', value +'px');
        break;
        
      case 'y':
        this.css('top', value +'px');
        break;
        
      case 'width':
        this.css('width', value +'px');
        break;
        
      case 'height':
        this.css('height', value +'px');
        break;
        
      case 'bg-color':
        this.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
        
      case 'bg-image':
        this.css('background-image', 'url('+ value +')');
        break;
        
     case 'synched':
        this.data('synched', value);
        break;
        
     case 'pages':
        metaScore.Array.each(value, function(index, configs){
          this.addPage(configs);
        }, this);
        break;
    }
    
    this.triggerEvent('propertychange', {'property': prop, 'value': value});
  };
  
  Block.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Block;
  
})();