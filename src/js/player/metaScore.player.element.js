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
    
    if(this.configs.container){
      this.appendTo(this.configs.container);
    }
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this);
    
    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }
  
  metaScore.Dom.extend(Element);
  
  Element.defaults = {
    'properties': {
      'name': {
        'type': 'Text',
        'label': metaScore.String.t('Name')
      },
      'x': {
        'type': 'Integer',
        'label': metaScore.String.t('X')
      },
      'y': {
        'type': 'Integer',
        'label': metaScore.String.t('Y')
      },
      'width': {
        'type': 'Integer',
        'label': metaScore.String.t('Width')
      },
      'height': {
        'type': 'Integer',
        'label': metaScore.String.t('Height')
      },
      'r-index': {
        'type': 'Integer',
        'label': metaScore.String.t('Reading index'),
        'configs': {
          'min': 0
        }
      },
      'z-index': {
        'type': 'Integer',
        'label': metaScore.String.t('Display index')
      },
      'background-color': {
        'type': 'Color',
        'label': metaScore.String.t('Background color')
      },
      'background-image': {
        'type': 'Image',
        'label': metaScore.String.t('Background image')
      },
      'border-width': {
        'type': 'Integer',
        'label': metaScore.String.t('Border width')
      },
      'border-color': {
        'type': 'Color',
        'label': metaScore.String.t('Border color')
      },
      'rounded-conrners': {
        'type': 'Corner',
        'label': metaScore.String.t('Rounded conrners')
      },
      'start-time': {
        'type': 'Time',
        'label': metaScore.String.t('Start time')
      },
      'end-time': {
        'type': 'Time',
        'label': metaScore.String.t('End time')
      }
    }
  };
  
  Element.prototype.onClick = function(evt){
    if(evt instanceof MouseEvent){
      this.triggerEvent('click', {'element': this});
    
      evt.stopPropagation();
    }
  };
  
  Element.prototype.getProperty = function(prop){
    switch(prop){
      case 'id':
      case 'name':
      case 'direction':
        return this.data(prop);
        
      case 'x':
        return parseInt(this.css('left'), 10);
        
      case 'y':
        return parseInt(this.css('top'), 10);
        
      case 'width':
      case 'height':
      case 'z-index':
      case 'border-width':
        return parseInt(this.css(prop), 10);
        
      case 'background-color':
      case 'border-color':
      case 'font-family':
        return this.css(prop);
        
      case 'background-image':
        return this.css(prop).replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        
      case 'rounded-conrners':
        break;
        
      case 'r-index':
      case 'start-time':
      case 'end-time':
        return parseInt(this.data(prop), 10);
        
      case 'cursor-width':
        return this.cursor.css('width');
        
      case 'cursor-color':
        return this.cursor.css('background-color');
        
      case 'text-color':
        return this.css('color');
    }
  };
  
  Element.prototype.setProperty = function(prop, value){
    var supressEvent = false,
      color;
    
    switch(prop){        
      case 'id':
      case 'name':
      case 'r-index':
      case 'start-time':
      case 'end-time':
      case 'direction':
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
      case 'border-width':
        this.css(prop, value +'px');
        break;
        
      case 'z-index':
      case 'font-family':
        this.css(prop, value);
        break;
        
      case 'background-color':
      case 'border-color':
        color = metaScore.Color.parse(value);
        this.css(prop, 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        break;
        
      case 'background-image':
        if(metaScore.Var.is(value, "string")){
         value = 'url('+ value +')';
        }        
        this.css(prop, value);
        break;
        
      case 'rounded-conrners':
        break;
        
      case 'cursor-width':
        this.cursor.css('width', value +'px');
        break;
        
      case 'cursor-color':
        color = metaScore.Color.parse(value);
        this.cursor.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        break;
        
      case 'text-color':
        color = metaScore.Color.parse(value);
        this.css('color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        break;
        
      default:
        supressEvent = true;
    }
    
    if(supressEvent !== true){
      this.triggerEvent('propchange', {'component': this, 'property': prop, 'value': value});
    }
  };
  
  Element.prototype.setCuePoint = function(configs){
  };
  
  Element.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Element;
  
})();