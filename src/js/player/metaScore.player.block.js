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

  function Block(dom) {
    this.pages = [];
  
    if(dom){
      // call parent constructor
      Block.parent.call(this, dom);
      
      this.pages = this.children('.pages');
      this.pager = new metaScore.player.Pager(this.child('.pager').get(0));
    }
    else{
      // call parent constructor
      Block.parent.call(this, '<div/>', {'class': 'metaScore-block'});
      
      this.pages = new metaScore.Dom('<div/>', {'class': 'pages'}).appendTo(this);
      this.pager = new metaScore.player.Pager().appendTo(this);
    }
      
    this.pager.addDelegate('.button', 'click', metaScore.Function.proxy(this.onPagerClick, this));
      
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
  }
  
  metaScore.Dom.extend(Block);
  
  Block.prototype.getPages = function(){  
    return this.pages.children('.page');  
  };
  
  Block.prototype.addPage = function(page){  
    this.pages.append(page);
    
    this.setActivePage(this.getPages().count() - 1);  
  };
  
  Block.prototype.getActivePage = function(){    
    var pages = this.getPages(),
      index = this.getActivePageIndex();
  
    return new metaScore.player.Page(this.getPages().get(index));  
  };
  
  Block.prototype.getActivePageIndex = function(){    
    var pages = this.getPages(),
      index = pages.index('.active');
  
    if(index < 0){
      index = 0;
    }
  
    return index;  
  };
  
  Block.prototype.getPageCount = function(){  
    return this.getPages().count();  
  };
  
  Block.prototype.setActivePage = function(index){    
    var pages = this.getPages(),
      page = new metaScore.player.Page(pages.get(index));
  
    pages.removeClass('active');
    
    page.addClass('active');
    
    this.updatePager();
    
    this.triggerEvent('pageactivated', {'index': index, 'page': page});  
  };
  
  Block.prototype.updatePager = function(){  
    var index = this.getActivePageIndex();
    var count = this.getPageCount();
  
    this.pager.updateCount(index, count);  
  };
  
  Block.prototype.isSynched = function(){    
    return this.data('synched') === "true";    
  };
  
  Block.prototype.onClick = function(evt){    
    this.triggerEvent('blockclick', {'block': this});
    
    evt.stopPropagation();    
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
    
  return Block;
  
})();