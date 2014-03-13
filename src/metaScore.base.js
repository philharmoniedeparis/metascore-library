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
      
      cls = options.hasOwnProperty('constructor') ? options.constructor : function(){};
      
      cls.prototype = Object.create(this.prototype);
      cls.prototype.constructor = cls;
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
        
      // set the class's static properties
      if(options.hasOwnProperty('statics')){
        metaScore.Base.addStatics.call(cls, options.statics);
      }
      
      // set the class's prototype properties
      if(options.hasOwnProperty('prototypes')){
        metaScore.Base.addPrototypes.call(cls, options.prototypes);
      }
      
      return cls;
      
    },
    create: function(){
    
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
      
      if(caller_name && this.$super.hasOwnProperty(caller_name)){
        method = this.$super[caller_name];
      }
      else if(!caller_name && caller === this.constructor){ // it must be the constructor method
        method = this.$super.constructor;
      }
      
      if(method){
        method.apply(this, arguments);
      }
    
    }
  };
    
}(global));