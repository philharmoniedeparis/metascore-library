/*! metaScore - v0.0.1 - 2014-07-23 - Oussama Mubarak */
// These constants are used in the build process to enable or disable features in the
// compiled binary.  Here's how it works:  If you have a const defined like so:
//
//   const MY_FEATURE_IS_ENABLED = false;
//
// ...And the compiler (UglifyJS) sees this in your code:
//
//   if (MY_FEATURE_IS_ENABLED) {
//     doSomeStuff();
//   }
//
// ...Then the if statement (and everything in it) is removed - it is
// considered dead code.  If it's set to a truthy value:
//
//   const MY_FEATURE_IS_ENABLED = true;
//
// ...Then the compiler leaves the if (and everything in it) alone.
//
// If you add more consts here, you need to initialize them in metaScore.core.js
// to true.  So if you add:
//
//   const MY_FEATURE_IS_ENABLED = /* any value */;
//
// Then in metaScore.core.js you need to add:
//
//   if (typeof MY_AWESOME_FEATURE_IS_ENABLED === 'undefined') {
//     MY_FEATURE_IS_ENABLED = true;
//   }

if (typeof DEBUG === 'undefined') DEBUG = true;
;(function (global) {
"use strict";
/**
* Core
*/
var metaScore = {

  version: "0.0.1"
  
};
/**
 * Base Class
 *
 * @requires metaScore.core.js
 */
(function(metaScore){  
	//Helper method for creating an super copied object clone
	function initialize(method){
		//Recursivly execute parent methods.
		if(method.parent instanceof Function){
			initialize.apply(this,[method.parent]);
      
			this.super = cloneCopy(this,
				superCopy(this,this.constructor)
			);
		}
		method.apply(this, arguments);
	}

	//Helper method which allows for super referances.
	function cloneCopy(from, to){
		for(var x in from){
			if(x !== "super" && from[x] instanceof Function){
				//Never create circular super referances.
				to[x] = from[x].super || superCopy(from, from[x]);
			}
		}
		return to;
	}

	function superCopy(scope, method){
		var scopeSuper = scope.super;
    
		return method.super = function(){
			scope.super = scopeSuper;
			return method.apply(scope, arguments);
		};
	}

	//Create Class object
	metaScore.Base = function(){};
	metaScore.Base.extend = function ext(to){
		function child(){
			//Prevent the prototype scope set executing the constructor.
			if(initialize !== arguments[0]){
				//Create inhereted object
				initialize.apply(this,[to]);
				//Setup scope for class instance method calls
				cloneCopy(this,this);
				if(this.initializer instanceof Function){
					this.initializer.apply(this);
        }
				this.constructor.apply(this,arguments);
			}
		}

		//Set prototype and constructor enabeling propper type checking.
		child.prototype = new this(initialize);
		child.prototype.constructor = child;

		//Return expected result from toString
		child.toString = function(){
			return to.toString();
		};

		//Allow the child to be extended.
		child.extend = function(target){
			//Create parent referance and inherentence path.
			target.parent = to;
			return ext.apply(child,arguments);
		};

		return child;
	};
  
	//Bootstrap Class by inheriting itself with empty constructor.
  metaScore.Base = metaScore.Base.extend(function() {
    this.constructor = function(){};
    
    this.initConfig = function(configs){
      configs = configs || {};
    
      if(this.defaults){
        this.configs = metaScore.Object.extend({}, this.defaults, configs);
      }
      else{
        this.configs = configs;
      }
    };
  });
    
})(metaScore);
/**
 * Polyfills
 */
if(Element){
  (function(ElementPrototype) {
    ElementPrototype.matches = ElementPrototype.matchesSelector =
    ElementPrototype.matchesSelector || 
    ElementPrototype.webkitMatchesSelector ||
    ElementPrototype.mozMatchesSelector ||
    ElementPrototype.msMatchesSelector ||
    ElementPrototype.oMatchesSelector ||
    function (selector) {
      var nodes = (this.parentNode || this.document).querySelectorAll(selector), i = -1;
 
      while (nodes[++i] && nodes[i] !== this){}
 
      return !!nodes[i];
    };
  })(Element.prototype);
}
/**
 * Undo
 *
 * @requires metaScore.base.js
 */
 
metaScore.Evented = metaScore.Base.extend(function(){

  var _listeners = {};
  
  this.addListener = function(type, listener){
    if (typeof _listeners[type] === "undefined"){
      _listeners[type] = [];
    }

    _listeners[type].push(listener);
    
    return this;
  };

  this.removeListener = function(type, listener){
    if(_listeners[type] instanceof Array){
      var listeners = _listeners[type];
      for (var i=0, len=listeners.length; i < len; i++){
        if (listeners[i] === listener){
          listeners.splice(i, 1);
          break;
        }
      }
    }
    
    return this;
  };

  this.triggerEvent = function(type, data, bubbling, cancelable){
    var listeners, event;

    if (_listeners[type] instanceof Array){
      listeners = _listeners[type];
      
      event = {
        'target': this,
        'type': type,
        'detail': data,
        'bubbles': bubbling !== false,
        'cancelable': cancelable !== false
      };
      
      metaScore.Object.each(listeners, function(index, listener){
        listener.call(this, event);
      }, this);
    }
    
    return this;
  };
});
/**
 * Ajax
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.object.js
 * @requires metaScore.var.js
 */
metaScore.Ajax = metaScore.Base.extend(function(){});

/**
* Create an XMLHttp object
* @returns {object} the XMLHttp object
*/
metaScore.Ajax.createXHR = function() {

  var xhr, i, l,
    activeX = [
      "MSXML2.XMLHttp.5.0",
      "MSXML2.XMLHttp.4.0",
      "MSXML2.XMLHttp.3.0",
      "MSXML2.XMLHttp",
      "Microsoft.XMLHttp"
    ];

  if (typeof XMLHttpRequest !== "undefined") {
    xhr = new XMLHttpRequest();
    return xhr;
  }
  else if (window.ActiveXObject) {
    for (i = 0, l = activeX.length; i < l; i++) {
      try {
        xhr = new ActiveXObject(activeX[i]);
        return xhr;
      }
      catch (e) {}
    }
  }
  
  throw new Error("XMLHttp object could be created.");
  
};

/**
* Send an XMLHttp request
* @param {string} the url of the request
* @param {object} options to set for the request; see the defaults variable
* @returns {object} the XMLHttp object
*/
metaScore.Ajax.send = function(url, options) {

  var key,
    xhr = metaScore.Ajax.createXHR(),
    data, query = [],
    defaults = {
      'method': 'GET',
      'headers': [],
      'async': true,
      'data': {},
      'complete': null,
      'success': null,
      'error': null,
      'scope': this
    };
  
  options = metaScore.Object.extend(function(){}, defaults, options);
  
  metaScore.Object.each(options.data, function(key, value){
    query.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
  });
  
  if(options.method === 'POST'){
    data = query.join('&');
    options.headers['Content-type'] = 'application/x-www-form-urlencoded';
  }
  else{
    url += '?'+ query.join('&');
  }
  
  xhr.open(options.method, url, options.async);
  
  metaScore.Object.each(options.headers, function(key, value){
    xhr.setRequestHeader(key, value);
  });
  
  xhr.onreadystatechange = function() {        
    if (xhr.readyState === 4) {
      if(metaScore.Var.is(options.complete, 'function')){
        options.complete.call(options.scope, xhr);
      }
      if(xhr.status >= 200 && status < 300 || status === 304){
        if(metaScore.Var.is(options.success, 'function')){
          options.success.call(options.scope, xhr);
        }
      }
      else if(metaScore.Var.is(options.error, 'function')){
        options.error.call(options.scope, xhr);
      }
    }
  };
  
  xhr.send(data);
  
  return xhr;
  
};

/**
* Send an XMLHttp GET request
* @param {string} the url of the request
* @param {object} options to set for the request; see the defaults variable
* @returns {object} the XMLHttp object
*/
metaScore.Ajax.get = function(url, options) {
  
  metaScore.Object.extend(options, {'method': 'GET'});
  
  return metaScore.Ajax.send(url, options);
  
};

/**
* Send an XMLHttp POST request
* @param {string} the url of the request
* @param {object} options to set for the request; see the defaults variable
* @returns {object} the XMLHttp object
*/
metaScore.Ajax.post = function(url, options) {
  
  metaScore.Object.extend(options, {'method': 'POST'});
  
  return metaScore.Ajax.send(url, options);
  
};
/**
 * Array
 *
 * @requires ../metaScore.base.js
 */
metaScore.Array = metaScore.Base.extend(function(){});

/**
* Checks if a value is in an array
* @param {mixed} the value to check
* @param {array} the array
* @returns {number} the index of the value if found, -1 otherwise
*/
metaScore.Array.inArray = function (value, arr) {
  var len, i = 0;

  if(arr) {
    if(arr.indexOf){
      return arr.indexOf(value);
    }

    len = arr.length;

    for ( ; i < len; i++ ) {
      // Skip accessing in sparse arrays
      if ( i in arr && arr[i] === value ) {
        return i;
      }
    }
  }

  return -1;
};

/**
* Copies an array
* @param {array} the original array
* @returns {array} a copy of the array
*/
metaScore.Array.copy = function (arr) {
  return [].concat(arr);
};

/**
* Shuffles elements in an array
* @param {array} the original array
* @returns {array} a copy of the array with it's elements shuffled
*/
metaScore.Array.shuffle = function(arr) {

  var shuffled = metaScore.Array.copy(arr);

  shuffled.sort(function(){
    return ((Math.random() * 3) | 0) - 1;
  });

  return shuffled;

};

/**
* Return new array with duplicate values removed
* @param {array} the original array
* @returns {array} a copy of the array with the duplicate values removed
*/
metaScore.Array.unique = function(arr) {

  var unique = [];
  var length = arr.length;

  for(var i=0; i<length; i++) {
    for(var j=i+1; j<length; j++) {
      // If this[i] is found later in the array
      if (arr[i] === arr[j]){
        j = ++i;
      }
    }
    unique.push(arr[i]);
  }

  return unique;

};

/**
* Call a function on each element of an array
* @param {array} the array
* @param {function} the function to call
* @returns {array} a copy of the array
*/
metaScore.Array.each = function(arr, callback, scope) {

  var i = 0,
    l = arr.length,
    value,
    scope_provided = scope !== undefined;

  for(; i < l; i++) {
    value = callback.call(scope_provided ? scope : arr[i], i, arr[i]);
    
    if (value === false) {
      break;
    }
  }
  
  return arr;

};

/**
* Remove an element from an array
* @param {array} the array
* @param {mixed} the element to remove
* @returns {array} a copy of the array
*/
metaScore.Array.remove = function(arr, element){
  var index = metaScore.Array.inArray(element, arr);

  while(index > -1){
    arr.splice(index, 1);    
    index = metaScore.Array.inArray(element, arr);
  }
  
  return arr;
};
/**
 * Dom
 *
 * @requires ../metaScore.base.js
 * @requires ../metaScore.polyfill.js
 * @requires metaScore.array.js
 * @requires metaScore.object.js
 * @requires metaScore.var.js
 */
metaScore.Dom = metaScore.Base.extend(function(){

  this.constructor = function() {
  
    var elements;
  
    this.elements = [];
    
    if(arguments.length > 0){
      if(elements = metaScore.Dom.elementsFromString.apply(this, arguments)){
        this.add(elements);
        
        if(arguments.length > 1){
          this.attr(arguments[1]);
        }
      }
      else if(elements = metaScore.Dom.selectElements.apply(this, arguments)){      
        this.add(elements);
        
        if(arguments.length > 2){
          this.attr(arguments[2]);
        }
      }
    }
  };
  
  this.add = function(elements){
    if(elements.hasOwnProperty('length')){
      for(var i = 0; i < elements.length; i++ ) {
        this.elements.push(elements[i]);
      }
    }
    else{
      this.elements.push(elements);
    }
  };
  
  this.count = function(){
    return this.elements.length;
  };
  
  this.get = function(index){
    return this.elements[index];
  };
  
  this.filter = function(selector){
  
    var filtered = [];
    
    metaScore.Array.each(this.elements, function(index, element) {
      if(metaScore.Dom.is(element, selector)){
        filtered.push(element);
      }
    }, this);
  
    this.elements = filtered;
    
    return this;
  };
  
  this.index = function(selector){
  
    var found = -1;
    
    metaScore.Array.each(this.elements, function(index, element) {
      if(metaScore.Dom.is(element, selector)){
        found = index;
        return false;
      }
    }, this);
    
    return found;
  
  };
  
  this.child = function(selector){
  
    var children = new metaScore.Dom(),
     child;
  
    metaScore.Array.each(this.elements, function(index, element) {
      if(child = metaScore.Dom.selectElement.call(this, selector, element)){
        children.add(child);
        return false;
      }
    }, this);
    
    return children;
  
  };
  
  this.children = function(selector){
  
    var children = new metaScore.Dom();
  
    metaScore.Array.each(this.elements, function(index, element) {
      children.add(metaScore.Dom.selectElements.call(this, selector, element));
    }, this);
    
    return children;
  
  };
  
  this.parents = function(selector){
  
    var parents = new metaScore.Dom();
  
    metaScore.Array.each(this.elements, function(index, element) {
      parents.add(element.parentElement);
    }, this);
      
    if(selector){
      parents.filter(selector);
    }
    
    return parents;
  
  };
  
  this.addClass = function(className) {  
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.addClass(element, className);
    }, this);
    return this;        
  };
  
  this.removeClass = function(className) {  
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.removeClass(element, className);
    }, this);        
    return this;        
  };
  
  this.toggleClass = function(className, force) {  
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.toggleClass(element, className, force);
    }, this);        
    return this;        
  };
  
  this.addListener = function(type, callback, useCapture) {  
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.addListener(element, type, callback, useCapture);
    }, this);        
    return this;        
  };
  
  this.addDelegate = function(selector, type, callback, scope, useCapture) {
  
    scope = scope || this;
      
    return this.addListener(type, function(evt){
      if(metaScore.Dom.is(evt.target, selector)){
        callback.call(scope, evt);
      }
    }, useCapture);
    
  };
  
  this.removeListener = function(type, callback, useCapture) {  
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.removeListener(element, type, callback, useCapture);
    }, this);        
    return this;        
  };
  
  this.triggerEvent = function(type, data, bubbles, cancelable){
    var return_value = true;
  
    metaScore.Array.each(this.elements, function(index, element) {
      return_value = metaScore.Dom.triggerEvent(element, type, data, bubbles, cancelable) && return_value;
    }, this);
    
    return return_value;
  };
  
  this.text = function(value) {  
    if(value !== undefined){
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.text(element, value);
      }, this);
    }
    else{
      return metaScore.Dom.text(this.get(0));
    }
  };
  
  this.val = function(value) {
    if(value !== undefined){
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.val(element, value);
      }, this);
      return this;
    }
    else{
      return metaScore.Dom.val(this.get(0));
    }
  };
  
  this.attr = function(name, value) {
    if(value !== undefined || metaScore.Var.is(name, 'object')){
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.attr(element, name, value);
      }, this);
      return this;
    }
    else{
      return metaScore.Dom.attr(this.get(0), name);
    }
  };
  
  this.css = function(name, value) {
    if(value !== undefined){
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.css(element, name, value);
      }, this);
      return this;
    }
    else{
      return metaScore.Dom.css(this.get(0), name);
    }
  };
  
  this.data = function(name, value) {
    if(value !== undefined){
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.data(element, name, value);
      }, this);
      return this;
    }
    else{
      return metaScore.Dom.data(this.get(0), name);
    }
  };
  
  this.append = function(children){
    if(children instanceof metaScore.Dom){
      children = children.elements;
    }
    
    metaScore.Dom.append(this.get(0), children);
    
    return this;
  };
  
  this.appendTo = function(parent){    
    if(!(parent instanceof metaScore.Dom)){
      parent = new metaScore.Dom(parent);
    }
    
    parent = parent.get(0);
    
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.append(parent, element);
    }, this);
    
    return this;
  };
  
  this.show = function(){
    metaScore.Array.each(this.elements, function(index, element) {
      this.css('display', 'initial');
    }, this);
    return this;
  };
  
  this.hide = function(){
    metaScore.Array.each(this.elements, function(index, element) {
      this.css('display', 'none');
    }, this);
    return this;
  };
  
  this.remove = function(){
    if(this.triggerEvent('beforeremove') !== false){
      metaScore.Array.each(this.elements, function(index, element) {
        var parent = element.parentElement;
        metaScore.Dom.remove(element);
        metaScore.Dom.triggerEvent(parent, 'childremoved', {'child': element});
      }, this);
    }
    
    return this;
  };
  
  this.is = function(selector){
    var found;
  
    metaScore.Array.each(this.elements, function(index, element) {
      found = metaScore.Dom.is(element, selector);
      return found;
    }, this);
    
    return found;
  };
  
});


