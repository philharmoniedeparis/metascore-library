/**
 * Player Page
 *
 * @requires metaScore.player.element.js
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player.component').Page = (function () {

  function Page(configs) {    
    // call parent constructor
    Page.parent.call(this, configs);
  }
  
  metaScore.player.Component.extend(Page);
  
  Page.defaults = {
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
        'type': 'Image',
        'label': metaScore.String.t('Background image'),
        'getter': function(){
          return this.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        },
        'setter': function(value){
          if(!value){
            value = 'none';
          }
          else if(metaScore.Var.is(value, "string")){
           value = 'url('+ value +')';
          }
          this.css('background-image', value);
        }
      },
      'start-time': {
        'type': 'Time',
        'label': metaScore.String.t('Start time'),
        'getter': function(){
          return this.data('start-time');
        },
        'setter': function(value){
          this.data('start-time', isNaN(value) ? null : value);
        }
      },
      'end-time': {
        'type': 'Time',
        'label': metaScore.String.t('End time'),
        'getter': function(){
          return this.data('end-time');
        },
        'setter': function(value){
          this.data('end-time', isNaN(value) ? null : value);
        }
      },
      'elements': {
        'editable': false,
        'getter': function(){
          var elements = [];
          
          this.getElements().each(function(index, element){
            elements.push(element._metaScore.getProperties());
          }, this);
          
          return elements;        
        },
        'setter': function(value){
          metaScore.Array.each(value, function(index, configs){
            this.addElement(configs);
          }, this);
        }
      }
    }
  };
  
  Page.prototype.setupDOM = function(){
    // call parent function
    Page.parent.prototype.setupDOM.call(this);
    
    this.addClass('page');
  };
  
  Page.prototype.addElement = function(configs){
    var element;
    
    if(configs instanceof metaScore.player.component.Element){
      element = configs;
      element.appendTo(this);
    }
    else{
      element = new metaScore.player.component.element[configs.type](metaScore.Object.extend({}, configs, {
        'container': this
      }));
    }
    
    return element;  
  };
  
  Page.prototype.getElements = function(){  
    return this.children('.element');
  };
  
  Page.prototype.setCuePoint = function(configs){
    if(this.cuepoint){
      this.cuepoint.destroy();
    }
  
    this.cuepoint = new metaScore.player.CuePoint(metaScore.Object.extend({}, configs, {
      'inTime': this.getProperty('start-time'),
      'outTime': this.getProperty('end-time'),
      'onStart': metaScore.Function.proxy(this.onCuePointStart, this),
      'onEnd': metaScore.Function.proxy(this.onCuePointEnd, this)
    }));
    
    return this.cuepoint;
  };
  
  Page.prototype.onCuePointStart = function(cuepoint){
    this.triggerEvent('cuepointstart');
  };
  
  Page.prototype.onCuePointEnd = function(cuepoint){
    this.triggerEvent('cuepointend');
  };
  
  Page.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Page;
  
})();