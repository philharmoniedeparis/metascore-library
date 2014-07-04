/**
 * Undo
 *
 * @requires ../metaScore.evented.js
 */
 
metaScore.Editor.History = metaScore.Evented.extend(function(){

  var _commands = [],
    _index = -1,
    _executing = false;
  
  this.defaults = {    
    /**
    * Maximum number of commands to store
    */
    max_commands: 30
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {  
    this.initConfig(configs);    
  };
  
  this.execute = function(command, action) {  
    if (command && command.hasOwnProperty(action)) {      
      _executing = true;        
      command[action](command);
      _executing = false;
    }
    
    return this;
  };
  
  this.add = function (command){  
    if (_executing) {
      return this;
    }
    
    // invalidate items higher on the stack
    _commands.splice(_index + 1, _commands.length - _index);
    
    // insert the new command
    _commands.push(command);
    
    // remove old commands
    if(_commands.length > this.configs.max_commands){
      _commands = _commands.slice(this.configs.max_commands * -1);
    }

    // update the index
    _index = _commands.length - 1;
    
    this.triggerEvent('add', {'command': command});
    
    return this;    
  };

  this.undo = function() {
    var command = _commands[_index];
    
    if (!command) {
      return this;
    }
    
    // execute the command's undo
     this.execute(command, 'undo');
    
    // update the index
    _index -= 1;
    
    this.triggerEvent('undo', {'command': command});
    
    return this;    
  };

  this.redo = function() {
    var command = _commands[_index + 1];
    
    if (!command) {
      return this;
    }
    
    // execute the command's redo
    this.execute(command, 'redo');
    
    // update the index
    _index += 1;
  
    this.triggerEvent('redo', {'command': command});
    
    return this;    
  };
  
  this.clear = function () {
    var length = _commands.length;

    _commands = [];
    _index = -1;

    if(length > 0) {
      this.triggerEvent('clear');
    }

  };

  this.hasUndo = function(){
    return _index !== -1;
  };

  this.hasRedo = function(){
    return _index < (_commands.length - 1);
  };
});