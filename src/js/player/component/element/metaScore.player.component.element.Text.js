/**
* Description
* @class Text
* @namespace metaScore.player.component.element
* @extends metaScore.player.component.Element
*/

metaScore.namespace('player.component.element').Text = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
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
        /**
         * Description
         * @return CallExpression
         */
        'getter': function(){
          return this.contents.text();
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.contents.text(value);
        }
      }
    })
  };

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Text.prototype.setupDOM = function(){
    // call parent function
    Text.parent.prototype.setupDOM.call(this);

    this.data('type', 'Text');
  };

  /**
   * Description
   * @method onLinkClick
   * @param {} evt
   * @return 
   */
  Text.prototype.onLinkClick = function(evt){
    var link = evt.target,
      matches;
      
    if(!metaScore.Dom.is(link, 'a')){
      link = metaScore.Dom.closest(link, 'a');
    }
    
    if(link){
      if(matches = link.hash.match(/^#page=([^,]*),(\d+)$/)){
        this.triggerEvent('page', {'element': this, 'block': matches[1], 'index': parseInt(matches[2])-1});
        evt.preventDefault();
      }
      else if(matches = link.hash.match(/^#play=(\d*\.?\d+),(\d*\.?\d+),(\d+)$/)){
        this.triggerEvent('play', {'element': this, 'inTime': parseFloat(matches[1]), 'outTime': parseFloat(matches[2]) - 1, 'rIndex': parseInt(matches[3])});
      }
      else{
        window.open(link.href,'_blank');
      }

      evt.preventDefault();
    }

  };

  return Text;

})();