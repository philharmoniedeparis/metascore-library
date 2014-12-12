/**
 * Player Block
 *
 * @requires metaScore.player.pager.js
 * @requires metaScore.player.page.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
 
metaScore.namespace('player.component');

metaScore.player.component.Block = (function () {

  function Block(configs) {  
    // call parent constructor
    Block.parent.call(this, configs);
  }
  
  metaScore.player.Component.extend(Block);
  
  Block.defaults = {
    'container': null,
    'properties': {
      'id': {
        'editable':false,
        'getter': function(){
          return this.data('id');
        },
        'setter': function(value){
          this.data('id', value);
        }
      },
      'name': {
        'type': 'Text',
        'label': metaScore.String.t('Name'),
        'getter': function(){
          return this.data('name');
        },
        'setter': function(value){
          this.data('name', value);
        }
      },
      'x': {
        'type': 'Integer',
        'label': metaScore.String.t('X'),
        'getter': function(){
          return parseInt(this.css('left'), 10);
        },
        'setter': function(value){
          this.css('left', value +'px');
        }
      },
      'y': {
        'type': 'Integer',
        'label': metaScore.String.t('Y'),
        'getter': function(){
          return parseInt(this.css('top'), 10);
        },
        'setter': function(value){
          this.css('top', value +'px');
        },
      },
      'width': {
        'type': 'Integer',
        'label': metaScore.String.t('Width'),
        'getter': function(){
          return parseInt(this.css('width'), 10);
        },
        'setter': function(value){
          this.css('width', value +'px');
        }
      },
      'height': {
        'type': 'Integer',
        'label': metaScore.String.t('Height'),
        'getter': function(){
          return parseInt(this.css('height'), 10);
        },
        'setter': function(value){
          this.css('height', value +'px');
        }
      },
      'background-color': {
        'type': 'Color',
        'label': metaScore.String.t('Background color'),
        'getter': function(){
          return this.css('background-color');
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'background-image': {
        'type':'Image',
        'label': metaScore.String.t('Background image'),
        'getter': function(){
          return this.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        },
        'setter': function(value){
          if(metaScore.Var.is(value, "string")){
           value = 'url('+ value +')';
          }        
          this.css('background-image', value);
        }
      },
      'border-width': {
        'type': 'Integer',
        'label': metaScore.String.t('Border width'),
        'getter': function(){
          return parseInt(this.css('border-width'), 10);
        },
        'setter': function(value){
          this.css('border-width', value +'px');
        }
      },
      'border-color': {
        'type': 'Color',
        'label': metaScore.String.t('Border color'),
        'getter': function(){
          return this.css('border-color');
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('border-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'synched': {
        'type': 'Boolean',
        'label': metaScore.String.t('Synchronized pages ?'),
        'getter': function(){
          return this.data('synched') === "true";
        },
        'setter': function(value){
          this.data('synched', value);
        }
      },
      'pages': {
        'editable':false,
        'getter': function(){
          var pages = [];
                
          this.getPages().each(function(index, page){            
            pages.push(page._metaScore.getProperties());
          }, this);
          
          return pages;
        },
        'setter': function(value){
          metaScore.Array.each(value, function(index, configs){
            this.addPage(configs);
          }, this);
        }
      }
    }
  };
  
  Block.prototype.setupDOM = function(){
    // call parent function
    Block.parent.prototype.setupDOM.call(this);
    
    this.addClass('block');
          
    this.pages = new metaScore.Dom('<div/>', {'class': 'pages'})
      .addDelegate('.page', 'cuepointstart', metaScore.Function.proxy(this.onPageCuePointStart, this))
      .appendTo(this);
      
    this.pager = new metaScore.player.Pager()
      .addDelegate('.button', 'click', metaScore.Function.proxy(this.onPagerClick, this))
      .appendTo(this);
  };
  
  Block.prototype.onPageCuePointStart = function(evt){    
    this.setActivePage(evt.target._metaScore, true);
  };
  
  Block.prototype.onPagerClick = function(evt){
    var active = !metaScore.Dom.hasClass(evt.target, 'inactive'),
      action;
      
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
    
    if(configs instanceof metaScore.player.component.Page){
      page = configs;
      page.appendTo(this.pages);
    }
    else{
      page = new metaScore.player.component.Page(metaScore.Object.extend({}, configs, {
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
  
  Block.prototype.setActivePage = function(page, supressEvent){    
    var pages = this.getPages();
      
    if(metaScore.Var.is(page, "number")){
      page = pages.get(page)._metaScore;
    }
  
    pages.removeClass('active');
    
    page.addClass('active');
    
    this.updatePager();
    
    if(supressEvent !== true){
      this.triggerEvent('pageactivate', {'page': page});
    }
  };
  
  Block.prototype.updatePager = function(){  
    var index = this.getActivePageIndex();
    var count = this.getPageCount();
  
    this.pager.updateCount(index, count);  
  };
    
  return Block;
  
})();