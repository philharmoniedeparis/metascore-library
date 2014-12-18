/**
 * Text
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.component.element').Text = (function () {

  function Text(configs) {  
    // call parent constructor
    Text.parent.call(this, configs);
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
    
  return Text;
  
})();