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

  this.constructor = function(element) {
  
    if(element){
      this.super(element);
    }
    else{
      this.super('<div/>', {'class': 'metaScore-block', 'id': metaScore.String.uuid(5)});
    }
    
    _pages = this.children('pages');
    if(_pages.count() === 0){
      _pages = new metaScore.Dom('<div/>', {'class': 'pages'}) .appendTo(this);
    }
    
    _pager = this.children('page');
    if(_pager.count() === 0){
      _pager = new metaScore.Player.Pager() .appendTo(this);
    }
    
  };
  
  this.addPage = function(configs){
  
    var page = new metaScore.Player.Page(configs)
      .appendTo(_pages);
      
    this.updatePagerCount();
    
    return page;
  
  };
  
  this.updatePagerCount = function(){
  
    var page_count = _pages.children('page').count();
  
    _pager.updateCount(page_count);
  
  };
});