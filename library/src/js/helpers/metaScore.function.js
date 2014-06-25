/**
* Function
*/
metaScore.Function = metaScore.Base.extend(function(){});

/**
* Checks if a variable is of a certain type
* @param {mixed} the variable
* @param {string} the type to check against
* @returns {boolean} true if the variable is of the specified type, false otherwise
*/
metaScore.Function.proxy = function(fn, scope) {
  
  if (!metaScore.Var.type(fn, 'function')) {
    return undefined;
  }
  
  return function () {
    return fn.apply(scope || this, arguments);
  };
};

/**
* A reusable empty function
*/
metaScore.Function.emptyFn = function(){};