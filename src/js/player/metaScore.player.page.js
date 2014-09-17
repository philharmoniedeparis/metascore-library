/**
 * Player Page
 *
 * @requires metaScore.player.element.js
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Page = (function () {

  function Page(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Page.parent.call(this, '<div/>', {'class': 'page'});
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    if(this.configs.container){
      this.appendTo(this.configs.container);
    }
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }
  
  Page.defaults = {
    'properties': {
      'elements': {
        'editable': false
      },
      'background-color': {
        'type': 'Color',
        'label': metaScore.String.t('Background color'),
      },
      'background-image': {
        'type': 'Image',
        'label': metaScore.String.t('Background image'),
      },
      'start-time': {
        'type': 'Time',
        'label': metaScore.String.t('Start time'),
      },
      'end-time': {
        'type': 'Time',
        'label': metaScore.String.t('End time'),
      }
    }
  };
  
  metaScore.Dom.extend(Page);
  
  Page.prototype.onClick = function(evt){  
    if(evt instanceof MouseEvent){
      this.triggerEvent('click', {'page': this});
    
      evt.stopPropagation();
    }
  };
  
  Page.prototype.addElement = function(configs){
    var element;
    
    if(configs instanceof metaScore.player.Element){
      element = configs;
      element.appendTo(this);
    }
    else{
      element = new metaScore.player.element[configs.type](metaScore.Object.extend({}, configs, {
        'container': this
      }));
    }
    
    return element;  
  };
  
  Page.prototype.getProperty = function(prop){
    switch(prop){
      case 'background-color':
        return this.css(prop);
        
      case 'background-image':
        return this.css(prop).replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        
      case 'start-time':
      case 'end-time':
        return parseInt(this.data(prop), 10);
    }
  };
  
  Page.prototype.setProperty = function(prop, value){
    var supressEvent = false,
      color;
    
    switch(prop){
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
        
      case 'start-time':
      case 'end-time':
        this.data(prop, value);
        break;
        
     case 'elements':
        metaScore.Array.each(value, function(index, configs){
          this.addElement(configs);
        }, this);
        break;
        
      default:
        supressEvent = true;
    }
    
    if(supressEvent !== true){
      this.triggerEvent('propchange', {'component': this, 'property': prop, 'value': value});
    }
  };
  
  Page.prototype.setCuePoint = function(configs){
    if(this.cuepoint){
      this.cuepoint.stop(false);
    }
  
    this.cuepoint = new metaScore.player.CuePoint(metaScore.Object.extend({}, configs, {
      'inTime': this.getProperty('start-time'),
      'outTime': this.getProperty('end-time'),
      'onStart': metaScore.Function.proxy(this.onCuePointStart, this)
    }));
    
    return this.cuepoint;
  };
  
  Page.prototype.onCuePointStart = function(cuepoint){
    this.addClass('active');
  };
  
  Page.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Page;
  
})();