/********************
****** STATICS ******
********************/

/**
* Regular expression that matches an element's string
*/
metaScore.Dom.stringRe = /^<(.)+>$/;

/**
* Regular expression that matches dashed string for camelizing
*/
metaScore.Dom.camelRe = /-([\da-z])/gi;

/**
* Helper function used by the camel function
*/
metaScore.Dom.camelReplaceFn = function(all, letter) {
  return letter.toUpperCase();
};

/**
* Normaliz a string to Camel Case; used for CSS properties
* @param {string} the original string
* @returns {string} the normalized string
*/
metaScore.Dom.camel = function(str){
  return str.replace(metaScore.Dom.camelRe, metaScore.Dom.camelReplaceFn);
};

/**
* List of event that should generaly bubble up
*/
metaScore.Dom.bubbleEvents = {
  'click': true,
  'submit': true,
  'mousedown': true,
  'mousemove': true,
  'mouseup': true,
  'mouseover': true,
  'mouseout': true,
  'transitionend': true
};

/**
* Select a single element by selecor
* @param {string} the selector (you can exclude elements by using ":not()" such as "div.class1:not(.class2)")
* @param {object} an optional parent to constrain the matched elements 
* @returns {object} an HTML element
*/
metaScore.Dom.selectElement = function (selector, parent) {      
  var element;
  
  if(!parent){
    parent = document;
  }

  if (metaScore.Var.is(selector, 'string')) {
    element = parent.querySelector(selector);
  }
  else if (selector.length) {
    element = selector[0];
  }
  else {
    element = selector;
  }

  return element;
};

/**
* Select elements by selecor
* @param {string} the selector (you can exclude elements by using ":not()" such as "div.class1:not(.class2)")
* @param {object} an optional parent to constrain the matched elements 
* @returns {array} an array of HTML elements
*/
metaScore.Dom.selectElements = function (selector, parent) {      
  var elements;
  
  if(!parent){
    parent = document;
  }

  if (metaScore.Var.is(selector, 'string')) {
    elements = parent.querySelectorAll(selector);
  }
  else if (selector.length) {
    elements = selector;
  }
  else {
    elements = [selector];
  }

  return elements;
};

