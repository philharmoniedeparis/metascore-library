/**
 * Text
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.component.element').Text = (function () {

  function Text(configs) {  
    // call parent constructor
    Text.parent.call(this, configs);
          
    this.addDelegate('a', 'click', metaScore.Function.proxy(this.onLinkClick, this));
  }
  
  metaScore.player.component.Element.extend(Text);
  
  Text.defaults = {
    'properties': metaScore.Object.extend({}, metaScore.player.component.Element.defaults.properties, {
      'text': {
        'editable':false,
        'getter': function(){
          return this.contents.text();
        },
        'setter': function(value){
          this.contents.text(value);
        }
      }
    })
  };
  
  Text.prototype.setupDOM = function(){
    // call parent function
    Text.parent.prototype.setupDOM.call(this);
    
    this.data('type', 'text');
  };
  
  Text.prototype.onLinkClick = function(evt){
    var link = evt.target,
      matches;
  
    if(matches = link.hash.match(/^#p=(\d+)/)){
      this.triggerEvent('page', {'element': this, 'value': matches[1]});
      evt.preventDefault();
    }
    else if(matches = link.hash.match(/^#t=(\d+),(\d+)&r=(\d+)/)){
      this.triggerEvent('time', {'element': this, 'in': matches[1], 'out': matches[2]});
      this.triggerEvent('rindex', {'element': this, 'value': matches[3]});
      
      evt.preventDefault();
    }
    
  };
    
  return Text;
  
})();