/**
 * Text
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.component.element');

metaScore.player.component.element.Text = (function () {

  function Text(configs) {  
    // call parent constructor
    Text.parent.call(this, configs);
      
    // fix event handlers scope
    this.onContentsClick = metaScore.Function.proxy(this.onContentsClick, this);
    this.onContentsDblClick = metaScore.Function.proxy(this.onContentsDblClick, this);
    this.onContentsBlur = metaScore.Function.proxy(this.onContentsBlur, this);
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
      },
      'text-color': {
        'type': 'Color',
        'label': metaScore.String.t('Text color'),
        'getter': function(){
          return this.css('color');
        },
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'font-family': {
        'type': 'Select',
        'label': metaScore.String.t('Font'),
        'configs': {
          'options': {
            'Georgia, serif': 'Georgia',
            '"Times New Roman", Times, serif': 'Times New Roman',
            'Arial, Helvetica, sans-serif': 'Arial',
            '"Comic Sans MS", cursive, sans-serif': 'Comic Sans MS',
            'Impact, Charcoal, sans-serif': 'Impact',
            '"Lucida Sans Unicode", "Lucida Grande", sans-serif': 'Lucida Sans Unicode',
            'Tahoma, Geneva, sans-serif': 'Tahoma',
            'Verdana, Geneva, sans-serif': 'Verdana',
            '"Courier New", Courier, monospace': 'Courier New',
            '"Lucida Console", Monaco, monospace': 'Lucida Console'
          }
        },
        'getter': function(){
          return this.css('font-family');
        },
        'setter': function(value){
          this.css('font-family', value);
        }
      }
    })
  };
  
  Text.prototype.setupDOM = function(){
    // call parent function
    Text.parent.prototype.setupDOM.call(this);
    
    this.data('type', 'text');
      
    this.contents
      .addListener('dblclick', metaScore.Function.proxy(this.onContentsDblClick, this))
      .addListener('blur', metaScore.Function.proxy(this.onContentsBlur, this));
  };
  
  Text.prototype.onContentsClick = function(evt){
    evt.stopPropagation();
  };
  
  Text.prototype.onContentsDblClick = function(evt){    
    if(this._draggable){
      this._draggable.disable();
    }
    
    this.contents.addListener('click', this.onContentsClick);
    this.setEditable(true);
    this.contents.get(0).focus();
  };
  
  Text.prototype.onContentsBlur = function(evt){
    this.contents.removeListener('click', this.onContentsClick);
    this.setEditable(false);
    
    if(this._draggable){
      this._draggable.enable();
    }
  };
  
  Text.prototype.setEditable = function(editable){
    this.contents.attr('contenteditable', editable ? 'true' : 'null');
  };
    
  return Text;
  
})();