/**
* Creates elements from an HTML string (see http://krasimirtsonev.com/blog/article/Revealing-the-magic-how-to-properly-convert-HTML-string-to-a-DOM-element)
* @param {string} the HTML string
* @returns {object} an HTML element
*/
metaScore.Dom.elementsFromString = function(html){
  var wrapMap = {
      'option': [1, "<select multiple='multiple'>", "</select>"],
      'optgroup': [1, "<select multiple='multiple'>", "</select>"],
      'legend': [1, "<fieldset>", "</fieldset>"],
      'area': [1, "<map>", "</map>"],
      'param': [1, "<object>", "</object>"],
      'thead': [1, "<table>", "</table>"],
      'tbody': [1, "<table>", "</table>"],
      'tfoot': [1, "<table>", "</table>"],
      'colgroup': [1, "<table>", "</table>"],
      'caption': [1, "<table>", "</table>"],
      'tr': [2, "<table><tbody>", "</tbody></table>"],
      'col': [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
      'th': [3, "<table><tbody><tr>", "</tr></tbody></table>"],
      'td': [3, "<table><tbody><tr>", "</tr></tbody></table>"],
      '_default': [1, "<div>", "</div>" ]
    },
    element = document.createElement('div'),
    match = /<\s*\w.*?>/g.exec(html),
    tag, map, j;
    
  if(match != null){
    tag = match[0].replace(/</g, '').replace(/\/?>/g, '');
    
    map = wrapMap[tag] || wrapMap['_default'];
    html = map[1] + html + map[2];
    element.innerHTML = html;
    
    // Descend through wrappers to the right content
    j = map[0];
    while(j--) {
      element = element.lastChild;
    }
    
    return element.childNodes;
  }
  
  return null;
};

/**
* Checks if an element has a given class
* @param {object} the dom element
* @param {string} the class to check
* @returns {boolean} true if the element has the given class, false otherwise
*/     
metaScore.Dom.hasClass = function(element, className){
  return element.classList.contains(className);
};

/**
* Adds a given class to an element
* @param {object} the dom element
* @param {string} the class(es) to add; separated by a space
* @returns {void}
*/
metaScore.Dom.addClass = function(element, className){
  var classNames = className.split(" "),
    i = 0, l = classNames.length;
  
  for(; i<l; i++){
    element.classList.add(classNames[i]);
  }
};

/**
* Removes a given class from an element
* @param {object} the dom element
* @param {string} the class(es) to remove; separated by a space
* @returns {void}
*/
metaScore.Dom.removeClass = function(element, className){
  var classNames = className.split(" "),
    i = 0, l = classNames.length;
  
  for(; i<l; i++){
    element.classList.remove(classNames[i]);
  }
};

/**
* Toggles a given class on an element
* @param {object} the dom element
* @param {string} the class(es) to toggle; separated by a space
* @param {boolean} optional boolean; If true, the class will be added but not removed. If false, the class will be removed but not added.
* @returns {void}
*/
metaScore.Dom.toggleClass = function(element, className, force){
  var classNames = className.split(" "),
    i = 0, l = classNames.length;
  
  if(force === undefined){
    for(; i<l; i++){
      element.classList.toggle(classNames[i]);
    }
  }
  else{
    for(; i<l; i++){
      element.classList.toggle(classNames[i], force);
    }
  }
};

/**
* Add an event listener on an element
* @param {object} the dom element
* @param {string} the event type to register
* @param {function} the callback function
* @param {boolean} specifies the event phase (capturing or bubbling) to add the event handler for
* @returns {void}
*/
metaScore.Dom.addListener = function(element, type, callback, useCapture){
  if(useCapture === undefined){
    useCapture = metaScore.Dom.bubbleEvents.hasOwnProperty('type') ? metaScore.Dom.bubbleEvents[type] : false;
  }

  return element.addEventListener(type, callback, useCapture);
};

/**
* Remove an event listener from an element
* @param {object} the dom element
* @param {string} the event type to remove
* @param {function} the callback function
* @param {boolean} specifies the event phase (capturing or bubbling) to add the event handler for
* @returns {void}
*/
metaScore.Dom.removeListener = function(element, type, callback, useCapture){
  if(useCapture === undefined){
    useCapture = metaScore.Dom.bubbleEvents.hasOwnProperty('type') ? metaScore.Dom.bubbleEvents[type] : false;
  }
  
  return element.removeEventListener(type, callback, useCapture);
};

/**
* Trigger an event from an element
* @param {object} the dom element
* @param {string} the event type to trigger
* @param {boolean} whether the event should bubble
* @param {boolean} whether the event is cancelable
* @returns {boolean} false if at least one of the event handlers which handled this event called Event.preventDefault()
*/
metaScore.Dom.triggerEvent = function(element, type, data, bubbles, cancelable){  
  var event = new CustomEvent(type, {
    'detail': data,
    'bubbles': bubbles !== false,
    'cancelable': cancelable !== false
  });
  
  return element.dispatchEvent(event);
};

/**
* Sets or gets the innerHTML of an element
* @param {object} the dom element
* @param {string} an optional text to set
* @returns {string} the value of the innerHTML
*/
metaScore.Dom.text = function(element, value){
  if(value !== undefined){
    element.innerHTML = value;
  }
  
  return element.innerHTML;
};

/**
* Sets or gets the value of an element
* @param {object} the dom element
* @param {string} an optional value to set
* @returns {string} the value
*/
metaScore.Dom.val = function(element, value){
  if(value !== undefined){
    element.value = value;
  }
  
  return element.value;
};

/**
* Sets an attribute on an element
* @param {object} the dom element
* @param {string} the attribute's name
* @param {string} an optional value to set
* @returns {void}
*/
metaScore.Dom.attr = function(element, name, value){
  
  if(metaScore.Var.is(name, 'object')){
    metaScore.Object.each(name, function(key, value){
      metaScore.Dom.attr(element, key, value);
    }, this);
  }
  else{
    switch(name){
      case 'class':
        this.addClass(element, value);
        break;
        
      case 'text':
        this.text(element, value);
        break;
        
      default:
        if(value === null){
          element.removeAttribute(name);
        }
        else{
          if(value !== undefined){
            element.setAttribute(name, value);
          }
          
          return element.getAttribute(name);
        }
        break;
    }
  }
};

/**
* Sets or gets a style property of an element
* @param {object} the dom element
* @param {string} the property's name
* @param {string} an optional value to set
* @returns {string} the value of the property
*/
metaScore.Dom.css = function(element, name, value){
  var camel, style;

  camel = this.camel(name);

  if(value !== undefined){
    element.style[camel] = value;
  }
  
  style = window.getComputedStyle(element);
  
  return style.getPropertyValue(name);
};

/**
* Sets or gets a data string of an element
* @param {object} the dom element
* @param {string} the object's name
* @param {string} an optional value to set
* @returns {object} the object
*/
metaScore.Dom.data = function(element, name, value){
  name = this.camel(name);

  if(value === null){
    delete element.dataset[name];
  }
  else if(value !== undefined){
    element.dataset[name] = value;
  }
  
  return element.dataset[name];
};

/**
* Appends children to an element
* @param {object} the dom element
* @param {object/array} the child(ren) to append
* @returns {void}
*/
metaScore.Dom.append = function(element, children){
  if (!metaScore.Var.is(children, 'array')) {
    children = [children];
  }
  
  metaScore.Array.each(children, function(index, child){
    element.appendChild(child);
  }, this);
};

/**
* Removes an element from the dom
* @param {object} the dom element
* @returns {void}
*/
metaScore.Dom.remove = function(element){
  element.parentElement.removeChild(element);
};

/**
* Checks if an element matches a selector
* @param {object} the dom element
* @param {string} the selector
* @returns {boolean} true if the element matches the selector, false otherwise
*/
metaScore.Dom.is = function(element, selector){
  
  return element.matches(selector);
  
};
/**
 * Dom
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.dom.js
 */
metaScore.Draggable = metaScore.Base.extend(function(){

  var _target, _handle, _container,
    _startState;

  this.constructor = function(target, handle, container) {
  
    _target = target;
    _handle = handle;
    
    _container = container || new metaScore.Dom('body');
    
    this.enable();
  
  };
  
  this.onMouseDown = function(evt){
  
    _startState = {
      'left': parseInt(_target.css('left'), 10) - evt.clientX,
      'top': parseInt(_target.css('top'), 10) - evt.clientY
    };
    
    _container
      .addListener('mouseup', this.onMouseUp)
      .addListener('mousemove', this.onMouseMove);
    
    _target
      .addClass('dragging')
      .triggerEvent('dragstart', null, false, true);
    
    evt.stopPropagation();
    
  };
  
  this.onMouseMove = function(evt){
  
    var left = evt.clientX + _startState.left,
      top = evt.clientY + _startState.top;
    
    _target
      .css('left', left + 'px')
      .css('top', top + 'px')
      .triggerEvent('drag', null, false, true);
    
    evt.stopPropagation();
      
  };
  
  this.onMouseUp = function(evt){  
  
    _container
      .removeListener('mousemove', this.onMouseMove)
      .removeListener('mouseup', this.onMouseUp);
    
    _target
      .removeClass('dragging')
      .triggerEvent('dragend', null, false, true);
    
    evt.stopPropagation();
    
  };
  
  this.enable = function(){
  
    _target.addClass('draggable');
    
    _handle.addListener('mousedown', this.onMouseDown);
    
    return this;
  
  };
  
  this.disable = function(){
  
    _target.removeClass('draggable');
    
    _handle.removeListener('mousedown', this.onMouseDown);
    
    return this;
  
  };
  
  this.destroy = function(){
    
    this.disable();
    
    return this;
    
  };
});
/**
 * Function
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.var.js
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
/**
 * Object
 *
 * @requires ../metaScore.base.js
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
/**
 * Dom
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.dom.js
 */
metaScore.Resizable = metaScore.Base.extend(function(){

  var _target, _container, _handles,
    _startState;

  this.constructor = function(target, container) {
  
    _target = target;
    
    _container = container || new metaScore.Dom('body');
    
    _handles = {};
    
    _handles.top = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
      .data('direction', 'top')
      .appendTo(_target);
    
    _handles.right = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
      .data('direction', 'right')
      .appendTo(_target);
    
    _handles.bottom = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
      .data('direction', 'bottom')
      .appendTo(_target);
    
    _handles.left = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
      .data('direction', 'left')
      .appendTo(_target);
    
    _handles.top_left = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
      .data('direction', 'top-left')
      .appendTo(_target);
      
    _handles.top_right = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
      .data('direction', 'top-right')
      .appendTo(_target);
      
    _handles.bottom_left = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
      .data('direction', 'bottom-left')
      .appendTo(_target);
      
    _handles.bottom_right = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
      .data('direction', 'bottom-right')
      .appendTo(_target);
      
    this.enable();
  
  };
  
  this.onMouseDown = function(evt){
  
    _startState = {
      'handle': evt.target,
      'x': evt.clientX,
      'y': evt.clientY,
      'left': parseInt(_target.css('left'), 10),
      'top': parseInt(_target.css('top'), 10),
      'w': parseInt(_target.css('width'), 10),
      'h': parseInt(_target.css('height'), 10)
    };
    
    _container
      .addListener('mousemove', this.onMouseMove)
      .addListener('mouseup', this.onMouseUp);
    
    _target
      .addClass('resizing')
      .triggerEvent('resizestart', null, false, true);
    
    evt.stopPropagation();
      
  };

  this.onMouseMove = function(evt){
  
    var handle = new metaScore.Dom(_startState.handle),
      w, h, top, left;
    
    switch(handle.data('direction')){
      case 'top':
        h = _startState.h - evt.clientY + _startState.y;
        top = _startState.top + evt.clientY  - _startState.y;
        break;
      case 'right':
        w = _startState.w + evt.clientX - _startState.x;
        break;
      case 'bottom':
        h = _startState.h + evt.clientY - _startState.y;
        break;
      case 'left':
        w = _startState.w - evt.clientX + _startState.x;
        left = _startState.left + evt.clientX - _startState.x;
        break;
      case 'top-left':
        w = _startState.w - evt.clientX + _startState.x;
        h = _startState.h - evt.clientY + _startState.y;
        top = _startState.top + evt.clientY  - _startState.y;
        left = _startState.left + evt.clientX - _startState.x;
        break;
      case 'top-right':
        w = _startState.w + evt.clientX - _startState.x;
        h = _startState.h - evt.clientY + _startState.y;
        top = _startState.top + evt.clientY - _startState.y;
        break;
      case 'bottom-left':
        w = _startState.w - evt.clientX + _startState.x;
        h = _startState.h + evt.clientY - _startState.y;
        left = _startState.left + evt.clientX - _startState.x;
        break;
      case 'bottom-right':
        w = _startState.w + evt.clientX - _startState.x;
        h = _startState.h + evt.clientY - _startState.y;
        break;
    }
      
    if(top !== undefined){
      _target.css('top', top +'px');
    }
    if(left !== undefined){
      _target.css('left', left +'px');
    }
    
    _target
      .css('width', w +'px')
      .css('height', h +'px')
      .triggerEvent('resize', null, false, true);
    
    evt.stopPropagation();
    
  };

  this.onMouseUp = function(evt){
  
    _container
      .removeListener('mousemove', this.onMouseMove)
      .removeListener('mouseup', this.onMouseUp);
    
    _target
      .removeClass('resizing')
      .triggerEvent('resizeend', null, false, true);
    
    evt.stopPropagation();
  };
  
  this.enable = function(){
  
    metaScore.Object.each(_handles, function(index, handle){
      handle.addListener('mousedown', this.onMouseDown);
    }, this);
  
    _target.addClass('resizable');
    
    return this;
  
  };
  
  this.disable = function(){
  
    metaScore.Object.each(_handles, function(index, handle){
      handle.removeListener('mousedown', this.onMouseDown);
    }, this);
  
    _target.removeClass('resizable');
    
    return this;
  
  };
  
  this.destroy = function(){
  
    this.disable();
  
    metaScore.Object.each(_handles, function(index, handle){
      handle.remove();
    }, this);
    
    return this;
  
  };
});
/**
 * String
 *
 * @requires ../metaScore.base.js
 */
metaScore.String = metaScore.Base.extend(function(){});

/**
* Capitalize a string
* @param {string} the original string
* @returns {string} the capitalized string
*/
metaScore.String.capitalize = function(str){
  return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

/**
* Translate a string
* @param {string} the original string
* @param {object} string replacements
* @returns {string} the translated string
*/
metaScore.String.t = function(str, args){
  return metaScore.formatString(str, args);
};

/**
* Replace placeholders with sanitized values in a string.
* @param {string} the original string
* @param {object} string replacements
* @returns {string} the formatted string
*/
metaScore.formatString = function(str, args) {
  metaScore.Object.each(args, function(key, value){
    str = str.replace(key, args[key]);
  }, this);
  
  return str;
};

/**
* Generate a random uuid (see http://www.broofa.com/2008/09/javascript-uuid-function/)
* @param {number} the desired number of characters
* @param {number} the number of allowable values for each character
* @returns {string} a random uuid
*/
metaScore.String.uuid = function (len, radix) {
  var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
    uuid = [], i;
  
  radix = radix || chars.length;

  if (len) {
    // Compact form
    for (i = 0; i < len; i++){
      uuid[i] = chars[0 | Math.random() * radix];
    }
  }
  else {
    // rfc4122, version 4 form
    var r;

    // rfc4122 requires these characters
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
    uuid[14] = '4';

    // Fill in random data.  At i==19 set the high bits of clock sequence as
    // per rfc4122, sec. 4.1.5
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random()*16;
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
      }
    }
  }

  return uuid.join('');
};
/**
 * Variable
 *
 * @requires ../metaScore.base.js
 */
metaScore.Var = metaScore.Base.extend(function(){});

/**
* Helper object used by the type function
*/
metaScore.Var.classes2types = {
  "[object Boolean]": "boolean",
  "[object Number]": "number",
  "[object String]": "string",
  "[object Function]": "function",
  "[object Array]": "array",
  "[object Date]": "date",
  "[object RegExp]": "regexp",
  "[object Object]": "object"
};

/**
* Get the type of a variable
* @param {mixed} the variable
* @returns {string} the type
*/
metaScore.Var.type = function(obj) {
  return obj == null ? String(obj) : metaScore.Var.classes2types[ Object.prototype.toString.call(obj) ] || "object";
};

/**
* Checks if a variable is of a certain type
* @param {mixed} the variable
* @param {string} the type to check against
* @returns {boolean} true if the variable is of the specified type, false otherwise
*/
metaScore.Var.is = function(obj, type) {
  return metaScore.Var.type(obj) === type.toLowerCase();
};
/**
 * Editor
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires metaScore.editor.history.js
 * @requires metaScore.editor.mainmenu.js
 * @requires panel/metaScore.editor.panel.block.js
 * @requires panel/metaScore.editor.panel.page.js
 * @requires panel/metaScore.editor.panel.element.js
 * @requires ../player/metaScore.player.js
 */
