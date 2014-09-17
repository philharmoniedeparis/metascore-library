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
    
    metaScore.Object.each(this.configs.listeners, function(key, value){
      this.addListener(key, value);
    }, this);
          
    this.pages = new metaScore.Dom('<div/>', {'class': 'pages'}).appendTo(this);
    this.pager = new metaScore.player.Pager().appendTo(this);
      
    this.pager.addDelegate('.button', 'click', metaScore.Function.proxy(this.onPagerClick, this));
    
    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }
  
  Block.defaults = {
    'container': null,
    'properties': {
      'pages': {
        'editable':false,
      }, 
      'name': {
        'type': 'Text',
        'label': metaScore.String.t('Name'),
      },
      'x': {
        'type': 'Integer',
        'label': metaScore.String.t('X'),
      },
      'y': {
        'type': 'Integer',
        'label': metaScore.String.t('Y'),
      },
      'width': {
        'type': 'Integer',
        'label': metaScore.String.t('Width'),
      },
      'height': {
        'type': 'Integer',
        'label': metaScore.String.t('Height'),
      },
      'background-color': {
        'type': 'Color',
        'label': metaScore.String.t('Background color'),
      },
      'background-image': {
        'type':'Image',
        'label': metaScore.String.t('Background image'),
      },
      'synched': {
        'type': 'Boolean',
        'label': metaScore.String.t('Synchronized pages ?'),
      }
    }
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
      page.appendTo(this.pages);
    }
    else{
      page = new metaScore.player.Page(metaScore.Object.extend({}, configs, {
        'container': this.pages
      }));
    }
    
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
      case 'name':
        return this.data(prop);
        
      case 'x':
        return parseInt(this.css('left'), 10);
        
      case 'y':
        return parseInt(this.css('top'), 10);
        
      case 'width':
      case 'height':
        return parseInt(this.css(prop), 10);
        
      case 'background-color':
        return this.css(prop);
        
      case 'background-image':
        return this.css(prop).replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        
     case  'synched':
        return this.data(prop) === "true";
    }
  };
  
  Block.prototype.setProperty = function(prop, value){
    var supressEvent = false,
      color;
  
    switch(prop){
      case 'id':
      case 'name':
      case 'synched':
        this.data(prop, value);
        break;
        
      case 'x':
        this.css('left', value +'px');
        break;
        
      case 'y':
        this.css('top', value +'px');
        break;
        
      case 'width':
      case 'height':
        this.css(prop, value +'px');
        break;
        
      case 'background-color':
        color = metaScore.Color.parse(value);
        this.css(prop, 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        break;
        
      case 'background-image':
        if(metaScore.Var.is(value, "string")){
         value = 'url('+ value +')';
        }        
        this.css(prop, value);
        break;
        
      case 'pages':
        metaScore.Array.each(value, function(index, configs){
          this.addPage(configs);
        }, this);
        break;
        
      default:
        supressEvent = true;
    }
    
    if(supressEvent !== true){
      this.triggerEvent('propchange', {'component': this, 'property': prop, 'value': value});
    }
  };
  
  Block.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Block;
  
})();