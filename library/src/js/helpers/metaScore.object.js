/*global metaScore*/

/**
* Object helper functions
*/
metaScore.Object = metaScore.Base.extend(function(){});

/**
* Merge the contents of two or more objects together into the first object.
* @returns {object} the target object extended with the properties of the other objects
*/
metaScore.Object.extend = function() {

  var target = arguments[0] || {},
    options,
    i = 1,
    length = arguments.length,
    key, src, copy;
    
  for (; i < length; i++ ) {
    if ((options = arguments[i]) != null) {
      for ( key in options ) {            
        src = target[key];
        copy = options[key];
        
        if(src !== copy && copy !== undefined ) {
          target[key] = copy;
        }
      }
    }
  }
    
  return target;

};

/**
* Return a copy of an object
* @param {object} the original object
* @returns {object} a copy of the original object
*/
metaScore.Object.copy = function(obj) {
    
  return metaScore.Object.extend({}, obj);

};

/**
* Call a function on each property of an object
* @param {object} the object
* @param {function} the function to call
* @param {object} the scope of the function
* @returns {void}
*/
metaScore.Object.each = function(obj, callback, scope) {

  var key, value,
    scope_provided = scope !== undefined;
  
  for (key in obj) {
    if (obj.hasOwnProperty(key)) {
      value = callback.call(scope_provided ? scope : obj[key], key, obj[key]);
    
      if (value === false) {
        break;
      }
    }
  }
  
  return obj;

};