metaScore.Editor = metaScore.Dom.extend(function(){

  var _workspace, _mainmenu,
    _sidebar,
    _block_panel, _page_panel, _element_panel,
    _player_wrapper, _player_head, _player_body, _player,
    _grid, _history;

  this.constructor = function(configs) {
  
    this.super('<div/>', {'class': 'metaScore-editor'});
  
    this.initConfig(configs);
    
    if(DEBUG){
      metaScore.Editor.instance = this;
    }
    
    if(this.configs.container){
      this.appendTo(this.configs.container);
    } 
  
    // add components
    
    _workspace = new metaScore.Dom('<div/>', {'class': 'workspace'}).appendTo(this);      
    _mainmenu = new metaScore.Editor.MainMenu().appendTo(this);     
    _sidebar =  new metaScore.Dom('<div/>', {'class': 'sidebar'}).appendTo(this);    
    _block_panel = new metaScore.Editor.Panel.Block().appendTo(_sidebar);
    _page_panel = new metaScore.Editor.Panel.Page().appendTo(_sidebar);
    _element_panel = new metaScore.Editor.Panel.Element().appendTo(_sidebar);
    _player_wrapper = new metaScore.Dom('<iframe/>', {'class': 'player-wrapper'}).appendTo(_workspace);
    _player_head = new metaScore.Dom(_player_wrapper.get(0).contentDocument.head);
    _player_body = new metaScore.Dom(_player_wrapper.get(0).contentDocument.body).addClass('metaScore-player-wrapper');
    _player = new metaScore.Player();
    _grid = new metaScore.Dom('<div/>', {'class': 'grid'}).appendTo(_workspace);
    _history = new metaScore.Editor.History();
    
    // add player style sheets
    
    if(this.configs.palyer_css){
      metaScore.Array.each(this.configs.palyer_css, function(index, url) {
        this.addPlayerCSS(url);
      }, this);
    }
      
    // add event listeners
    
    _mainmenu
      .addDelegate('button[data-action]:not(.disabled)', 'click', this.onMainmenuClick, this);
    
    _block_panel
      .addListener('blockset', this.onBlockSet)
      .addListener('blockunset', this.onBlockUnset)
      .addListener('valueschange', this.onBlockPanelValueChange)
      .getToolbar().addDelegate('.buttons [data-action]', 'click', this.onBlockPanelToolbarClick, this);
    
    _page_panel
      .addListener('pageset', this.onPageSet)
      .addListener('pageunset', this.onPageUnset)
      .getToolbar().addDelegate('.buttons [data-action]', 'click', this.onPagePanelToolbarClick, this);
    
    _element_panel
      .addListener('elementset', this.onElementSet)
      .getToolbar().addDelegate('.buttons [data-action]', 'click', this.onElementPanelToolbarClick, this);
    
    _player_body
      .addDelegate('.metaScore-block .element', 'elementclick', this.onElementClick, this)
      .addDelegate('.metaScore-block .page', 'pageclick', this.onPageClick, this)
      .addDelegate('.metaScore-block', 'blockclick', this.onBlockClick, this)
      .addListener('click', this.onPlayerClick)
      .addDelegate('.metaScore-block', 'pageactivated', this.onPageActivated, this)
      .addListener('childremoved', this.onPlayerChildRemoved)
      .addListener('keydown', this.onKeydown)
      .addListener('keyup', this.onKeyup);
      
    _history
      .addListener('add', this.onHistoryAdd)
      .addListener('undo', this.onHistoryUndo)
      .addListener('redo', this.onHistoryRedo);

    new metaScore.Dom('body')
      .addListener('keydown', this.onKeydown)
      .addListener('keyup', this.onKeyup);
      
      
    _block_panel.unsetBlock();
    
  };
  
  this.addPlayerCSS = function(url){
    new metaScore.Dom('<link/>', {'rel': 'stylesheet', 'type': 'text/css', 'href': url}).appendTo(_player_head);
  };
  
  this.addBlock = function(block){  
    if(!block){
      block = new metaScore.Player.Block();
      this.addPage(block);
    }
    
    block.appendTo(_player_body);
    _block_panel.setBlock(block);
        
    _history.add({
      'undo': metaScore.Function.proxy(function(){this.removeBlock(block);}, this),
      'redo': metaScore.Function.proxy(function(){this.addBlock(block);}, this)
    });
    
    return block;
  };
  
  this.removeBlock = function(block){
    block = block || _block_panel.getBlock();
  
    block.remove();
  };
  
  this.addPage = function(block){
    var page;
    
    block = block || _block_panel.getBlock();
      
    page = new metaScore.Player.Page();
      
    block.addPage(page);
    
    return page;
  };
  
  this.removePage = function(){
    var page;
    
    if(page = _page_panel.getPage()){
      page.remove();
    }
    
  };
  
  this.addElement = function(type, page){
    var element;
    
    page = page || _page_panel.getPage();
      
    element = new metaScore.Player.Element[type]();
      
    page.addElement(element);
    
    _element_panel.setElement(element);
    
    return element;
  };
  
  this.removeElement = function(){
    var element;
    
    if(element = _element_panel.getElement()){
      element.remove();
    }
    
  };
  
  this.onKeydown = function(evt){  
    switch(evt.keyCode){
      case 18: //alt
        _player_body.addClass('alt-down');
        break;
      case 90: //z
        if(evt.ctrlKey){
          _history.undo();
        }
        break;
      case 89: //y
        if(evt.ctrlKey){
          _history.redo();
        }
        break;
    }  
  };
  
  this.onKeyup = function(evt){
    switch(evt.keyCode){
      case 18: //alt
        _player_body.removeClass('alt-down');
        break;
    }
  };
  
  this.onMainmenuClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        break;
      case 'open':
        metaScore.Ajax.get(this.configs.api_url +'guide.json', {
          'success': function(xhr){
            console.log(JSON.parse(xhr.response));
          },
          'error': function(){
          }
        });
        break;
      case 'save':
        break;
      case 'download':
        break;
      case 'delete':
        break;
      case 'revert':
        break;
      case 'undo':
        _history.undo();
        break;
      case 'redo':
        _history.redo();
        break;
      case 'edit':
        break;
      case 'settings':
        break;
      case 'help':
        break;
    }
  };
  
  this.onBlockSet = function(evt){
    var block = evt.detail.block;
    
    _page_panel.setPage(block.getActivePage(), true);
    _page_panel.getMenu().enableItems('[data-action="new"]');
    _element_panel.getMenu().enableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  this.onBlockUnset = function(evt){
    _page_panel.unsetPage();
    _page_panel.getMenu().disableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  this.onBlockPanelValueChange = function(evt){
    var block = evt.detail.block,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;
     
    _history.add({
      'undo': function(cmd){_block_panel.updateBlockProperties(block, old_values);},
      'redo': function(cmd){_block_panel.updateBlockProperties(block, new_values);}
    });
  };
  
  this.onBlockPanelToolbarClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        this.addBlock();
        break;
        
      case 'delete':
        this.removeBlock();
        break;
    }
    
    evt.stopPropagation();
  };
  
  this.onPageSet = function(evt){
    var page = evt.detail.page,
      block = new metaScore.Player.Block(page.parents().parents().get(0));
    
    _block_panel.setBlock(block, true);
    _page_panel.getMenu().enableItems('[data-action="new"]');
    _element_panel.getMenu().enableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  this.onPageUnset = function(evt){
    _element_panel.unsetElement();
    _element_panel.getMenu().disableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  this.onPagePanelToolbarClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        this.addPage();
        break;
        
      case 'delete':
        this.removePage();
        break;
    }
    
    evt.stopPropagation();
  };
  
  this.onElementSet = function(evt){
    var element = evt.detail.element,
      page = new metaScore.Player.Page(element.parents().get(0)),
      block = new metaScore.Player.Block(page.parents().parents().get(0));
    
    _page_panel.setPage(page, true);
    _block_panel.setBlock(block, true);
      
    evt.stopPropagation();
  };
  
  this.onElementPanelToolbarClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        this.addElement(metaScore.Dom.data(evt.target, 'type'));
        break;
        
      case 'delete':
        this.removePage();
        break;
    }
    
    evt.stopPropagation();
  };
  
  this.onElementClick = function(evt){
    _element_panel.setElement(evt.detail.element);
    
    evt.stopPropagation();
  };
  
  this.onPageClick = function(evt){
    _page_panel.setPage(evt.detail.page);
    _element_panel.unsetElement();
    
    evt.stopPropagation();
  };
  
  this.onBlockClick = function(evt){
    _block_panel.setBlock(evt.detail.block);
    
    evt.stopPropagation();
  };
  
  this.onPlayerClick = function(evt){
    _block_panel.unsetBlock();
    
    evt.stopPropagation();
  };
  
  this.onPageActivated = function(evt){
    var page = evt.detail.page;
    
    _page_panel.setPage(page);
  };
  
  this.onPlayerChildRemoved = function(evt){
    var element = evt.detail.child,
      block;
  
    if(metaScore.Dom.is(element, '.page')){
      block = new metaScore.Player.Block(evt.target.parentElement);
    
      if(block.getPageCount() === 0){
        this.addPage(block);
      }
      
      block.setActivePage(0);
    }
    else if(metaScore.Dom.is(element, '.metaScore-block')){
      block = _block_panel.getBlock();
      if(block && (element === block.get(0))){
        _block_panel.unsetBlock();
      }
    }
  };
  
  this.onHistoryAdd = function(evt){
    _mainmenu.enableItems('[data-action="undo"]');
    _mainmenu.disableItems('[data-action="redo"]');
  };
  
  this.onHistoryUndo = function(evt){
    if(_history.hasUndo()){
      _mainmenu.enableItems('[data-action="undo"]');
    }
    else{
      _mainmenu.disableItems('[data-action="undo"]');
    }
    
    _mainmenu.enableItems('[data-action="redo"]');
  };
  
  this.onHistoryRedo = function(evt){
    if(_history.hasRedo()){
      _mainmenu.enableItems('[data-action="redo"]');
    }
    else{
      _mainmenu.disableItems('[data-action="redo"]');
    }
    
    _mainmenu.enableItems('[data-action="undo"]');
  };
});
/**
 * Button
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.Button = metaScore.Dom.extend(function(){

  var _label;
  
  /**
  * Keep track of the current state
  */
  this.disabled = false;
  
  this.defaults = {    
    /**
    * A text to add as a label
    */
    label: null
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    var btn = this;
    
    this.super('<button/>');
  
    this.initConfig(configs);
    
    if(this.configs.label){
      this.setLabel(this.configs.label);
    }
    
    this.addListener('click', function(evt){
      if(btn.disabled){
        evt.stopPropagation();
      }
    });
  };
  
  this.setLabel = function(text){
  
    if(_label === undefined){
      _label = new metaScore.Dom('<span/>', {'class': 'label'})
        .appendTo(this);
    }
    
    _label.text(text);
    
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  this.disable = function(){
    this.disabled = true;
    
    this.addClass('disabled');
    
    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  this.enable = function(){
    this.disabled = false;
    
    this.removeClass('disabled');
    
    return this;
  };
});
/**
 * DropDownMenu
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.DropDownMenu = metaScore.Dom.extend(function(){

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super('<ul/>', {'class': 'dropdown-menu'});
  
    this.initConfig(configs);
    
  };
  
  this.addItem = function(attr){
  
    var item = new metaScore.Dom('<li/>', attr)
      .appendTo(this);    
  
    return item;
  
  };
  
  this.enableItems = function(selector){
  
    var items = this.children(selector);
    
    items
      .removeListener('click', this.preventClick)
      .removeClass('disabled');
  
    return items;
  
  };
  
  this.disableItems = function(selector){
  
    var items = this.children(selector);
    
    items
      .addListener('click', this.preventClick)
      .addClass('disabled');
  
    return items;
  
  };
  
  this.preventClick = function(evt){
  
    evt.stopPropagation();
  
  };
});
/**
 * Field
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.Field = metaScore.Dom.extend(function(){
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
  };
  
  this.tag = '<input/>';
  
  this.attributes = {
    'type': 'text',
    'class': 'field'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super(this.tag, this.attributes);
  
    this.initConfig(configs);
    
    if(this.configs.value !== null){
      this.setValue(this.configs.value);
    }
    
    if(this.configs.disabled){
      this.disable();
    }
    
    this.addListener('change', this.onChange);
    
  };
  
  this.onChange = function(evt){
      
    this.value = this.val();
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  
  };
  
  this.setValue = function(val){
    
    this.val(val);    
  
  };

  /**
  * Disable the field
  * @returns {object} the XMLHttp object
  */
  this.disable = function(){
    this.disabled = true;
    
    this.addClass('disabled');
    this.attr('disabled', 'disabled');
    
    return this;
  };

  /**
  * Enable the field
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  this.enable = function(){
    this.disabled = false;
    
    this.removeClass('disabled');
    this.attr('disabled', null);
    
    return this;
  };
});
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
/**
 * MainMenu
 *
 * @requires metaScore.editor.button.js
 * @requires field/metaScore.editor.field.timefield.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
metaScore.Editor.MainMenu = metaScore.Dom.extend(function(){

  this.constructor = function() {
  
    this.super('<div/>', {'class': 'main-menu clearfix'});
    
    this.setupUI();
    
  };
  
  this.setupUI = function(){
  
    var left, right;
    
    left = new metaScore.Dom('<div/>', {'class': 'left'}).appendTo(this);
    right = new metaScore.Dom('<div/>', {'class': 'right'}).appendTo(this);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('New')
      })
      .data('action', 'new')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('Open')
      })
      .data('action', 'open')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('edit')
      })
      .data('action', 'edit')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('save')
      })
      .data('action', 'save')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('download')
      })
      .data('action', 'download')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('delete')
      })
      .data('action', 'delete')
      .appendTo(left);
    
    new metaScore.Editor.Field.TimeField()
      .attr({
        'title': metaScore.String.t('time')
      })
      .data('action', 'time')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('revert')
      })
      .data('action', 'revert')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('undo')
      })
      .data('action', 'undo')
      .appendTo(left);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('redo')
      })
      .data('action', 'redo')
      .appendTo(left);
      
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('settings')
      })
      .data('action', 'settings')
      .appendTo(right);
    
    new metaScore.Editor.Button()
      .attr({
        'title': metaScore.String.t('help')
      })
      .data('action', 'help')
      .appendTo(right);
    
  };
  
  this.enableItems = function(selector){
  
    var items = this.children(selector);
    
    items.removeClass('disabled');
  
    return items;
  
  };
  
  this.disableItems = function(selector){
  
    var items = this.children(selector);
    
    items.addClass('disabled');
  
    return items;
  
  };
});
/**
 * Overlay
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.Overlay = metaScore.Dom.extend(function(){

  var _draggable;
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    /**
    * The parent element in which the overlay will be appended
    */
    parent: '.metaScore-editor',
    
    /**
    * True to create a mask underneath that covers its parent and does not allow the user to interact with any other Components until this is dismissed
    */
    modal: true,
    
    /**
    * True to make this draggable
    */
    draggable: true
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super('<div/>', {'class': 'overlay clearfix'});
  
    this.initConfig(configs);
    
    if(this.configs.modal){
      this.mask = new metaScore.Dom('<div/>', {'class': 'overlay-mask'});
    }
    
    if(this.configs.draggable){
      _draggable = new metaScore.Draggable(this, this);
    }
    
  };
  
  this.show = function(){
    
    if(this.configs.modal){
      this.mask.appendTo(this.configs.parent);
    }
  
    this.appendTo(this.configs.parent);
    
  };
  
  this.hide = function(){
    
    if(this.configs.modal){
      this.mask.remove();
    }
  
    this.remove();
    
  };
});
/**
 * Panel
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.string.js
 * @requires ../helpers/metaScore.function.js
 */
