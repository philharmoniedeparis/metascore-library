/**
* Description
* @class History
* @namespace metaScore.editor
* @extends metaScore.Evented
*/

metaScore.namespace('editor').History = (function(){

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function History(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    History.parent.call(this);

    this.commands = [];
    this.index = -1;
    this.executing = false;
  }

  History.defaults = {
    /**
    * Maximum number of commands to store
    */
    max_commands: 30
  };

  metaScore.Evented.extend(History);

  /**
   * Description
   * @method execute
   * @param {} command
   * @param {} action
   * @return ThisExpression
   */
  History.prototype.execute = function(command, action) {
    if (command && (action in command)) {
      this.executing = true;
      command[action](command);
      this.executing = false;
    }

    return this;
  };

  /**
   * Description
   * @method add
   * @param {} command
   * @return ThisExpression
   */
  History.prototype.add = function (command){
    if (this.executing) {
      return this;
    }

    // invalidate items higher on the stack
    this.commands.splice(this.index + 1, this.commands.length - this.index);

    // insert the new command
    this.commands.push(command);

    // remove old commands
    if(this.commands.length > this.configs.max_commands){
      this.commands = this.commands.slice(this.configs.max_commands * -1);
    }

    // update the index
    this.index = this.commands.length - 1;

    this.triggerEvent('add', {'command': command});

    return this;
  };

  /**
   * Description
   * @method undo
   * @return ThisExpression
   */
  History.prototype.undo = function() {
    var command = this.commands[this.index];

    if (!command) {
      return this;
    }

    // execute the command's undo
     this.execute(command, 'undo');

    // update the index
    this.index -= 1;

    this.triggerEvent('undo', {'command': command});

    return this;
  };

  /**
   * Description
   * @method redo
   * @return ThisExpression
   */
  History.prototype.redo = function() {
    var command = this.commands[this.index + 1];

    if (!command) {
      return this;
    }

    // execute the command's redo
    this.execute(command, 'redo');

    // update the index
    this.index += 1;

    this.triggerEvent('redo', {'command': command});

    return this;
  };

  /**
   * Description
   * @method clear
   * @return 
   */
  History.prototype.clear = function () {
    var length = this.commands.length;

    this.commands = [];
    this.index = -1;

    if(length > 0) {
      this.triggerEvent('clear');
    }

  };

  /**
   * Description
   * @method hasUndo
   * @return BinaryExpression
   */
  History.prototype.hasUndo = function(){
    return this.index !== -1;
  };

  /**
   * Description
   * @method hasRedo
   * @return BinaryExpression
   */
  History.prototype.hasRedo = function(){
    return this.index < (this.commands.length - 1);
  };

  return History;

})();