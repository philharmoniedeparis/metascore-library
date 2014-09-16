/**
 * Undo
 *
 * @requires ../metaScore.evented.js
 */
 
metaScore.editor.History = (function(){
  
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
  
  History.prototype.execute = function(command, action) {  
    if (command && (action in command)) {      
      this.executing = true;        
      command[action](command);
      this.executing = false;
    }
    
    return this;
  };
  
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
  
  History.prototype.clear = function () {
    var length = this.commands.length;

    this.commands = [];
    this.index = -1;

    if(length > 0) {
      this.triggerEvent('clear');
    }

  };

  History.prototype.hasUndo = function(){
    return this.index !== -1;
  };

  History.prototype.hasRedo = function(){
    return this.index < (this.commands.length - 1);
  };
    
  return History;
  
})();