metaScore.Editor.Panel = metaScore.Dom.extend(function(){

  var _toolbar, _contents,
    _fields = {};

  this.defaults = {
    /**
    * The panel's title
    */
    title: '',
    
    /**
    * The panel's fields
    */
    fields: {}
  };
  
  this.constructor = function(configs) {
  
    this.super('<div/>', {'class': 'panel'});
  
    this.initConfig(configs);
  
    _toolbar = new metaScore.Editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    _toolbar.getTitle()
      .addListener('click', this.toggleState);
    
    _contents = new metaScore.Dom('<table/>', {'class': 'fields'})
      .appendTo(this);
      
    this.setupFields();
    
  };
  
  this.setupFields = function(){
  
    var row, uuid, configs, field;
  
    metaScore.Object.each(this.configs.fields, function(key, value){
      
      row = new metaScore.Dom('<tr/>', {'class': 'field-wrapper '+ key}).appendTo(_contents);
    
      uuid = 'field-'+ metaScore.String.uuid(5);
      
      configs = value.configs || {};
      
      _fields[key] = field = new value.type(configs).attr('id', uuid);
      field.data('name', key);
      
      new metaScore.Dom('<td/>').appendTo(row).append(new metaScore.Dom('<label/>', {'text': value.label, 'for': uuid}));
      new metaScore.Dom('<td/>').appendTo(row).append(field);
      
    }, this);
  
  };
  
  this.getToolbar = function(){
    
    return _toolbar;
    
  };
  
  this.getField = function(key){
    
    if(key === undefined){
      return _fields;
    }
    
    return _fields[key];
    
  };
  
  this.enableFields = function(){
  
    metaScore.Object.each(_fields, function(key, field){
      field.enable();
    }, this);
    
  };
  
  this.disableFields = function(){
  
    metaScore.Object.each(_fields, function(key, field){
      field.disable();
    }, this);
    
  };
  
  this.showFields = function(keys){
  
    if(!keys){
      _contents.children('tr.field-wrapper').show();
    }
    else{
      _contents.children('tr.field-wrapper.'+ keys.join(', tr.field-wrapper.')).show();
    }
    
  };
  
  this.hideFields = function(keys){
  
    if(!keys){
      _contents.children('tr.field-wrapper').hide();
    }
    else{
      _contents.children('tr.field-wrapper.'+ keys.join(', tr.field-wrapper.')).hide();
    }
    
  };
  
  this.toggleState = function(evt){
    
    this.toggleClass('collapsed');
    
  };
});
/**
 * Toolbar
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.Editor.Toolbar = metaScore.Dom.extend(function(){

  var _title, _buttons;
  
  this.defaults = {    
    /**
    * A text to add as a title
    */
    title: null
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {    
    this.super('<div/>', {'class': 'toolbar clearfix'});
  
    this.initConfig(configs);
    
    _title = new metaScore.Dom('<div/>', {'class': 'title'})
      .appendTo(this);
    
    _buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);
      
    if(this.configs.title){
      _title.text(this.configs.title);
    }
  };
  
  this.getTitle = function(){
  
    return _title;
    
  };
  
  this.addButton = function(configs){
  
    return new metaScore.Editor.Button(configs)
      .appendTo(_buttons);
  
  };
});
/**
 * BooleanField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.BooleanField = metaScore.Editor.Field.extend(function(){

  this.defaults = {    
    /**
    * Defines the default value
    */
    value: true,
    
    /**
    * Defines the value when unchecked
    */
    unchecked_value: false,
    
    /**
    * Defines whether the field is checked by default
    */
    checked: false,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };
  
  this.attributes = {
    'type': 'checkbox',
    'class': 'field booleanfield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    this.super(configs);
    
    if(this.configs.checked){
      this.attr('checked', 'checked');
    }
    
  };
  
  this.onChange = function(evt){
      
    this.value = this.is(":checked") ? this.val() : this.configs.unchecked_value;
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  
  };
  
  this.setChecked = function(checked){
  
    this.attr('checked', checked ? 'checked' : '');
  
  };
});
/**
 * TimeField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.TimeField = metaScore.Editor.Field.extend(function(){
  
  // private vars
  var _hours, _minutes, _seconds, _centiseconds;
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: 0,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    /**
    * Defines the minimum value allowed
    */
    min: 0,
    
    /**
    * Defines the maximum value allowed
    */
    max: null
  };
  
  this.tag = '<div/>';
  
  this.attributes = {
    'class': 'field timefield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    _hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'});
    _minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'});
    _seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'});
    _centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'});
  
    this.super(configs);
    
    
    _hours.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    _minutes.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    _seconds.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'}).appendTo(this);
    
    _centiseconds.addListener('input', this.onInput).appendTo(this);
    
  };
  
  this.onInput = function(evt){
  
    var centiseconds_val = parseInt(_centiseconds.val(), 10),
      seconds_val = parseInt(_seconds.val(), 10),
      minutes_val = parseInt(_minutes.val(), 10),
      hours_val = parseInt(_hours.val(), 10);
      
    evt.stopPropagation();
    
    this.setValue((centiseconds_val * 10) + (seconds_val * 1000) + (minutes_val * 60000) + (hours_val * 3600000));
  };
  
  this.setValue = function(milliseconds){
      
    var centiseconds_val, seconds_val, minutes_val, hours_val;
    
    this.value = milliseconds;
    
    if(this.configs.min !== null){
      this.value = Math.max(this.value, this.configs.min);
    }
    if(this.configs.max !== null){
      this.value = Math.min(this.value, this.configs.max);
    }
      
    centiseconds_val = parseInt((this.value / 10) % 100, 10);
    seconds_val = parseInt((this.value / 1000) % 60, 10);
    minutes_val = parseInt((this.value / 60000) % 60, 10);
    hours_val = parseInt((this.value / 3600000), 10);
    
    _centiseconds.val(centiseconds_val);
    _seconds.val(seconds_val);
    _minutes.val(minutes_val);
    _hours.val(hours_val);
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  
  };
  
  this.getValue = function(){
  
    return this.value;
  
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  this.disable = function(){
    this.disabled = true;
    
    _hours.attr('disabled', 'disabled');
    _minutes.attr('disabled', 'disabled');
    _seconds.attr('disabled', 'disabled');
    _centiseconds.attr('disabled', 'disabled');
    
    this.addClass('disabled');
    
    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  this.enable = function(){
    this.disabled = false;
    
    _hours.attr('disabled', null);
    _minutes.attr('disabled', null);
    _seconds.attr('disabled', null);
    _centiseconds.attr('disabled', null);
    
    this.removeClass('disabled');
    
    return this;
  };
});
/**
 * ColorField
 *
 * @requires ../metaScore.editor.field.js
 * @requires ../../helpers/metaScore.object.js
 */
