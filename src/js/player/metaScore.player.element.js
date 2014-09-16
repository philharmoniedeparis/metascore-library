/**
 * Player Element
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Element = (function () {

  function Element(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Element.parent.call(this, '<div/>', {'class': 'element'});
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this);
    
    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }
  
  metaScore.Dom.extend(Element);
  
  Element.prototype.onClick = function(evt){
    if(evt instanceof MouseEvent){
      this.triggerEvent('click', {'element': this});
    
      evt.stopPropagation();
    }
  };
  
  Element.prototype.getProperty = function(prop){
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
        
      case 'r-index':
        return parseInt(this.data('r-index'), 10);
        
      case 'z-index':
        return parseInt(this.css('z-index'), 10);
        
      case 'bg-color':
        return this.css('background-color');
        
      case 'bg-image':
        return this.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        
      case 'border-width':
        return parseInt(this.css('border-width'), 10);
        
      case 'border-color':
        return this.css('border-color');
        
      case 'rounded-conrners':
        break;
        
      case 'start-time':
        return this.data('start-time');
        
      case 'end-time':
        return this.data('end-time');
        
      case 'direction':
        return this.data('direction');
        
      case 'cursor-width':
        return this.cursor.css('width');
        
      case 'cursor-color':
        return this.cursor.css('background-color');
        
      case 'font-family':
        return this.css('font-family');
        
      case 'text-color':
        return this.css('color');
    }
  };
  
  Element.prototype.setProperty = function(prop, value){
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
        
      case 'r-index':
        this.data('r-index', value);
        break;
        
      case 'z-index':
        this.css('z-index', value);
        break;
        
      case 'bg-color':
        this.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
        
      case 'bg-image':
        this.css('background-image', 'url('+ value +')');
        break;
        
      case 'border-width':
        this.css('border-width', value +'px');
        break;
        
      case 'border-color':
        this.css('border-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
        
      case 'rounded-conrners':
        break;
        
      case 'start-time':
        this.data('start-time', value);
        break;
        
      case 'end-time':
        this.data('end-time', value);
        break;
        
      case 'direction':
        this.data('direction', value);
        break;
        
      case 'cursor-width':
        this.cursor.css('width', value +'px');
        break;
        
      case 'cursor-color':
        this.cursor.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
        
      case 'font-family':
        this.css('font-family', value);
        break;
        
      case 'text-color':
        this.css('color', value);
        break;
    }
    
    this.triggerEvent('propertychange', {'property': prop, 'value': value});
  };
  
  Element.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Element;
  
})();