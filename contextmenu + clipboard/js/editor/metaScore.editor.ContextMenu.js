/**
* Description
* @class ContextMenu
* @namespace metaScore.editor
* @extends metaScore.Dom
*/

metaScore.namespace('editor').ContextMenu = (function(){

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function ContextMenu(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    ContextMenu.parent.call(this, '<ul/>', {'class': 'context-menu'});
    
    this.tasks = {};
    this.context = null;

    // fix event handlers scope
    this.onTargetContextmenu = metaScore.Function.proxy(this.onTargetContextmenu, this);
    this.onTargetClick = metaScore.Function.proxy(this.onTargetClick, this);
    this.onTaskClick = metaScore.Function.proxy(this.onTaskClick, this);
  }

  metaScore.Dom.extend(ContextMenu);

  ContextMenu.defaults = {
    'container': 'body'
  };

  /**
   * Description
   * @method onTargetContextmenu
   * @param {} evt
   * @return ThisExpression
   */
  ContextMenu.prototype.onTargetContextmenu = function(evt){
    var x = 0, y = 0;
    
    if(evt.pageX || evt.pageY){
      x = evt.pageX;
      y = evt.pageY;
    }
    else if(evt.clientX || evt.clientY){
      x = evt.clientX + document.body.scrollLeft;
      y = evt.clientY + document.body.scrollTop;
    }
    
    this.show(evt.target, x, y);
    
    evt.preventDefault();
  };

  /**
   * Description
   * @method onTargetClick
   * @param {} evt
   * @return ThisExpression
   */
  ContextMenu.prototype.onTargetClick = function(evt){  
    this.hide();
  };

  /**
   * Description
   * @method onTaskClick
   * @param {} evt
   * @return ThisExpression
   */
  ContextMenu.prototype.onTaskClick = function(evt){
    var action = new metaScore.Dom(evt.target).data('action'),
      task = this.tasks[action];
      
    if(task){
      this.triggerEvent('taskclick', {'action': action, 'context': this.context}, true, false);
    }
    
    this.hide();
  };

  /**
   * Description
   * @method setListenerTarget
   * @param {} target
   * @return ThisExpression
   */
  ContextMenu.prototype.setListenerTarget = function(target){
    this.target = target;
    
    metaScore.Dom.addListener(this.target, 'contextmenu',this.onTargetContextmenu);
  
    return this;
  };

  /**
   * Description
   * @method addTask
   * @param {} action
   * @param {} text
   * @param {} toggler
   * @return ThisExpression
   */
  ContextMenu.prototype.addTask = function(action, text, toggler){
    var el = new metaScore.Dom('<li/>', {'data-action': action, 'text': text})
      .addListener('click', this.onTaskClick)
      .appendTo(this);
      
    this.tasks[action] = {
      'toggler': toggler,
      'el': el
    };
      
    return this;
  };

  /**
   * Description
   * @method addSeparator
   * @return ThisExpression
   */
  ContextMenu.prototype.addSeparator = function(){
    new metaScore.Dom('<li/>', {'class': 'separator'})
      .appendTo(this);
      
    return this;
  };

  /**
   * Description
   * @method show
   * @param {} position
   * @return ThisExpression
   */
  ContextMenu.prototype.show = function(el, x, y){
    this.context = el;
  
    metaScore.Object.each(this.tasks, function(key, task){      
      if(task.toggler(this.context) === true){
        task.el.removeClass('disabled');
      }
      else{
        task.el.addClass('disabled');
      }
    }, this);
  
    metaScore.Dom.addListener(this.target, 'click', this.onTargetClick);
    
    this
      .css('left', x +'px')
      .css('top', y +'px');

    // call parent function
    return ContextMenu.parent.prototype.show.call(this);
  };

  /**
   * Description
   * @method hide
   * @param {} position
   * @return ThisExpression
   */
  ContextMenu.prototype.hide = function(){
    metaScore.Dom.removeListener(this.target, 'click', this.onTargetClick);
    
    this.context = null;

    // call parent function
    return ContextMenu.parent.prototype.hide.call(this);
  };

  return ContextMenu;

})();