metaScore.Editor.Field.ColorField = metaScore.Editor.Field.extend(function(){

  // private vars
  var _button, _overlay,
    previous_value;
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: {
      r: 255,
      g: 255,
      b: 255,
      a: 1
    },
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };
  
  this.tag = '<div/>';
  
  this.attributes = {
    'class': 'field colorfield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    _button = new metaScore.Editor.Button()
      .addListener('click', this.onClick);
    
    _overlay = new metaScore.Editor.Overlay()
      .addClass('colorfield-overlay');
    
    _overlay.gradient = new metaScore.Dom('<div/>', {'class': 'gradient'}).appendTo(_overlay);
    _overlay.gradient.canvas = new metaScore.Dom('<canvas/>', {'width': '255', 'height': '255'})
      .addListener('click', this.onGradientClick)
      .addListener('mousedown', this.onGradientMousedown)
      .addListener('mouseup', this.onGradientMouseup)
      .appendTo(_overlay.gradient);
    _overlay.gradient.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(_overlay.gradient);
        
    _overlay.alpha = new metaScore.Dom('<div/>', {'class': 'alpha'}).appendTo(_overlay);
    _overlay.alpha.canvas = new metaScore.Dom('<canvas/>', {'width': '20', 'height': '255'})
      .addListener('click', this.onAlphaClick)
      .addListener('mousedown', this.onAlphaMousedown)
      .addListener('mouseup', this.onAlphaMouseup)
      .appendTo(_overlay.alpha);
    _overlay.alpha.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(_overlay.alpha);
    
    _overlay.controls = new metaScore.Dom('<div/>', {'class': 'controls'}).appendTo(_overlay);
    
    _overlay.controls.r = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'r'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'R', 'for': 'r'}))
      .append(_overlay.controls.r)
      .appendTo(_overlay.controls);
      
    _overlay.controls.g = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'g'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'G', 'for': 'g'}))
      .append(_overlay.controls.g)
      .appendTo(_overlay.controls);
      
    _overlay.controls.b = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'b'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'B', 'for': 'b'}))
      .append(_overlay.controls.b)
      .appendTo(_overlay.controls);
      
    _overlay.controls.a = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '1', 'step': '0.01', 'name': 'a'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'A', 'for': 'a'}))
      .append(_overlay.controls.a)
      .appendTo(_overlay.controls);
      
    _overlay.controls.current = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper current'})
      .append(_overlay.controls.current)
      .appendTo(_overlay.controls);
    
    _overlay.controls.previous = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper previous'})
      .append(_overlay.controls.previous)
      .appendTo(_overlay.controls);
      
    _overlay.controls.cancel = new metaScore.Editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', this.onCancelClick)
      .appendTo(_overlay.controls);
      
    _overlay.controls.apply = new metaScore.Editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', this.onApplyClick)
      .appendTo(_overlay.controls);
          
    _overlay.mask.addListener('click', this.onApplyClick);
    
    this.super(configs);
    
    new metaScore.Dom('<div/>', {'class': 'icon'})
      .appendTo(this);
    
    _button.appendTo(this);
    
    this.fillGradient();
    
  };
  
  this.setValue = function(val, refillAlpha, updatePositions, updateInputs){
  
    var hsv;
  
    this.value = this.value || {};
    
    if(!metaScore.Var.is(val, 'object')){
      val = this.parseColor(val);
    }
  
    if(val.hasOwnProperty('r')){
      this.value.r = parseInt(val.r, 10);
    }
    if(val.hasOwnProperty('g')){
      this.value.g = parseInt(val.g, 10);
    }
    if(val.hasOwnProperty('b')){
      this.value.b = parseInt(val.b, 10);
    }
    if(val.hasOwnProperty('a')){
      this.value.a = parseFloat(val.a);
    }
    
    if(refillAlpha !== false){
      this.fillAlpha();
    }
    
    if(updateInputs !== false){
      _overlay.controls.r.val(this.value.r);
      _overlay.controls.g.val(this.value.g);
      _overlay.controls.b.val(this.value.b);
      _overlay.controls.a.val(this.value.a);
    }
    
    if(updatePositions !== false){
      hsv = this.rgb2hsv(this.value);
      
      _overlay.gradient.position.css('left', ((1 - hsv.h) * 255) +'px');
      _overlay.gradient.position.css('top', (hsv.s * (255 / 2)) + ((1 - (hsv.v/255)) * (255/2)) +'px');
      
      _overlay.alpha.position.css('top', ((1 - this.value.a) * 255) +'px');
    }
    
    this.fillCurrent();
    
    _button.css('background-color', 'rgba('+ this.value.r +','+ this.value.g +','+ this.value.b +','+ this.value.a +')');
  
  };
  
  this.onClick = function(evt){
  
    if(this.disabled){
      return;
    }
  
    previous_value = metaScore.Object.copy(this.value);
    
    this.fillPrevious();
  
    _overlay.show();
  
  };
  
  this.onControlInput = function(evt){
  
    var rgba, hsv;
    
    this.setValue({
      'r': _overlay.controls.r.val(),
      'g': _overlay.controls.g.val(),
      'b': _overlay.controls.b.val(),
      'a': _overlay.controls.a.val()
    }, true, true, false);
  
  };
  
  this.onCancelClick = function(evt){
  
    this.setValue(previous_value);
    _overlay.hide();
  
    evt.stopPropagation();
  };
  
  this.onApplyClick = function(evt){
  
    _overlay.hide();
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  
    evt.stopPropagation();
  };
  
  this.fillPrevious = function(){
  
    var context = _overlay.controls.previous.get(0).getContext('2d');
    
    context.fillStyle = "rgba("+ previous_value.r +","+ previous_value.g +","+ previous_value.b +","+ previous_value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  
  };
  
  this.fillCurrent = function(){
  
    var context = _overlay.controls.current.get(0).getContext('2d');
    
    context.fillStyle = "rgba("+ this.value.r +","+ this.value.g +","+ this.value.b +","+ this.value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  
  };
  
  this.fillGradient = function(){
  
    var context = _overlay.gradient.canvas.get(0).getContext('2d'),
      fill;
      
    // Create color gradient
    fill = context.createLinearGradient(0, 0, context.canvas.width, 0);
    fill.addColorStop(0, "rgb(255, 0, 0)");
    fill.addColorStop(0.15, "rgb(255, 0, 255)");
    fill.addColorStop(0.33, "rgb(0, 0, 255)");
    fill.addColorStop(0.49, "rgb(0, 255, 255)");
    fill.addColorStop(0.67, "rgb(0, 255, 0)");
    fill.addColorStop(0.84, "rgb(255, 255, 0)");
    fill.addColorStop(1, "rgb(255, 0, 0)");
   
    // Apply gradient to canvas
    context.fillStyle = fill;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    
    // Create semi transparent gradient (white -> trans. -> black)
    fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
    fill.addColorStop(0, "rgba(255, 255, 255, 1)");
    fill.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    fill.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    fill.addColorStop(1, "rgba(0, 0, 0, 1)");
   
    // Apply gradient to canvas
    context.fillStyle = fill;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  
  };
  
  this.fillAlpha = function(){
  
    var context = _overlay.alpha.canvas.get(0).getContext('2d'),
      fill;
      
    // Create color gradient
    fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
    fill.addColorStop(0, "rgb("+ this.value.r +","+ this.value.g +","+ this.value.b +")");
    fill.addColorStop(1, "transparent");
   
    // Apply gradient to canvas
    context.fillStyle = fill;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    
  };
  
  this.onGradientMousedown = function(evt){   
    _overlay.gradient.canvas.addListener('mousemove', this.onGradientMousemove);
    
    evt.stopPropagation();
  };
  
  this.onGradientMouseup = function(evt){
    _overlay.gradient.canvas.removeListener('mousemove', this.onGradientMousemove);
    
    evt.stopPropagation();
  };
  
  this.onGradientClick = this.onGradientMousemove = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorX = evt.pageX - offset.left,
      colorY = evt.pageY - offset.top,
      context = _overlay.gradient.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(colorX, colorY, 1, 1),
      value = this.value;
      
    _overlay.gradient.position.css('left', colorX +'px');
    _overlay.gradient.position.css('top', colorY +'px');
    
    value.r = imageData.data[0];
    value.g = imageData.data[1];
    value.b =  imageData.data[2];
    
    this.setValue(value, true, false);
    
    evt.stopPropagation();
  };
  
  this.onAlphaMousedown = function(evt){   
    _overlay.alpha.canvas.addListener('mousemove', this.onAlphaMousemove);
    
    evt.stopPropagation();
  };
  
  this.onAlphaMouseup = function(evt){
    _overlay.alpha.canvas.removeListener('mousemove', this.onAlphaMousemove);
    
    evt.stopPropagation();
  };
  
  this.onAlphaClick = this.onAlphaMousemove = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorY = evt.pageY - offset.top,
      context = _overlay.alpha.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(0, colorY, 1, 1),
      value = this.value;
      
    _overlay.alpha.position.css('top', colorY +'px');
    
    value.a = Math.round(imageData.data[3] / 255 * 100) / 100;
    
    this.setValue(value, false, false);
    
    evt.stopPropagation();
  };
  
  this.rgb2hsv = function (rgb){
    
    var r = rgb.r, g = rgb.g, b = rgb.b,
      max = Math.max(r, g, b),
      min = Math.min(r, g, b),
      d = max - min,
      h, s, v;
      
    s = max === 0 ? 0 : d / max;
    v = max;

    if(max === min) {
      h = 0; // achromatic
    }
    else {
      switch(max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
          
        case g:
          h = (b - r) / d + 2;
          break;
          
        case b:
          h = (r - g) / d + 4;
          break;
      }
      
      h /= 6;
    }
    
    return {
      'h': h,
      's': s,
      'v': v
    };
  };
  
  this.parseColor = function(color){
 
    var rgba = {}, matches;
      
    color = color.replace(/\s\s*/g,''); // Remove all spaces
    
    // Checks for 6 digit hex and converts string to integer
    if (matches = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color)){
      rgba.r = parseInt(matches[1], 16);
      rgba.g = parseInt(matches[2], 16);
      rgba.b = parseInt(matches[3], 16);
      rgba.a = 1;
    }
        
    // Checks for 3 digit hex and converts string to integer
    else if (matches = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color)){
      rgba.r = parseInt(matches[1], 16) * 17;
      rgba.g = parseInt(matches[2], 16) * 17;
      rgba.b = parseInt(matches[3], 16) * 17;
      rgba.a = 1;
    }
        
    // Checks for rgba and converts string to
    // integer/float using unary + operator to save bytes
    else if (matches = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color)){
      rgba.r = +matches[1];
      rgba.g = +matches[2];
      rgba.b = +matches[3];
      rgba.a = +matches[4];
    }
        
    // Checks for rgb and converts string to
    // integer/float using unary + operator to save bytes
    else if (matches = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color)){
      rgba.r = +matches[1];
      rgba.g = +matches[2];
      rgba.b = +matches[3];
      rgba.a = 1;
    }
    
    return rgba;
  };
});
/**
 * CornerField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.CornerField = metaScore.Editor.Field.extend(function(){
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    this.super(configs);
    
  };
});
/**
 * ImageField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.ImageField = metaScore.Editor.Field.extend(function(){

  // private vars
  var _file;
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };
  
  this.attributes = {
    'type': 'file',
    'class': 'field imagefield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    this.super(configs);

    this.addListener('change', this.onFileSelect, false);
    
  };
  
  this.setValue = function(val, triggerChange){
  
    this.value = val;
    
    if(triggerChange !== false){
      this.triggerEvent('valuechange', {'field': this, 'value': this.value}, false, true);
    }
  
  };
  
  this.onFileSelect = function(evt) {
  
    var files = evt.target.files;
  
    if(files.length > 0 && files[0].type.match('image.*')){
      _file = files[0];
    }
    else{
      _file = null;
    }
    
    /*this.getBase64(function(result){
      this.setValue(result);
    });*/
    
  };
  
  this.getBase64 = function(callback){
  
    var reader;
  
    if(_file){
      reader = new FileReader();
      reader.onload = metaScore.Function.proxy(function(evt){
        callback.call(this, evt.target.result, evt);
      }, this);
      reader.readAsDataURL(_file);
    }
  
  };
});
/**
 * IntegerField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.IntegerField = metaScore.Editor.Field.extend(function(){
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: 0,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    /**
    * Defines the minimum value allowed
    */
    min: null,
    
    /**
    * Defines the maximum value allowed
    */
    max: null
  };
  
  this.attributes = {
    'type': 'number',
    'class': 'field integerfield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    this.super(configs);
    
  };
});
/**
 * SelectField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.SelectField = metaScore.Editor.Field.extend(function(){
  
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    /**
    * Defines the maximum value allowed
    */
    options: {}
  };
  
  this.tag = '<select/>';
  
  this.attributes = {
    'class': 'field selectfield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super(configs);
    
    this.setOptions(this.configs.options);
    
  };
  
  this.setOptions = function(options){
  
    metaScore.Object.each(options, function(key, value){    
      this.append(new metaScore.Dom('<option/>', {'text': value, 'value': key}));
    }, this);
    
  };
  
  this.setValue = function(value){
    
    this.val(value);
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  
  };
  
  this.getValue = function(){
  
    return this.value;
  
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  this.disable = function(){
    this.disabled = true;
    
    this
      .attr('disabled', 'disabled')
      .addClass('disabled');
    
    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  this.enable = function(){
    this.disabled = false;
    
    this
      .attr('disabled', null)
      .removeClass('disabled');
    
    return this;
  };
});
/**
 * TimeField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.TimeField = metaScore.Editor.Field.extend(function(){
  
  // private vars
  var _hours, _minutes, _seconds, _centiseconds;
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: 0,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    /**
    * Defines the minimum value allowed
    */
    min: 0,
    
    /**
    * Defines the maximum value allowed
    */
    max: null
  };
  
  this.tag = '<div/>';
  
  this.attributes = {
    'class': 'field timefield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    _hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'});
    _minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'});
    _seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'});
    _centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'});
  
    this.super(configs);
    
    
    _hours.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    _minutes.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    _seconds.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'}).appendTo(this);
    
    _centiseconds.addListener('input', this.onInput).appendTo(this);
    
  };
  
  this.onInput = function(evt){
  
    var centiseconds_val = parseInt(_centiseconds.val(), 10),
      seconds_val = parseInt(_seconds.val(), 10),
      minutes_val = parseInt(_minutes.val(), 10),
      hours_val = parseInt(_hours.val(), 10);
      
    evt.stopPropagation();
    
    this.setValue((centiseconds_val * 10) + (seconds_val * 1000) + (minutes_val * 60000) + (hours_val * 3600000));
  };
  
  this.setValue = function(milliseconds){
      
    var centiseconds_val, seconds_val, minutes_val, hours_val;
    
    this.value = milliseconds;
    
    if(this.configs.min !== null){
      this.value = Math.max(this.value, this.configs.min);
    }
    if(this.configs.max !== null){
      this.value = Math.min(this.value, this.configs.max);
    }
      
    centiseconds_val = parseInt((this.value / 10) % 100, 10);
    seconds_val = parseInt((this.value / 1000) % 60, 10);
    minutes_val = parseInt((this.value / 60000) % 60, 10);
    hours_val = parseInt((this.value / 3600000), 10);
    
    _centiseconds.val(centiseconds_val);
    _seconds.val(seconds_val);
    _minutes.val(minutes_val);
    _hours.val(hours_val);
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  
  };
  
  this.getValue = function(){
  
    return this.value;
  
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  this.disable = function(){
    this.disabled = true;
    
    _hours.attr('disabled', 'disabled');
    _minutes.attr('disabled', 'disabled');
    _seconds.attr('disabled', 'disabled');
    _centiseconds.attr('disabled', 'disabled');
    
    this.addClass('disabled');
    
    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  this.enable = function(){
    this.disabled = false;
    
    _hours.attr('disabled', null);
    _minutes.attr('disabled', null);
    _seconds.attr('disabled', null);
    _centiseconds.attr('disabled', null);
    
    this.removeClass('disabled');
    
    return this;
  };
});
/**
 * Block
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.integerfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.booleanfield.js
 * @requires ../../helpers/metaScore.string.js
 * @requires ../../helpers/metaScore.resizable.js
 * @requires ../../helpers/metaScore.resizable.js
 */
