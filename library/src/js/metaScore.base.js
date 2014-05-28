/*global global console*/

/**
* Defines the Class object
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Base = {
    inheritableStatics: [
      'inheritableStatics',
      'extend',
      'create'
    ],
    extend: function(options) {
      var cls, i, l, key;
      
      cls = function(){};
      
      cls.prototype = Object.create(this.prototype);
      cls.prototype.$super = this;
        
      // inherit statics
      if(this.hasOwnProperty('inheritableStatics')){
        for(i=0, l = this.inheritableStatics.length; i<l; i++){
          key = this.inheritableStatics[i];
          if(this.hasOwnProperty(key)){
            metaScore.Base.addStatic.call(cls, key, this[key]);
          }
        }
      }
      
      // set the class's properties
      for(key in options){
        if(options.hasOwnProperty(key)){
          if(key === 'statics'){
            metaScore.Base.addStatics.call(cls, options.statics);
          }
          else{
            metaScore.Base.addPrototype.call(cls, key, options[key]);
          }
        }
      }
      
      return cls;
      
    },
    create: function(){
      var obj = Object.create(this.prototype);
      
      if(typeof obj.init === 'function'){
        obj.init.apply(obj, arguments);
      }
      
      return obj;
    },
    addStatics: function(statics){
      var key, value;
    
      for(key in statics){
        if(statics.hasOwnProperty(key)){
          metaScore.Base.addStatic.call(this, key, statics[key]);
        }
      }    
    },
    addStatic: function(key, value){
      this[key] = value;
      
      if (typeof value === 'function') {
        this[key].$name = key;
      }
    },
    addPrototypes: function(prototypes){
      var key, value;
      
      for(key in prototypes){
        if(prototypes.hasOwnProperty(key)){
          metaScore.Base.addPrototype.call(this, key, prototypes[key]);
        }
      }    
    },
    addPrototype: function(key, value){
      this.prototype[key] = value;
      
      if (typeof value === 'function') {
        this.prototype[key].$name = key;
      }
    }
  };
  
  metaScore.Base.prototype = {
    callSuper: function(){
      var caller, caller_name,
        method;
    
      if(!this.$super){
        return;
      }
      
      caller = this.callSuper.caller;
      caller_name = caller.$name;
      
      if(caller_name && this.$super.prototype.hasOwnProperty(caller_name)){
        method = this.$super.prototype[caller_name];
      }
      else if(!caller_name && caller === this.constructor){ // it must be the constructor method
        method = this.$super.constructor;
      }
      
      if(method){
        method.apply(this, arguments);
      }
    
    },
    initConfig: function(configs){
      configs = configs || {};
    
      if(this.hasOwnProperty('defaults')){
        this.configs = metaScore.Object.extend({}, this.configs, this.defaults);
      }
      else{
        this.configs = configs;
      }
    }
  };
    
}(global));