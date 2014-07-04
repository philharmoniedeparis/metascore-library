/**
 * Player Block
 *
 * @requires metaScore.player.pager.js
 * @requires metaScore.player.page.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
metaScore.Player.Block = metaScore.Dom.extend(function(){
  
  var _pages, _pager;

  this.constructor = function(dom) {
  
    _pages = [];
  
    if(dom){
      this.super(dom);
      _pages = this.children('.pages');
      _pager = new metaScore.Player.Pager(this.child('.pager').get(0));
    }
    else{
      this.super('<div/>', {'class': 'metaScore-block'});
      _pages = new metaScore.Dom('<div/>', {'class': 'pages'}).appendTo(this);
      _pager = new metaScore.Player.Pager().appendTo(this);
    }
    
    _pager
      .addDelegate('.button', 'click', function(evt){
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
      }, this);
    
  };
  
  this.getPages = function(){
  
    return _pages.children('.page');
  
  };
  
  this.addPage = function(page){
  
    _pages.append(page);
    
    this.setActivePage(this.getPages().count() - 1);
  
  };
  
  this.getActivePage = function(){
  
    return new metaScore.Player.Page(this.getPages().child('.active').get(0));
  
  };
  
  this.getActivePageIndex = function(){
  
    return this.getPages().index('.active');
  
  };
  
  this.getPageCount = function(){
  
    return this.getPages().count();
  
  };
  
  this.setActivePage = function(index){
    
    var pages = this.getPages(),
      page = new metaScore.Player.Page(pages.get(index));
  
    pages.removeClass('active');
    
    page.addClass('active');
    
    this.updatePager();
    
    this.triggerEvent('pageactivated', {'index': index, 'page': page});
  
  };
  
  this.updatePager = function(){
  
    var index = this.getActivePageIndex();
    var count = this.getPageCount();
  
    _pager.updateCount(index, count);
  
  };
  
  this.isSynched = function(){
    
    return this.data('synched') === "true";
    
  };
});