metaScore.Editor.Panel.Block = metaScore.Editor.Panel.extend(function(){

  var _menu, _block;

  this.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Block'),
    
    /**
    * The panel's fields
    */
    fields: {
      'x': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('X')
      },
      'y': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Y')
      },
      'width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Width')
      },
      'height': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Height')
      },
      'bg-color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': metaScore.String.t('Background color')
      },
      'bg-image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': metaScore.String.t('Background image')
      },
      'synched': {
        'type': metaScore.Editor.Field.BooleanField,
        'label': metaScore.String.t('Synchronized pages ?')
      }
    }
  };
  
  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super(configs);
    
    _menu = new metaScore.Editor.DropDownMenu();
    _menu.addItem({'text': metaScore.String.t('Add a new block'), 'data-action': 'new'});
    _menu.addItem({'text': metaScore.String.t('Delete the active block'), 'data-action': 'delete'});
    
    this.getToolbar().addButton()
      .data('action', 'menu')
      .append(_menu);
      
    this.addDelegate('.field', 'valuechange', this.onFieldValueChange);
    
  };
  
  this.getMenu = function(){
  
    return _menu;
  
  };
  
  this.getBlock = function(){
  
    return _block;
  
  };
  
  this.setBlock = function(block, supressEvent){
  
    if(_block && (_block.get(0) === block.get(0))){
      return;
    }
    
    this.unsetBlock(supressEvent);
    
    this.enableFields();
    this.updateFieldValues(block);  
    this.getMenu().enableItems('[data-action="delete"]');
    
    block._draggable = new metaScore.Draggable(block, block.child('.pager'), block.parents()).enable();
    block._resizable = new metaScore.Resizable(block, block.parents()).enable();
    
    block
      .addListener('dragstart', this.onBlockDragStart)
      .addListener('dragend', this.onBlockDragEnd)
      .addListener('resizestart', this.onBlockResizeStart)
      .addListener('resizeend', this.onBlockResizeEnd)
      .addClass('selected');
      
    if(supressEvent !== true){
      this.triggerEvent('blockset', {'block': block});
    }
    
    _block = block;
    
    return this;
    
  };
  
  this.unsetBlock = function(supressEvent){
  
    var block = this.getBlock();
      
    this.disableFields();    
    this.getMenu().disableItems('[data-action="delete"]');
    
    if(block){
      block._draggable.destroy();
      delete block._draggable;
      
      block._resizable.destroy();
      delete block._resizable;
  
      block
        .removeListener('dragstart', this.onBlockDragStart)
        .removeListener('dragend', this.onBlockDragEnd)
        .removeListener('resizestart', this.onBlockResizeStart)
        .removeListener('resizeend', this.onBlockResizeEnd)
        .removeClass('selected');
      
      _block = null;
    }
      
    if(supressEvent !== true){
      this.triggerEvent('blockunset', {'block': block});
    }
    
    return this;
    
  };
  
  this.onBlockDragStart = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y'];
    
    this.beforeDragValues = this.getValues(block, fields);
  };
  
  this.onBlockDragEnd = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y'];
    
    this.updateFieldValues(block, fields, true);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': this.beforeDragValues, 'new_values': this.getValues(block, fields)});
    
    delete this.beforeDragValues;
  };
  
  this.onBlockResizeStart = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.beforeResizeValues = this.getValues(block, fields);
  };
  
  this.onBlockResizeEnd = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.updateFieldValues(block, fields, true);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': this.beforeResizeValues, 'new_values': this.getValues(block, fields)});
    
    delete this.beforeResizeValues;
  };
  
  this.onFieldValueChange = function(evt){
    var block = this.getBlock(),
      field, value, old_values;
      
    if(!block){
      return;
    }
    
    field = evt.detail.field.data('name');
    value = evt.detail.value;
    old_values = this.getValues(block, [field]);
    
    this.updateBlockProperty(block, field, value);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': old_values, 'new_values': this.getValues(block, [field])});
  };
  
  this.updateFieldValue = function(name, value, supressEvent){
    var field = this.getField(name);
    
    switch(name){
      case 'x':
      case 'y':
      case 'width':
      case 'height':
      case 'bg-color':
        field.setValue(value);
        break;
      case 'bg-image':
        // TODO
        break;
      case 'synched':
        field.setChecked(value);
        break;
    }
    
    if(supressEvent !== true){
      field.triggerEvent('change');
    }
  };
  
  this.updateFieldValues = function(block, values, supressEvent){
  
    if(block !== this.getBlock()){
      return;
    }
  
    values = values || this.getValues(block, Object.keys(this.getField()));
    
    if(metaScore.Var.is(values, 'array')){
      metaScore.Array.each(values, function(index, field){
        this.updateFieldValue(field, this.getValue(block, field), supressEvent);
      }, this);
    }
    else{
      metaScore.Object.each(values, function(field, value){
        this.updateFieldValue(field, value, supressEvent);
      }, this);
    }
  };
  
  this.updateBlockProperty = function(block, name, value){
  
    switch(name){
      case 'x':
        block.css('left', value +'px');
        break;
      case 'y':
        block.css('top', value +'px');
        break;
      case 'width':
        block.css('width', value +'px');
        break;
      case 'height':
        block.css('height', value +'px');
        break;
      case 'bg-color':
        block.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg-image':
        // TODO
        break;
      case 'synched':
        block.data('synched', value);
        break;
    }
  
  };
  
  this.updateBlockProperties = function(block, values){
  
    metaScore.Object.each(values, function(name, value){
      this.updateBlockProperty(block, name, value);
    }, this);
    
    this.updateFieldValues(block, values, true);
  
  };
  
  this.getValue = function(block, name){
  
    var value;
  
    switch(name){
      case 'x':
        value = parseInt(block.css('left'), 10);
        break;
      case 'y':
        value = parseInt(block.css('top'), 10);
        break;
      case 'width':
       value = parseInt(block.css('width'), 10);
        break;
      case 'height':
        value = parseInt(block.css('height'), 10);
        break;
      case 'bg-color':
        value = block.css('background-color');
        break;
      case 'bg-image':
        // TODO
        break;
      case 'synched':
        value = block.data('synched') === "true";
        break;
    }
    
    return value;
  
  };
  
  this.getValues = function(block, fields){
  
    var values = {};
    
    fields = fields || Object.keys(this.getField());
    
    metaScore.Array.each(fields, function(index, field){
      values[field] = this.getValue(block, field);
    }, this);
    
    return values;  
  };
  
  
});
/**
 * Element
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.integerfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.cornerfield.js
 * @requires ../field/metaScore.editor.field.timefield.js
 * @requires ../field/metaScore.editor.field.selectfield.js
 */
metaScore.Editor.Panel.Element = metaScore.Editor.Panel.extend(function(){

  var _menu, _element;

  this.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Element'),
    
    /**
    * The panel's fields
    */
    fields: {
      'x': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('X')
      },
      'y': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Y')
      },
      'width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Width')
      },
      'height': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Height')
      },
      'r-index': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Reading index'),
        'configs': {
          'min': 0
        }
      },
      'z-index': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Display index')
      },
      'bg-color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': metaScore.String.t('Background color')
      },
      'bg-image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': metaScore.String.t('Background image')
      },
      'border-width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': metaScore.String.t('Border width')
      },
      'border-color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': metaScore.String.t('Border color')
      },
      'rounded-conrners': {
        'type': metaScore.Editor.Field.CornerField,
        'label': metaScore.String.t('Rounded conrners')
      },
      'start-time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': metaScore.String.t('Start time')
      },
      'end-time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': metaScore.String.t('End time')
      },
      'font-family': {
        'type': metaScore.Editor.Field.SelectField,
        'configs': {
          'options': {
            'Georgia, serif': 'Georgia',
            '"Times New Roman", Times, serif': 'Times New Roman',
            'Arial, Helvetica, sans-serif': 'Arial',
            '"Comic Sans MS", cursive, sans-serif': 'Comic Sans MS',
            'Impact, Charcoal, sans-serif': 'Impact',
            '"Lucida Sans Unicode", "Lucida Grande", sans-serif': 'Lucida Sans Unicode',
            'Tahoma, Geneva, sans-serif': 'Tahoma',
            'Verdana, Geneva, sans-serif': 'Verdana',
            '"Courier New", Courier, monospace': 'Courier New',
            '"Lucida Console", Monaco, monospace': 'Lucida Console'
          }
        },
        'label': metaScore.String.t('Font')
      }
    }
  };
  
  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    var toolbar;
  
    this.super(configs);
    
    toolbar = this.getToolbar();
    
    toolbar.addButton().data('action', 'previous');
    toolbar.addButton().data('action', 'next');
    
    _menu = new metaScore.Editor.DropDownMenu();
    _menu.addItem({'text': metaScore.String.t('Add a new cursor'), 'data-action': 'new', 'data-type': 'Cursor'});
    _menu.addItem({'text': metaScore.String.t('Add a new image'), 'data-action': 'new', 'data-type': 'Image'});
    _menu.addItem({'text': metaScore.String.t('Add a new text element'), 'data-action': 'new', 'data-type': 'Text'});
    _menu.addItem({'text': metaScore.String.t('Delete the active element'), 'data-action': 'delete'});
    
    toolbar.addButton()
      .data('action', 'menu')
      .append(_menu);
      
    this.addDelegate('.field', 'valuechange', this.onFieldValueChange);
    
  };
  
  this.getMenu = function(){
  
    return _menu;
  
  };
  
  this.getElement = function(){
  
    return _element;
  
  };
  
  this.setElement = function(element, supressEvent){
  
    if(_element && (_element.get(0) === element.get(0))){
      return;
    }
    
    this.unsetElement(_element, supressEvent);
    
    _element = element;
    
    this.updateValues();      
    this.enableFields();
    this.getMenu().enableItems('[data-action="delete"]');
    
    _element._draggable = new metaScore.Draggable(_element, _element, _element.parents()).enable();
    _element._resizable = new metaScore.Resizable(_element, _element.parents()).enable();
    
    _element
      .addListener('drag', this.onElementDrag)
      .addListener('resize', this.onElementResize)
      .addClass('selected');
    
    switch(_element.data('type')){
      case 'cursor':
        break;
      case 'image':
        break;
      case 'text':
        _element.attr('contenteditable', 'true');
        break;
    }
    
    if(supressEvent !== true){
      this.triggerEvent('elementset', {'element': _element});
    }
    
    return this;
    
  };
  
  this.unsetElement = function(element, supressEvent){
  
    element = element || this.getElement();
      
    this.disableFields();
    this.getMenu().disableItems('[data-action="delete"]');
  
    if(element){
      element._draggable.destroy();
      delete element._draggable;
      
      element._resizable.destroy();
      delete element._resizable;
  
      element
        .removeListener('drag', this.onElementDrag)
        .removeListener('resize', this.onElementResize)
        .removeClass('selected');
    
      switch(_element.data('type')){
        case 'cursor':
          break;
        case 'image':
          break;
        case 'text':
          _element.attr('contenteditable', null);
          break;
      }
      
      _element = null;
    }
    
    if(supressEvent !== true){
      this.triggerEvent('elementunset', {'element': element});
    }
    
    return this;
    
  };
  
  this.onElementDrag = function(evt){  
    this.updateValues(['x', 'y']);
  };
  
  this.onElementResize = function(evt){  
    this.updateValues(['x', 'y', 'width', 'height']);
  };
  
  this.onFieldValueChange = function(evt){  
    var field = evt.detail.field,
      value = evt.detail.value;
      
    if(!_element){
      return;
    }
  
    switch(field.data('name')){
      case 'x':
        _element.css('left', value +'px');
        break;
      case 'y':
        _element.css('top', value +'px');
        break;
      case 'width':
        _element.css('width', value +'px');
        break;
      case 'height':
        _element.css('height', value +'px');
        break;
      case 'r-index':
        _element.data('r-index', value);
        break;
      case 'z-index':
        _element.css('z-index', value);
        break;
      case 'bg-color':
        _element.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg-image':
        // TODO
        break;
      case 'border-width':
        _element.css('border-width', value +'px');
        break;
      case 'border-color':
        _element.css('border-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'rounded-conrners':
        // TODO
        break;
      case 'start-time':
        _element.data('start-time', value);
        break;
      case 'end-time':
        _element.data('end-time', value);
        break;
    }
  };
  
  this.updateValue = function(name){
    var field = this.getField(name);
    
    switch(name){
      case 'x':
        field.setValue(parseInt(_element.css('left'), 10));
        break;
      case 'y':
        field.setValue(parseInt(_element.css('top'), 10));
        break;
      case 'width':
        field.setValue(parseInt(_element.css('width'), 10));
        break;
      case 'height':
        field.setValue(parseInt(_element.css('height'), 10));
        break;
      case 'r-index':
        field.setValue(_element.data('r-index') || 0);
        break;
      case 'z-index':
        field.setValue(parseInt(_element.css('z-index'), 10));
        break;
      case 'bg-color':
        field.setValue(_element.css('background-color'));
        break;
      case 'bg-image':
        // TODO
        break;
      case 'border-width':
        field.setValue(parseInt(_element.css('border-width'), 10));
        break;
      case 'border-color':
        field.setValue(_element.css('border-color'));
        break;
      case 'rounded-conrners':
        // TODO
        break;
      case 'start-time':
        field.setValue(_element.data('start-time') || 0);
        break;
      case 'end-time':
        field.setValue(_element.data('end-time') || 0);
        break;
    }
  };
  
  this.updateValues = function(fields){
  
    if(fields === undefined){
      fields = Object.keys(this.getField());
    }
    
    metaScore.Object.each(fields, function(key, field){
      this.updateValue(field);
    }, this);
  
  };
  
  
});
/**
 * Page
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.timefield.js
 * @requires ../../helpers/metaScore.string.js
 */
