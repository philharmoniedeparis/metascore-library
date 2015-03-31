/**
* Description
* @class Draggable
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Draggable = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Draggable(configs) {
    this.configs = this.getConfigs(configs);

    this.configs.container = this.configs.container || new metaScore.Dom('body');

    // fix event handlers scope
    this.onMouseDown = metaScore.Function.proxy(this.onMouseDown, this);
    this.onMouseMove = metaScore.Function.proxy(this.onMouseMove, this);
    this.onMouseUp = metaScore.Function.proxy(this.onMouseUp, this);

    this.configs.handle.addListener('mousedown', this.onMouseDown);

    this.enable();
  }

  Draggable.defaults = {
    /**
    * The limits of the dragging
    */
    limits: {
      top: null,
      left: null
    }
  };

  metaScore.Class.extend(Draggable);

  /**
   * Description
   * @method onMouseDown
   * @param {} evt
   * @return 
   */
  Draggable.prototype.onMouseDown = function(evt){
    if(!this.enabled){
      return;
    }

    this.start_state = {
      'left': parseInt(this.configs.target.css('left'), 10) - evt.clientX,
      'top': parseInt(this.configs.target.css('top'), 10) - evt.clientY
    };

    this.configs.container
      .addListener('mouseup', this.onMouseUp)
      .addListener('mousemove', this.onMouseMove);

    this.configs.target
      .addClass('dragging')
      .triggerEvent('dragstart', null, false, true);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onMouseMove
   * @param {} evt
   * @return 
   */
  Draggable.prototype.onMouseMove = function(evt){
    var left = evt.clientX + this.start_state.left,
      top = evt.clientY + this.start_state.top;

    if(!isNaN(this.configs.limits.top)){
      top = Math.max(top, this.configs.limits.top);
    }

    if(!isNaN(this.configs.limits.left)){
      left = Math.max(left, this.configs.limits.left);
    }

    this.configs.target
      .css('left', left + 'px')
      .css('top', top + 'px')
      .triggerEvent('drag', null, false, true);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onMouseUp
   * @param {} evt
   * @return 
   */
  Draggable.prototype.onMouseUp = function(evt){
    this.configs.container
      .removeListener('mousemove', this.onMouseMove)
      .removeListener('mouseup', this.onMouseUp);

    this.configs.target
      .removeClass('dragging')
      .triggerEvent('dragend', null, false, true);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method enable
   * @return ThisExpression
   */
  Draggable.prototype.enable = function(){
    this.configs.target.addClass('draggable');

    this.configs.handle.addClass('drag-handle');

    this.enabled = true;

    return this;
  };

  /**
   * Description
   * @method disable
   * @return ThisExpression
   */
  Draggable.prototype.disable = function(){
    this.configs.target.removeClass('draggable');

    this.configs.handle.removeClass('drag-handle');

    this.enabled = false;

    return this;
  };

  /**
   * Description
   * @method destroy
   * @return ThisExpression
   */
  Draggable.prototype.destroy = function(){
    this.disable();

    this.configs.handle.removeListener('mousedown', this.onMouseDown);

    return this;
  };

  return Draggable;

})();