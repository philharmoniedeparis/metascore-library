/**
* Description
* @class Clipboard
* @namespace metaScore.editor
* @extends metaScore.Evented
*/

metaScore.namespace('editor').Clipboard = (function(){

  /**
   * Description
   * @constructor
   */
  function Clipboard() {
    // call parent constructor
    Clipboard.parent.call(this);
    
    this.data = null;
  }

  metaScore.Evented.extend(Clipboard);

  /**
   * Description
   * @method setData
   * @param {} type
   * @param {} data
   * @return ThisExpression
   */
  Clipboard.prototype.setData = function(type, data){
    this.data = {
      'type': type,
      'data': data
    };
    
    return this;
  };

  /**
   * Description
   * @method getData
   * @return ThisExpression
   */
  Clipboard.prototype.getData = function(){
    return this.data.data;
  };

  /**
   * Description
   * @method getDataType
   * @return ThisExpression
   */
  Clipboard.prototype.getDataType = function(){
    return this.data ? this.data.type : null;
  };

  /**
   * Description
   * @method clearData
   * @return ThisExpression
   */
  Clipboard.prototype.clearData = function(){  
    this.data = null;  
  };

  return Clipboard;

})();