metaScore.Editor.Panel.Page = metaScore.Editor.Panel.extend(function(){

  var _menu, _page;

  this.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Page'),
    
    /**
    * The panel's fields
    */
    fields: {
      'bg-color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': metaScore.String.t('Background color')
      },
      'bg-image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': metaScore.String.t('Background image')
      },
      'start-time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': metaScore.String.t('Start time')
      },
      'end-time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': metaScore.String.t('End time')
      }
    }
  };
  
  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super(configs);
    
    _menu = new metaScore.Editor.DropDownMenu();
    _menu.addItem({'text': metaScore.String.t('Add a new page'), 'data-action': 'new'});
    _menu.addItem({'text': metaScore.String.t('Delete the active page'), 'data-action': 'delete'});
    
    this.getToolbar().addButton()
      .data('action', 'menu')
      .append(_menu);
      
    this.addDelegate('.field', 'valuechange', this.onFieldValueChange);
    
  };
  
  this.getMenu = function(){
  
    return _menu;
  
  };
  
  this.getPage = function(){
  
    return _page;
  
  };
  
  this.setPage = function(page, supressEvent){
  
    if(_page && (_page.get(0) === page.get(0))){
      return;
    }
    
    this.unsetPage(_page, supressEvent);
    
    _page = page;
    
    this.updateValues();      
    this.enableFields();
    this.getMenu().enableItems('[data-action="delete"]');
      
    if(supressEvent !== true){
      this.triggerEvent('pageset', {'page': _page});
    }
    
    return this;
    
  };
  
  this.unsetPage = function(page, supressEvent){
    
    page = page || this.getPage();
      
    this.disableFields();    
    this.getMenu().disableItems('[data-action="delete"]');
      
    if(page){    
      _page = null;
    }
    
    if(supressEvent !== true){
      this.triggerEvent('pageunset', {'page': page});
    }
    
    return this;
    
  };
  
  this.onFieldValueChange = function(evt){  
    var field = evt.detail.field,
      value = evt.detail.value;
      
    if(!_page){
      return;
    }
  
    switch(field.data('name')){
      case 'bg-color':
        _page.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg_image':
        // TODO
      case 'start-time':
        _page.data('start-time', value);
        break;
      case 'end-time':
        _page.data('end-time', value);
        break;
    }
  };
  
  this.updateValue = function(name){
    var field = this.getField(name);
    
    switch(name){
      case 'bg-color':
        field.setValue(_page.css('background-color'));
        break;
      case 'bg-image':
        // TODO
        break;
      case 'start-time':
        field.setValue(_page.data('start-time') || 0);
        break;
      case 'end-time':
        field.setValue(_page.data('end-time') || 0);
        break;
    }
  };
  
  this.updateValues = function(fields){
  
    if(fields === undefined){
      fields = Object.keys(this.getField());
    }
    
    metaScore.Object.each(fields, function(key, field){
      this.updateValue(field);
    }, this);
  
  };
  
  
});
/**
 * Player
 *
 * @requires ../metaScore.base.js
 */
metaScore.Player = metaScore.Base.extend(function(){
  
});
/**
 * Player Block
 *
 * @requires metaScore.player.pager.js
 * @requires metaScore.player.page.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
metaScore.Player.Block = metaScore.Dom.extend(function(){
  
  var _pages, _pager;

  this.constructor = function(dom) {
  
    _pages = [];
  
    if(dom){
      this.super(dom);
      _pages = this.children('.pages');
      _pager = new metaScore.Player.Pager(this.child('.pager').get(0));
    }
    else{
      this.super('<div/>', {'class': 'metaScore-block'});
      _pages = new metaScore.Dom('<div/>', {'class': 'pages'}).appendTo(this);
      _pager = new metaScore.Player.Pager().appendTo(this);
    }
    
    _pager
      .addDelegate('.button', 'click', function(evt){
        var active = !metaScore.Dom.hasClass(evt.target, 'inactive'),
          action, index;
          
        if(active){
          action = metaScore.Dom.data(evt.target, 'action');
        
          switch(action){
            case 'first':
              this.setActivePage(0);
              break;
            case 'previous':
              this.setActivePage(this.getActivePageIndex() - 1);
              break;
            case 'next':
              this.setActivePage(this.getActivePageIndex() + 1);
              break;
          }
        }
        
        evt.stopPropagation();
      }, this);
      
    this.addListener('click', this.onClick);
    
  };
  
  this.getPages = function(){
  
    return _pages.children('.page');
  
  };
  
  this.addPage = function(page){
  
    _pages.append(page);
    
    this.setActivePage(this.getPages().count() - 1);
  
  };
  
  this.getActivePage = function(){
    
    var pages = this.getPages(),
      index = this.getActivePageIndex();
  
    return new metaScore.Player.Page(this.getPages().get(index));
  
  };
  
  this.getActivePageIndex = function(){
    
    var pages = this.getPages(),
      index = pages.index('.active');
  
    if(index < 0){
      index = 0;
    }
  
    return index;
  
  };
  
  this.getPageCount = function(){
  
    return this.getPages().count();
  
  };
  
  this.setActivePage = function(index){
    
    var pages = this.getPages(),
      page = new metaScore.Player.Page(pages.get(index));
  
    pages.removeClass('active');
    
    page.addClass('active');
    
    this.updatePager();
    
    this.triggerEvent('pageactivated', {'index': index, 'page': page});
  
  };
  
  this.updatePager = function(){
  
    var index = this.getActivePageIndex();
    var count = this.getPageCount();
  
    _pager.updateCount(index, count);
  
  };
  
  this.isSynched = function(){
    
    return this.data('synched') === "true";
    
  };
  
  this.onClick = function(evt){
    
    this.triggerEvent('blockclick', {'block': this});
    
    evt.stopPropagation();
    
  };
});
/**
 * Player Element
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Element = metaScore.Dom.extend(function(){

  this.constructor = function(dom) {
  
    if(dom){
      this.super(dom);
    }
    else{
      this.super('<div/>', {'class': 'element'});
    }
      
    this.addListener('click', this.onClick);
    
  };
  
  this.onClick = function(evt){
    
    this.triggerEvent('elementclick', {'element': this});
    
    evt.stopPropagation();
    
  };  
});
/**
 * Media
 *
 * @requires metaScore.player.js
 * @requires ../metaScore.dom.js
 */
metaScore.Player.Media = metaScore.Dom.extend(function(){
});
/**
 * Player Page
 *
 * @requires metaScore.player.element.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Page = metaScore.Dom.extend(function(){

  this.constructor = function(dom) {
  
    if(dom){
      this.super(dom);
    }
    else{
      this.super('<div/>', {'class': 'page'});
    }
      
    this.addListener('click', this.onClick);
    
  };
  
  this.addElement = function(element){
  
    this.append(element);
    
    return element;
  
  };
  
  this.onClick = function(evt){
    
    this.triggerEvent('pageclick', {'page': this});
    
    evt.stopPropagation();
    
  }; 
});
/**
 * Player Page
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Pager = metaScore.Dom.extend(function(){

  var _count, _buttons;

  this.constructor = function(dom) {
  
    if(dom){
      this.super(dom);      
      _count = this.child('.count');      
      _buttons = this.child('.buttons');        
      _buttons.first = _buttons.child('[data-action="first"]');
      _buttons.previous = _buttons.child('[data-action="previous"]');
      _buttons.next = _buttons.child('[data-action="next"]');
    }
    else{
      this.super('<div/>', {'class': 'pager'});
      _count = new metaScore.Dom('<div/>', {'class': 'count'}).appendTo(this);      
      _buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
        .addListener('mousedown', function(evt){
          evt.stopPropagation();
        })
        .appendTo(this);        
      _buttons.first = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'first'}).appendTo(_buttons);      
      _buttons.previous = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'previous'}).appendTo(_buttons);      
      _buttons.next = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'next'}).appendTo(_buttons);
    }
    
  };
  
  this.updateCount = function(index, count){
  
    _count.text(metaScore.String.t('page !current/!count', {'!current': (index + 1), '!count': count}));
    
    _buttons.first.toggleClass('inactive', index === 0);
    _buttons.previous.toggleClass('inactive', index === 0);
    _buttons.next.toggleClass('inactive', index >= count - 1);
  
  };
  
});
/**
 * Cursor
 *
 * @requires ../metaScore.player.element.js
 */
metaScore.Player.Element.Cursor = metaScore.Player.Element.extend(function(){

  this.constructor = function(element) {
  
    this.super(element);
    
    this.data('type', 'cursor');
    
  };
});
/**
 * Image
 *
 * @requires ../metaScore.player.element.js
 */
metaScore.Player.Element.Image = metaScore.Player.Element.extend(function(){

  this.constructor = function(element) {
  
    this.super(element);
    
    this.data('type', 'image');
    
  };
});
/**
 * Text
 *
 * @requires ../metaScore.player.element.js
 */
metaScore.Player.Element.Text = metaScore.Player.Element.extend(function(){

  this.constructor = function(element) {
  
    this.super(element);
    
    this.data('type', 'text');
    
  };
});
/**
 * Media CuePoints
 *
 * @requires metaScore.player.media.js
 * @requires ../metaScore.base.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.var.js
 */
metaScore.Player.Media.CuePoint = metaScore.Base.extend(function(){

  var _media, _triggers;
  
  this.constructor = function(media){
    
    _triggers = [];
  
    _media = media;
    
    _media.addEventListener('timeupdate', this.onMediaTimeUpdate);
    
  };
  
  this.onMediaTimeUpdate = function(e){
    var media, curTime;
    
    media = e.target;
    curTime = parseFloat(media.currentTime);
    
    metaScore.Object.each(_triggers, function (index, trigger) {
      if (!trigger.timer && curTime >= trigger.inTime - 0.5 && curTime < trigger.inTime) {
        this.setupTriggerTimer(trigger, (trigger.inTime - curTime) * 1000);
      }
    });
  };
  
  this.addTrigger = function(trigger){
    return _triggers.push(trigger) - 1;
  };
  
  this.removeTrigger = function(index){
    var trigger = _triggers[index];
  
    this.stopTrigger(trigger, false);
    _triggers.splice(index, 1);
  };
  
  this.setupTriggerTimer = function(trigger, delay){
    trigger.timer = setTimeout(metaScore.Function.proxy(this.launchTrigger, this, trigger), delay);
  };
  
  this.launchTrigger = function(trigger){
    if(trigger.hasOwnProperty('onStart') && metaScore.Var.is(trigger.onStart, 'function')){
      trigger.onStart(_media);
    }    
  };
  
  this.stopTrigger = function(trigger, launchHandler){    
    if(trigger.hasOwnProperty('timer')){
      clearTimeout(trigger.timer);
      delete trigger.timer;
    }
    
    if(trigger.hasOwnProperty('interval')){
      clearInterval(trigger.interval);
      delete trigger.interval;
    }
    
    if(launchHandler !== false && trigger.hasOwnProperty('onEnd') && metaScore.Var.is(trigger.onEnd, 'function')){
      trigger.onEnd(_media);
    }
  };
});

  global.metaScore = metaScore;

} (this));