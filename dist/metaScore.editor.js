/*! metaScore - v0.0.1 - 2014-09-16 - Oussama Mubarak */
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
* Core
*/
var metaScore = {

  version: "0.0.1",
  
  getVersion: function(){
    return this.version;
  },
  
  namespace: function(str){  
    var parent = this,
      parts = str.split('.'),
      part;
        
    for(var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      parent[part] = parent[part] || {};
      parent = parent[part];
    }
    
    return parent;
  }
  
};
/**
 * Base Class
 *
 * @requires metaScore.core.js
 */
 
metaScore.Class = (function () {
 
  /**
   * @constructor
   */
  function Class(){    
  }

  Class.defaults = {};
      
  Class.extend = function(child){
    child.prototype = Object.create(this.prototype, {
      constructor: {
        value: child
      }
    });
    
    child.parent = this;
    child.extend = this.extend;
    
    if(!('defaults' in child)){
      child.defaults = {};
    }
    
    for(var prop in this.defaults){
      if(!(prop in child.defaults)){
        child.defaults[prop] = this.defaults[prop];
      }
    } 
  };
  
  Class.prototype.getConfigs = function(configs){
    configs = configs || {};
  
    for(var prop in this.constructor.defaults){
      if(!(prop in configs)){
        configs[prop] = this.constructor.defaults[prop];
      }
    }
  
    return configs;  
  };
  
  return Class;
  
})();
/**
 * Evented
 *
 * @requires metaScore.class.js
 */
 
metaScore.Evented = (function () {
  
  function Evented() {
    // call parent constructor
    Evented.parent.call(this);
  
    this.listeners = {};
  }
  
  metaScore.Class.extend(Evented);
  
  Evented.prototype.addListener = function(type, listener){
    if (typeof this.listeners[type] === "undefined"){
      this.listeners[type] = [];
    }

    this.listeners[type].push(listener);
    
    return this;
  };

  Evented.prototype.removeListener = function(type, listener){
    if(this.listeners[type] instanceof Array){
      var listeners = this.listeners[type];
      for (var i=0, len=listeners.length; i < len; i++){
        if (listeners[i] === listener){
          listeners.splice(i, 1);
          break;
        }
      }
    }
    
    return this;
  };

  Evented.prototype.triggerEvent = function(type, data, bubbling, cancelable){
    var listeners, event;

    if (this.listeners[type] instanceof Array){
      listeners = this.listeners[type];
      
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
    
  return Evented;
  
})();
/**
 * Ajax
 *
 * @requires ../metaScore.class.js
 * @requires metaScore.object.js
 * @requires metaScore.var.js
 */
 
metaScore.Ajax = (function () {
  
  function Ajax() {
  }
  
  metaScore.Class.extend(Ajax);

  /**
  * Create an XMLHttp object
  * @returns {object} the XMLHttp object
  */
  Ajax.createXHR = function() {

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
  Ajax.send = function(url, options) {

    var key,
      xhr = Ajax.createXHR(),
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
    
    if(query.length > 0){
      if(options.method === 'POST'){
        data = query.join('&');
        options.headers['Content-type'] = 'application/x-www-form-urlencoded';
      }
      else{
        url += '?'+ query.join('&');
      }
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
        if((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304){
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
  Ajax.get = function(url, options) {
    
    metaScore.Object.extend(options, {'method': 'GET'});
    
    return Ajax.send(url, options);
    
  };

  /**
  * Send an XMLHttp POST request
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  Ajax.post = function(url, options) {
    
    metaScore.Object.extend(options, {'method': 'POST'});
    
    return Ajax.send(url, options);
    
  };
    
  return Ajax;
  
})();
/**
 * Array
 *
 * @requires ../metaScore.class.js
 */
 
metaScore.Array = (function () {
  
  function Array() {
  }
  
  metaScore.Class.extend(Array);

  /**
  * Checks if a value is in an array
  * @param {mixed} the value to check
  * @param {array} the array
  * @returns {number} the index of the value if found, -1 otherwise
  */
  Array.inArray = function (value, arr) {
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
  Array.copy = function (arr) {
    return [].concat(arr);
  };

  /**
  * Shuffles elements in an array
  * @param {array} the original array
  * @returns {array} a copy of the array with it's elements shuffled
  */
  Array.shuffle = function(arr) {

    var shuffled = Array.copy(arr);

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
  Array.unique = function(arr) {

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
  Array.each = function(arr, callback, scope) {

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
  Array.remove = function(arr, element){
    var index = Array.inArray(element, arr);

    while(index > -1){
      arr.splice(index, 1);    
      index = Array.inArray(element, arr);
    }
    
    return arr;
  };
    
  return Array;
  
})();
/**
 * Dom
 *
 * @requires ../metaScore.base.js
 * @requires ../metaScore.polyfill.js
 * @requires metaScore.array.js
 * @requires metaScore.object.js
 * @requires metaScore.var.js
 */
 
metaScore.Dom = (function () {
  
  function Dom() { 
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
  }
  
  metaScore.Class.extend(Dom);
  
  /**
  * Regular expression that matches an element's string
  */
  Dom.stringRe = /^<(.)+>$/;

  /**
  * Regular expression that matches dashed string for camelizing
  */
  Dom.camelRe = /-([\da-z])/gi;

  /**
  * Helper function used by the camel function
  */
  Dom.camelReplaceFn = function(all, letter) {
    return letter.toUpperCase();
  };

  /**
  * Normaliz a string to Camel Case; used for CSS properties
  * @param {string} the original string
  * @returns {string} the normalized string
  */
  Dom.camel = function(str){
    return str.replace(Dom.camelRe, Dom.camelReplaceFn);
  };

  /**
  * List of event that should generaly bubble up
  */
  Dom.bubbleEvents = {
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
  Dom.selectElement = function (selector, parent) {      
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
  Dom.selectElements = function (selector, parent) {      
    var elements;
    
    if(!parent){
      parent = document;
    }
    else if(parent instanceof Dom){
      parent = parent.get(0);
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
  Dom.elementsFromString = function(html){
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
  Dom.hasClass = function(element, className){
    return element.classList.contains(className);
  };

  /**
  * Adds a given class to an element
  * @param {object} the dom element
  * @param {string} the class(es) to add; separated by a space
  * @returns {void}
  */
  Dom.addClass = function(element, className){
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
  Dom.removeClass = function(element, className){
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
  Dom.toggleClass = function(element, className, force){
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
  Dom.addListener = function(element, type, callback, useCapture){
    if(useCapture === undefined){
      useCapture = ('type' in Dom.bubbleEvents) ? Dom.bubbleEvents[type] : false;
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
  Dom.removeListener = function(element, type, callback, useCapture){
    if(useCapture === undefined){
      useCapture = ('type' in Dom.bubbleEvents) ? Dom.bubbleEvents[type] : false;
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
  Dom.triggerEvent = function(element, type, data, bubbles, cancelable){  
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
  Dom.text = function(element, value){
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
  Dom.val = function(element, value){
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
  Dom.attr = function(element, name, value){
    
    if(metaScore.Var.is(name, 'object')){
      metaScore.Object.each(name, function(key, value){
        Dom.attr(element, key, value);
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
  Dom.css = function(element, name, value){
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
  Dom.data = function(element, name, value){
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
  Dom.append = function(element, children){
    if (!metaScore.Var.is(children, 'array')) {
      children = [children];
    }
    
    metaScore.Array.each(children, function(index, child){
      element.appendChild(child);
    }, this);
  };

  /**
  * Removes all element children
  * @param {object} the dom element
  * @returns {void}
  */
  Dom.empty = function(element){
    while(element.firstChild){
      element.removeChild(element.firstChild);
    }
  };

  /**
  * Removes an element from the dom
  * @param {object} the dom element
  * @returns {void}
  */
  Dom.remove = function(element){
    element.parentElement.removeChild(element);
  };

  /**
  * Checks if an element matches a selector
  * @param {object} the dom element
  * @param {string} the selector
  * @returns {boolean} true if the element matches the selector, false otherwise
  */
  Dom.is = function(element, selector){
    
    return element.matches(selector);
    
  };
  
  Dom.prototype.add = function(elements){
    if('length' in elements){
      for(var i = 0; i < elements.length; i++ ) {
        this.elements.push(elements[i]);
      }
    }
    else{
      this.elements.push(elements);
    }
  };
  
  Dom.prototype.count = function(){
    return this.elements.length;
  };
  
  Dom.prototype.get = function(index){
    return this.elements[index];
  };
  
  Dom.prototype.filter = function(selector){
  
    var filtered = [];
    
    metaScore.Array.each(this.elements, function(index, element) {
      if(Dom.is(element, selector)){
        filtered.push(element);
      }
    }, this);
  
    this.elements = filtered;
    
    return this;
  };
  
  Dom.prototype.index = function(selector){
  
    var found = -1;
    
    metaScore.Array.each(this.elements, function(index, element) {
      if(Dom.is(element, selector)){
        found = index;
        return false;
      }
    }, this);
    
    return found;
  
  };
  
  Dom.prototype.child = function(selector){
  
    var children = new Dom(),
     child;
  
    metaScore.Array.each(this.elements, function(index, element) {
      if(child = Dom.selectElement.call(this, selector, element)){
        children.add(child);
        return false;
      }
    }, this);
    
    return children;
  
  };
  
  Dom.prototype.children = function(selector){
  
    var children = new Dom();
  
    metaScore.Array.each(this.elements, function(index, element) {
      children.add(Dom.selectElements.call(this, selector, element));
    }, this);
    
    return children;
  
  };
  
  Dom.prototype.parents = function(selector){
  
    var parents = new Dom();
  
    metaScore.Array.each(this.elements, function(index, element) {
      parents.add(element.parentElement);
    }, this);
      
    if(selector){
      parents.filter(selector);
    }
    
    return parents;
  
  };
  
  Dom.prototype.addClass = function(className) {  
    metaScore.Array.each(this.elements, function(index, element) {
      Dom.addClass(element, className);
    }, this);
    return this;        
  };
  
  Dom.prototype.removeClass = function(className) {  
    metaScore.Array.each(this.elements, function(index, element) {
      Dom.removeClass(element, className);
    }, this);        
    return this;        
  };
  
  Dom.prototype.toggleClass = function(className, force) {  
    metaScore.Array.each(this.elements, function(index, element) {
      Dom.toggleClass(element, className, force);
    }, this);        
    return this;        
  };
  
  Dom.prototype.addListener = function(type, callback, useCapture) {  
    metaScore.Array.each(this.elements, function(index, element) {
      Dom.addListener(element, type, callback, useCapture);
    }, this);        
    return this;        
  };
  
  Dom.prototype.addDelegate = function(selector, type, callback, scope, useCapture) {
  
    scope = scope || this;
    
    return this.addListener(type, function(evt){
      if(Dom.is(evt.target, selector)){
        callback.call(scope, evt);
      }
    }, useCapture);
    
  };
  
  Dom.prototype.removeListener = function(type, callback, useCapture) {  
    metaScore.Array.each(this.elements, function(index, element) {
      Dom.removeListener(element, type, callback, useCapture);
    }, this);        
    return this;        
  };
  
  Dom.prototype.triggerEvent = function(type, data, bubbles, cancelable){
    var return_value = true;
  
    metaScore.Array.each(this.elements, function(index, element) {
      return_value = Dom.triggerEvent(element, type, data, bubbles, cancelable) && return_value;
    }, this);
    
    return return_value;
  };
  
  Dom.prototype.text = function(value) {  
    if(value !== undefined){
      metaScore.Array.each(this.elements, function(index, element) {
        Dom.text(element, value);
      }, this);
    }
    else{
      return Dom.text(this.get(0));
    }
  };
  
  Dom.prototype.val = function(value) {
    if(value !== undefined){
      metaScore.Array.each(this.elements, function(index, element) {
        Dom.val(element, value);
      }, this);
      return this;
    }
    else{
      return Dom.val(this.get(0));
    }
  };
  
  Dom.prototype.attr = function(name, value) {
    if(value !== undefined || metaScore.Var.is(name, 'object')){
      metaScore.Array.each(this.elements, function(index, element) {
        Dom.attr(element, name, value);
      }, this);
      return this;
    }
    else{
      return Dom.attr(this.get(0), name);
    }
  };
  
  Dom.prototype.css = function(name, value) {
    if(value !== undefined){
      metaScore.Array.each(this.elements, function(index, element) {
        Dom.css(element, name, value);
      }, this);
      return this;
    }
    else{
      return Dom.css(this.get(0), name);
    }
  };
  
  Dom.prototype.data = function(name, value) {
    if(value !== undefined){
      metaScore.Array.each(this.elements, function(index, element) {
        Dom.data(element, name, value);
      }, this);
      return this;
    }
    else{
      return Dom.data(this.get(0), name);
    }
  };
  
  Dom.prototype.append = function(children){
    if(children instanceof Dom){
      children = children.elements;
    }
    
    Dom.append(this.get(0), children);
    
    return this;
  };
  
  Dom.prototype.appendTo = function(parent){    
    if(!(parent instanceof Dom)){
      parent = new Dom(parent);
    }
    
    parent = parent.get(0);
    
    metaScore.Array.each(this.elements, function(index, element) {
      Dom.append(parent, element);
    }, this);
    
    return this;
  };
  
  Dom.prototype.empty = function(){    
    metaScore.Array.each(this.elements, function(index, element) {
      Dom.empty(element);
    }, this);
    
    return this;
  };
  
  Dom.prototype.show = function(){
    metaScore.Array.each(this.elements, function(index, element) {
      this.css('display', '');
    }, this);
    return this;
  };
  
  Dom.prototype.hide = function(){
    metaScore.Array.each(this.elements, function(index, element) {
      this.css('display', 'none');
    }, this);
    return this;
  };
  
  Dom.prototype.remove = function(){
    if(this.triggerEvent('beforeremove') !== false){
      metaScore.Array.each(this.elements, function(index, element) {
        var parent = element.parentElement;
        Dom.remove(element);
        Dom.triggerEvent(parent, 'childremoved', {'child': element});
      }, this);
    }
    
    return this;
  };
  
  Dom.prototype.is = function(selector){
    var found;
  
    metaScore.Array.each(this.elements, function(index, element) {
      found = Dom.is(element, selector);
      return found;
    }, this);
    
    return found;
  };
    
  return Dom;
  
})();
/**
 * Dom
 *
 * @requires ../metaScore.class.js
 * @requires metaScore.dom.js
 */
 
metaScore.Draggable = (function () {

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
  
  metaScore.Class.extend(Draggable);
  
  Draggable.prototype.onMouseDown = function(evt){  
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
  
  Draggable.prototype.onMouseMove = function(evt){  
    var left = evt.clientX + this.start_state.left,
      top = evt.clientY + this.start_state.top;
    
    this.configs.target
      .css('left', left + 'px')
      .css('top', top + 'px')
      .triggerEvent('drag', null, false, true);
    
    evt.stopPropagation();      
  };
  
  Draggable.prototype.onMouseUp = function(evt){
    this.configs.container
      .removeListener('mousemove', this.onMouseMove)
      .removeListener('mouseup', this.onMouseUp);
    
    this.configs.target
      .removeClass('dragging')
      .triggerEvent('dragend', null, false, true);
    
    evt.stopPropagation();    
  };
  
  Draggable.prototype.enable = function(){
    this.configs.target.addClass('draggable');
    
    return this;  
  };
  
  Draggable.prototype.disable = function(){  
    this.configs.target.removeClass('draggable');
    
    return this;  
  };
  
  Draggable.prototype.destroy = function(){
    this.disable();
    
    this.configs.handle.removeListener('mousedown', this.onMouseDown);
    
    return this;    
  };
    
  return Draggable;
  
})();
/**
 * Function
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.var.js
 */
 
metaScore.Function = (function () {
  
  function Function() {
  }
  
  metaScore.Class.extend(Function);

  /**
  * Checks if a variable is of a certain type
  * @param {mixed} the variable
  * @param {string} the type to check against
  * @param {array} an array of arguments to send, defaults to the arguments sent
  * @returns {boolean} true if the variable is of the specified type, false otherwise
  */
  Function.proxy = function(fn, scope, args){
    if (!metaScore.Var.type(fn, 'function')){
      return undefined;
    }
    
    return function () {    
      return fn.apply(scope || this, args || arguments);
    };
  };

  /**
  * A reusable empty function
  */
  Function.emptyFn = function(){};
    
  return Function;
  
})();
/**
 * Object
 *
 * @requires ../metaScore.base.js
 */
 
metaScore.Object = (function () {
  
  function Object() {
  }
  
  metaScore.Class.extend(Object);

  /**
  * Merge the contents of two or more objects together into the first object.
  * @returns {object} the target object extended with the properties of the other objects
  */
  Object.extend = function() {

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
  Object.copy = function(obj) {
      
    return Object.extend({}, obj);

  };

  /**
  * Call a function on each property of an object
  * @param {object} the object
  * @param {function} the function to call
  * @param {object} the scope of the function
  * @returns {void}
  */
  Object.each = function(obj, callback, scope) {

    var key, value,
      scope_provided = scope !== undefined;
    
    for (key in obj) {
      value = callback.call(scope_provided ? scope : obj[key], key, obj[key]);
    
      if (value === false) {
        break;
      }
    }
    
    return obj;

  };
    
  return Object;
  
})();
/**
 * Dom
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.dom.js
 */
 
metaScore.Resizable = (function () {

  function Resizable(configs) {
    this.configs = this.getConfigs(configs);
    
    this.configs.container = this.configs.container || new metaScore.Dom('body');
    
    this.handles = {};
      
    // fix event handlers scope
    this.onMouseDown = metaScore.Function.proxy(this.onMouseDown, this);
    this.onMouseMove = metaScore.Function.proxy(this.onMouseMove, this);
    this.onMouseUp = metaScore.Function.proxy(this.onMouseUp, this);
    
    metaScore.Array.each(this.configs.directions, function(index, direction){
      this.handles[direction] = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
        .data('direction', direction)
        .addListener('mousedown', this.onMouseDown)
        .appendTo(this.configs.target);
    }, this);
      
    this.enable();  
  }
  
  Resizable.defaults = {
    directions: [
      'top',
      'right',
      'bottom',
      'left',
      'top-left',
      'top-right',
      'bottom-left',
      'bottom-right'
    ]
  };
  
  metaScore.Class.extend(Resizable);
  
  Resizable.prototype.onMouseDown = function(evt){  
    this.start_state = {
      'handle': evt.target,
      'x': evt.clientX,
      'y': evt.clientY,
      'left': parseInt(this.configs.target.css('left'), 10),
      'top': parseInt(this.configs.target.css('top'), 10),
      'w': parseInt(this.configs.target.css('width'), 10),
      'h': parseInt(this.configs.target.css('height'), 10)
    };
    
    this.configs.container
      .addListener('mousemove', this.onMouseMove, this)
      .addListener('mouseup', this.onMouseUp, this);
    
    this.configs.target
      .addClass('resizing')
      .triggerEvent('resizestart', null, false, true);
    
    evt.stopPropagation();      
  };

  Resizable.prototype.onMouseMove = function(evt){  
    var handle = new metaScore.Dom(this.start_state.handle),
      w, h, top, left;
    
    switch(handle.data('direction')){
      case 'top':
        h = this.start_state.h - evt.clientY + this.start_state.y;
        top = this.start_state.top + evt.clientY  - this.start_state.y;
        break;
      case 'right':
        w = this.start_state.w + evt.clientX - this.start_state.x;
        break;
      case 'bottom':
        h = this.start_state.h + evt.clientY - this.start_state.y;
        break;
      case 'left':
        w = this.start_state.w - evt.clientX + this.start_state.x;
        left = this.start_state.left + evt.clientX - this.start_state.x;
        break;
      case 'top-left':
        w = this.start_state.w - evt.clientX + this.start_state.x;
        h = this.start_state.h - evt.clientY + this.start_state.y;
        top = this.start_state.top + evt.clientY  - this.start_state.y;
        left = this.start_state.left + evt.clientX - this.start_state.x;
        break;
      case 'top-right':
        w = this.start_state.w + evt.clientX - this.start_state.x;
        h = this.start_state.h - evt.clientY + this.start_state.y;
        top = this.start_state.top + evt.clientY - this.start_state.y;
        break;
      case 'bottom-left':
        w = this.start_state.w - evt.clientX + this.start_state.x;
        h = this.start_state.h + evt.clientY - this.start_state.y;
        left = this.start_state.left + evt.clientX - this.start_state.x;
        break;
      case 'bottom-right':
        w = this.start_state.w + evt.clientX - this.start_state.x;
        h = this.start_state.h + evt.clientY - this.start_state.y;
        break;
    }
      
    if(top !== undefined){
      this.configs.target.css('top', top +'px');
    }
    if(left !== undefined){
      this.configs.target.css('left', left +'px');
    }
    
    this.configs.target
      .css('width', w +'px')
      .css('height', h +'px')
      .triggerEvent('resize', null, false, true);
    
    evt.stopPropagation();    
  };

  Resizable.prototype.onMouseUp = function(evt){  
    this.configs.container
      .removeListener('mousemove', this.onMouseMove, this)
      .removeListener('mouseup', this.onMouseUp, this);
    
    this.configs.target
      .removeClass('resizing')
      .triggerEvent('resizeend', null, false, true);
    
    evt.stopPropagation();
  };
  
  Resizable.prototype.enable = function(){  
    this.configs.target.addClass('resizable');
    
    return this;
  };
  
  Resizable.prototype.disable = function(){  
    this.configs.target.removeClass('resizable');
    
    return this;  
  };
  
  Resizable.prototype.destroy = function(){  
    this.disable();
  
    metaScore.Object.each(this.handles, function(index, handle){
      handle.remove();
    }, this);
    
    return this;  
  };
    
  return Resizable;
  
})();
/**
 * String
 *
 * @requires ../metaScore.base.js
 */
 
metaScore.String = (function () {
  
  function String() {
  }
  
  metaScore.Class.extend(String);

  /**
  * Capitalize a string
  * @param {string} the original string
  * @returns {string} the capitalized string
  */
  String.capitalize = function(str){
    return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  };

  /**
  * Translate a string
  * @param {string} the original string
  * @param {object} string replacements
  * @returns {string} the translated string
  */
  String.t = function(str, args){
    return String.formatString(str, args);
  };

  /**
  * Replace placeholders with sanitized values in a string.
  * @param {string} the original string
  * @param {object} string replacements
  * @returns {string} the formatted string
  */
  String.formatString = function(str, args) {
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
  String.uuid = function (len, radix) {
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
    
  return String;
  
})();
/**
 * Variable
 *
 * @requires ../metaScore.base.js
 */
 
metaScore.Var = (function () {

  /**
  * Helper object used by the type function
  */
  var classes2types = {
    "[object Boolean]": "boolean",
    "[object Number]": "number",
    "[object String]": "string",
    "[object Function]": "function",
    "[object Array]": "array",
    "[object Date]": "date",
    "[object RegExp]": "regexp",
    "[object Object]": "object"
  };
  
  function Var() {
  }
  
  metaScore.Class.extend(Var);

  /**
  * Get the type of a variable
  * @param {mixed} the variable
  * @returns {string} the type
  */
  Var.type = function(obj) {
    return obj == null ? String(obj) : classes2types[ Object.prototype.toString.call(obj) ] || "object";
  };

  /**
  * Checks if a variable is of a certain type
  * @param {mixed} the variable
  * @param {string} the type to check against
  * @returns {boolean} true if the variable is of the specified type, false otherwise
  */
  Var.is = function(obj, type) {
    return Var.type(obj) === type.toLowerCase();
  };
    
  return Var;
  
})();
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
metaScore.Editor = (function(){
  
  function Editor(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Editor.parent.call(this, '<div/>', {'class': 'metaScore-editor'});
    
    if(DEBUG){
      metaScore.Editor.instance = this;
    }
    
    this.editing = false;
    
    if(this.configs.container){
      this.appendTo(this.configs.container);
    }
  
    // add components    
    this.workspace = new metaScore.Dom('<div/>', {'class': 'workspace'}).appendTo(this);
    this.h_ruler = new metaScore.Dom('<div/>', {'class': 'ruler horizontal'}).appendTo(this.workspace);
    this.v_ruler = new metaScore.Dom('<div/>', {'class': 'ruler vertical'}).appendTo(this.workspace);
    this.mainmenu = new metaScore.editor.MainMenu().appendTo(this);     
    this.sidebar =  new metaScore.Dom('<div/>', {'class': 'sidebar'}).appendTo(this);    
    this.block_panel = new metaScore.editor.panel.Block().appendTo(this.sidebar);
    this.page_panel = new metaScore.editor.panel.Page().appendTo(this.sidebar);
    this.element_panel = new metaScore.editor.panel.Element().appendTo(this.sidebar);
    this.player_wrapper = new metaScore.Dom('<iframe/>', {'class': 'player-wrapper'}).appendTo(this.workspace);
    this.player_head = new metaScore.Dom(this.player_wrapper.get(0).contentDocument.head);
    this.player_body = new metaScore.Dom(this.player_wrapper.get(0).contentDocument.body).addClass('metaScore-player-wrapper');
    this.grid = new metaScore.Dom('<div/>', {'class': 'grid'}).appendTo(this.workspace);
    this.history = new metaScore.editor.History();
    
    // add player style sheets    
    if(this.configs.palyer_css){
      metaScore.Array.each(this.configs.palyer_css, function(index, url) {
        this.addPlayerCSS(url);
      }, this);
    }
      
    // add event listeners    
    this.mainmenu
      .addDelegate('button[data-action]:not(.disabled)', 'click', metaScore.Function.proxy(this.onMainmenuClick, this));
    
    this.block_panel
      .addListener('componentset', metaScore.Function.proxy(this.onBlockSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onBlockUnset, this))
      .addListener('valueschange', metaScore.Function.proxy(this.onBlockPanelValueChange, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onBlockPanelToolbarClick, this));
    
    this.page_panel
      .addListener('componentset', metaScore.Function.proxy(this.onPageSet, this))
      .addListener('componentunset', metaScore.Function.proxy(this.onPageUnset, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onPagePanelToolbarClick, this));
    
    this.element_panel
      .addListener('componentset', metaScore.Function.proxy(this.onElementSet, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onElementPanelToolbarClick, this));
    
    this.player_body
      .addListener('click', metaScore.Function.proxy(this.onPlayerClick, this))
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this))
      .addDelegate('.metaScore-block', 'click', metaScore.Function.proxy(this.onBlockClick, this))
      .addDelegate('.metaScore-block', 'pageactivate', metaScore.Function.proxy(this.onBlockPageActivated, this))
      .addDelegate('.metaScore-block .page', 'click', metaScore.Function.proxy(this.onPageClick, this))
      .addDelegate('.metaScore-block .page .element', 'click', metaScore.Function.proxy(this.onElementClick, this));
      
    this.history
      .addListener('add', metaScore.Function.proxy(this.onHistoryAdd, this))
      .addListener('undo', metaScore.Function.proxy(this.onHistoryUndo, this))
      .addListener('redo', metaScore.Function.proxy(this.onHistoryRedo, this));

    new metaScore.Dom('body')
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));
      
    this.block_panel.unsetComponent();
  }
  
  metaScore.Dom.extend(Editor);
  
  Editor.prototype.addPlayerCSS = function(url){
    new metaScore.Dom('<link/>', {'rel': 'stylesheet', 'type': 'text/css', 'href': url}).appendTo(this.player_head);
  };
  
  Editor.prototype.addPlayer = function(configs){  
    this.player = new metaScore.Player(metaScore.Object.extend({}, configs, {
      'container': this.player_body
    }));
  };
  
  Editor.prototype.removePlayer = function(){
    if(this.player){
      this.player.destroy(this.player_body);
    }
    
    delete this.player;
  };
  
  Editor.prototype.addBlock = function(block){
    if(!(block instanceof metaScore.player.Block)){
      block = this.player.addBlock(block);
    }

    this.block_panel.setComponent(block);
    
    return block;
  };
  
  Editor.prototype.addPage = function(block, page){
    if(!(page instanceof metaScore.player.Page)){
      page = block.addPage(page);
    }
    
    this.page_panel.setComponent(page);
    
    return page;
  };
  
  Editor.prototype.addElement = function(page, element){
    if(!(element instanceof metaScore.player.Element)){
      element = page.addElement(element);
    }
    
    this.element_panel.setComponent(element);
    
    return element;
  };
  
  Editor.prototype.openGuide = function(guide){    
    this.alert = new metaScore.editor.overlay.Alert({
      'text': metaScore.String.t('Loading...'),
      'autoShow': true
    });
  
    metaScore.Ajax.get(this.configs.api_url +'guide/'+ guide.id +'.json', {
      'success': metaScore.Function.proxy(this.onGuideLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onGuideLoadError, this)
    });
  };
  
  Editor.prototype.onGuideLoadSuccess = function(xhr){  
    var data = JSON.parse(xhr.response);
    
    this.removePlayer();
    this.addPlayer(data);
    
    this.alert.hide();
    
    delete this.alert;
  };
  
  Editor.prototype.onGuideLoadError = function(evt){
  
  };
  
  Editor.prototype.onKeydown = function(evt){
    switch(evt.keyCode){
      case 18: //alt
        this.editing = true;
        this.player_body.addClass('editing');
        break;
      case 90: //z
        if(evt.ctrlKey){
          this.history.undo();
        }
        break;
      case 89: //y
        if(evt.ctrlKey){
          this.history.redo();
        }
        break;
    }  
  };
  
  Editor.prototype.onKeyup = function(evt){
    switch(evt.keyCode){
      case 18: //alt
        this.editing = false;
        this.player_body.removeClass('editing');
        break;
    }
  };
  
  Editor.prototype.onMainmenuClick = function(evt){
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        break;
      case 'open':
        new metaScore.editor.overlay.popup.GuideSelector({
          'url': this.configs.api_url +'guide.json',
          'selectCallback': metaScore.Function.proxy(this.openGuide, this),
          'autoShow': true
        })
        .show();
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
        this.history.undo();
        break;
      case 'redo':
        this.history.redo();
        break;
      case 'edit':
        break;
      case 'settings':
        break;
      case 'help':
        break;
    }
  };
  
  Editor.prototype.onBlockSet = function(evt){
    var block = evt.detail.component;
    
    if(!(block instanceof metaScore.player.Controller)){
      this.page_panel.setComponent(block.getActivePage(), true);
      this.page_panel.getMenu().enableItems('[data-action="new"]');
      this.element_panel.getMenu().enableItems('[data-action="new"]');
    }    
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onBlockUnset = function(evt){
    this.page_panel.unsetComponent();
    this.page_panel.getMenu().disableItems('[data-action="new"]');
  };
  
  Editor.prototype.onBlockPanelValueChange = function(evt){
    var block = evt.detail.component,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;
     
    this.history.add({
      'undo': metaScore.Function.proxy(this.block_panel.updateProperties, this.block_panel, [block, old_values]),
      'redo': metaScore.Function.proxy(this.block_panel.updateProperties, this.block_panel, [block, new_values])
    });
  };
  
  Editor.prototype.onBlockPanelToolbarClick = function(evt){
    var block,
      dom, count, index;
  
    switch(metaScore.Dom.data(evt.target, 'action')){        
      case 'new':
        block = this.addBlock({'container': this.player_body});
            
        this.history.add({
          'undo': metaScore.Function.proxy(block.destroy, this),
          'redo': metaScore.Function.proxy(this.addBlock, this, [block])
        });
        break;
        
      case 'delete':
        block = this.block_panel.getComponent();
        
        if(block){
          block.destroy();
          this.block_panel.unsetComponent();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addBlock, this, [block]),
            'redo': metaScore.Function.proxy(block.destroy, this)
          });
        }
        break;
        
      case 'previous':
        dom = new metaScore.Dom('.metaScore-block', this.player_body);
        count = dom.count();
        
        if(count > 0){
          index = dom.index('.selected') - 1;          
          if(index < 0){
            index = count - 1;
          }
          
          block = dom.get(index)._metaScore;
          
          this.block_panel.setComponent(block);
        }
        break;
        
      case 'next':
        dom = new metaScore.Dom('.metaScore-block', this.player_body);
        count = dom.count();
        
        if(count > 0){
          index = dom.index('.selected') + 1;          
          if(index >= count){
            index = 0;
          }
          
          block = dom.get(index)._metaScore;
          
          this.block_panel.setComponent(block);
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageSet = function(evt){
    var page = evt.detail.component,
      block = page.parents().parents().get(0)._metaScore;
    
    this.block_panel.setComponent(block, true);
    this.page_panel.getMenu().enableItems('[data-action="new"]');
    this.element_panel.getMenu().enableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageUnset = function(evt){
    this.element_panel.unsetComponent();
    this.element_panel.getMenu().disableItems('[data-action="new"]');
  };
  
  Editor.prototype.onPagePanelToolbarClick = function(evt){
    var block, page,
      dom, count, index;
  
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        block = this.block_panel.getComponent();
        page = this.addPage(block);
            
        this.history.add({
          'undo': metaScore.Function.proxy(page.destroy, this),
          'redo': metaScore.Function.proxy(this.addPage, this, [block, page])
        });
        break;
        
      case 'delete':
        block = this.block_panel.getComponent();
        page = this.page_panel.getComponent();
        
        if(page){
          page.destroy();
          this.page_panel.unsetComponent();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addPage, this, [block, page]),
            'redo': metaScore.Function.proxy(page.destroy, this)
          });
        }
        break;
        
      case 'previous':
        block = this.block_panel.getComponent();
        
        if(block){
          dom = new metaScore.Dom('.page', block);
          count = dom.count();
          
          if(count > 0){
            index = dom.index('.selected') - 1;          
            if(index < 0){
              index = count - 1;
            }
            
            page = dom.get(index)._metaScore;
            
            block.setActivePage(page);
          }
        }
        break;
        
      case 'next':
        block = this.block_panel.getComponent();
        
        if(block){
          dom = new metaScore.Dom('.page', block);
          count = dom.count();
          
          if(count > 0){
            index = dom.index('.selected') + 1;          
            if(index >= count){
              index = 0;
            }
            
            page = dom.get(index)._metaScore;
            
            block.setActivePage(page);
          }
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementSet = function(evt){
    var element = evt.detail.component,
      page = element.parents().get(0)._metaScore,
      block = page.parents().parents().get(0)._metaScore;
    
    this.page_panel.setComponent(page, true);
    this.block_panel.setComponent(block, true);
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementPanelToolbarClick = function(evt){
    var page, element,
      dom, count, index;
  
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        page = this.page_panel.getComponent();
        element = this.addElement(page, {'type': metaScore.Dom.data(evt.target, 'type')});
    
        this.element_panel.setComponent(element);
            
        this.history.add({
          'undo': metaScore.Function.proxy(element.destroy, this),
          'redo': metaScore.Function.proxy(this.addElement, this, [page, element])
        });
        break;
        
      case 'delete':
        page = this.page_panel.getComponent();
        element = this.element_panel.getComponent();
        
        if(element){
          element.destroy();
          this.element_panel.unsetComponent();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addElement, this, [page, element]),
            'redo': metaScore.Function.proxy(element.destroy, this)
          });
        }
        break;
        
      case 'previous':
        page = this.page_panel.getComponent();
        
        if(page){
          dom = new metaScore.Dom('.element', page);
          count = dom.count();
          
          if(count > 0){
            index = dom.index('.selected') - 1;          
            if(index < 0){
              index = count - 1;
            }
            
            element = dom.get(index)._metaScore;
            
            this.element_panel.setComponent(element);
          }
        }
        break;
        
      case 'next':
        page = this.page_panel.getComponent();
        
        if(page){
          dom = new metaScore.Dom('.element', page);
          count = dom.count();
          
          if(count > 0){
            index = dom.index('.selected') + 1;          
            if(index >= count){
              index = 0;
            }
            
            element = dom.get(index)._metaScore;
            
            this.element_panel.setComponent(element);
          }
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onBlockClick = function(evt){
    if(!this.editing){
      return;
    }
    
    this.element_panel.unsetComponent();
    this.block_panel.setComponent(evt.detail.block);
  };
  
  Editor.prototype.onPageClick = function(evt){
    if(!this.editing){
      return;
    }
    
    this.element_panel.unsetComponent();
    this.page_panel.setComponent(evt.detail.page);
  };
  
  Editor.prototype.onElementClick = function(evt){
    if(!this.editing){
      return;
    }
    
    this.element_panel.setComponent(evt.detail.element);
  };
  
  Editor.prototype.onPlayerClick = function(evt){
    if(!this.editing){
      return;
    }
    
    this.block_panel.unsetComponent();
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onBlockPageActivated = function(evt){  
    if(!this.editing){
      return;
    }
    
    this.page_panel.setComponent(evt.detail.page);
  };
  
  Editor.prototype.onHistoryAdd = function(evt){
    this.mainmenu.enableItems('[data-action="undo"]');
    this.mainmenu.disableItems('[data-action="redo"]');
  };
  
  Editor.prototype.onHistoryUndo = function(evt){
    if(this.history.hasUndo()){
      this.mainmenu.enableItems('[data-action="undo"]');
    }
    else{
      this.mainmenu.disableItems('[data-action="undo"]');
    }
    
    this.mainmenu.enableItems('[data-action="redo"]');
  };
  
  Editor.prototype.onHistoryRedo = function(evt){
    if(this.history.hasRedo()){
      this.mainmenu.enableItems('[data-action="redo"]');
    }
    else{
      this.mainmenu.disableItems('[data-action="redo"]');
    }
    
    this.mainmenu.enableItems('[data-action="undo"]');
  };
    
  return Editor;
  
})();
/**
 * Button
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('editor');
 
metaScore.editor.Button = (function () {
  
  function Button(configs) {
    this.configs = this.getConfigs(configs);
    
    // call the super constructor.
    metaScore.Dom.call(this, '<button/>');
    
    this.disabled = false;
    
    if(this.configs.label){
      this.setLabel(this.configs.label);
    }
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
  }
  
  Button.defaults = {
    /**
    * A text to add as a label
    */
    label: null
  };
  
  metaScore.Dom.extend(Button);
  
  Button.prototype.onClick = function(evt){
    if(this.disabled){
      evt.stopPropagation();
    }
  };
  
  Button.prototype.setLabel = function(text){  
    if(this.label === undefined){
      this.label = new metaScore.Dom('<span/>', {'class': 'label'})
        .appendTo(this);
    }
    
    this.label.text(text);    
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  Button.prototype.disable = function(){
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
  Button.prototype.enable = function(){
    this.disabled = false;
    
    this.removeClass('disabled');
    
    return this;
  };
    
  return Button;
  
})();
/**
 * DropDownMenu
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('editor');
 
metaScore.editor.DropDownMenu = (function () {
  
  function DropDownMenu(configs) {  
    this.configs = this.getConfigs(configs);
    
    // call the super constructor.
    metaScore.Dom.call(this, '<ul/>', {'class': 'dropdown-menu'});
  }
  
  metaScore.Dom.extend(DropDownMenu);
  
  DropDownMenu.prototype.addItem = function(attr){  
    var item = new metaScore.Dom('<li/>', attr)
      .appendTo(this);    
  
    return item;  
  };
  
  DropDownMenu.prototype.enableItems = function(selector){  
    var items = this.children(selector);
    
    items.removeClass('disabled');
  
    return items;  
  };
  
  DropDownMenu.prototype.disableItems = function(selector){  
    var items = this.children(selector);
    
    items.addClass('disabled');
  
    return items;  
  };
    
  return DropDownMenu;
  
})();
/**
 * Field
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('editor');
 
metaScore.editor.Field = (function () {
  
  function Field(configs) {
    this.configs = this.getConfigs(configs);
    
    // call the super constructor.
    metaScore.Dom.call(this, this.configs.tag, this.configs.attributes);
    
    this.disabled = false;
    
    if(this.configs.value !== null){
      this.setValue(this.configs.value);
    }
    
    if(this.configs.disabled){
      this.disable();
    }
    
    this.addListener('change', metaScore.Function.proxy(this.onChange, this));
  }
  
  Field.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    tag: '<input/>'
  };
  
  metaScore.Dom.extend(Field);
  
  Field.prototype.attributes = {
    'type': 'text',
    'class': 'field'
  };
  
  Field.prototype.onChange = function(evt){
    this.value = this.val();
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  };
  
  Field.prototype.setValue = function(value){    
    this.val(value);
    this.value = value;
  };
  
  Field.prototype.getValue = function(){  
    return this.value;  
  };

  /**
  * Disable the field
  * @returns {object} the XMLHttp object
  */
  Field.prototype.disable = function(){
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
  Field.prototype.enable = function(){
    this.disabled = false;
    
    this.removeClass('disabled');
    this.attr('disabled', null);
    
    return this;
  };
    
  return Field;
  
})();
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
/**
 * MainMenu
 *
 * @requires metaScore.editor.button.js
 * @requires field/metaScore.editor.field.timefield.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
metaScore.editor.MainMenu = (function(){

  function MainMenu() {
    // call parent constructor
    MainMenu.parent.call(this, '<div/>', {'class': 'main-menu clearfix'});
    
    this.setupUI();    
  }
  
  metaScore.Dom.extend(MainMenu);
  
  MainMenu.prototype.setupUI = function(){
  
    var left, right;
    
    left = new metaScore.Dom('<div/>', {'class': 'left'}).appendTo(this);
    right = new metaScore.Dom('<div/>', {'class': 'right'}).appendTo(this);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('New')
      })
      .data('action', 'new')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('Open')
      })
      .data('action', 'open')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('edit')
      })
      .data('action', 'edit')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('save')
      })
      .data('action', 'save')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('download')
      })
      .data('action', 'download')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('delete')
      })
      .data('action', 'delete')
      .appendTo(left);
    
    new metaScore.editor.field.Time()
      .attr({
        'title': metaScore.String.t('time')
      })
      .data('action', 'time')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('revert')
      })
      .data('action', 'revert')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('undo')
      })
      .data('action', 'undo')
      .appendTo(left);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('redo')
      })
      .data('action', 'redo')
      .appendTo(left);
      
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('settings')
      })
      .data('action', 'settings')
      .appendTo(right);
    
    new metaScore.editor.Button()
      .attr({
        'title': metaScore.String.t('help')
      })
      .data('action', 'help')
      .appendTo(right);
    
  };
  
  MainMenu.prototype.enableItems = function(selector){
  
    var items = this.children(selector);
    
    items.removeClass('disabled');
  
    return items;
  
  };
  
  MainMenu.prototype.disableItems = function(selector){
  
    var items = this.children(selector);
    
    items.addClass('disabled');
  
    return items;
  
  };
    
  return MainMenu;
  
})();
/**
 * Overlay
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.editor.Overlay = (function(){

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  function Overlay(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Overlay.parent.call(this, '<div/>', {'class': 'overlay clearfix'});
    
    if(this.configs.modal){
      this.mask = new metaScore.Dom('<div/>', {'class': 'overlay-mask'});
    }
    
    if(this.configs.draggable){
      this.draggable = new metaScore.Draggable({'target': this, 'handle': this});
    }  
    
    if(this.configs.autoShow){
      this.show();
    }    
  }
  
  Overlay.defaults = {
    
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
    draggable: true,
    
    /**
    * True to show automatically
    */
    autoShow: false
  };
  
  metaScore.Dom.extend(Overlay);
  
  Overlay.prototype.show = function(){    
    if(this.configs.modal){
      this.mask.appendTo(this.configs.parent);
    }
  
    this.appendTo(this.configs.parent);
    
    return this;
  };
  
  Overlay.prototype.hide = function(){    
    if(this.configs.modal){
      this.mask.remove();
    }
  
    this.remove();
    
    return this;    
  };
    
  return Overlay;
  
})();
/**
 * Panel
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.string.js
 * @requires ../helpers/metaScore.function.js
 */
metaScore.editor.Panel = (function(){
  
  function Panel(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Panel.parent.call(this, '<div/>', {'class': 'panel'});
      
    // fix event handlers scope
    this.onComponentDragStart = metaScore.Function.proxy(this.onComponentDragStart, this);
    this.onComponentDrag = metaScore.Function.proxy(this.onComponentDrag, this);
    this.onComponentDragEnd = metaScore.Function.proxy(this.onComponentDragEnd, this);
    this.onComponentResizeStart = metaScore.Function.proxy(this.onComponentResizeStart, this);
    this.onComponentResize = metaScore.Function.proxy(this.onComponentResize, this);
    this.onComponentResizeEnd = metaScore.Function.proxy(this.onComponentResizeEnd, this);
    
    this.fields = {};
    
    this.menu = new metaScore.editor.DropDownMenu();
    
    metaScore.Array.each(this.configs.menuItems, function(index, item){
      this.menu.addItem(item);
    }, this);
  
    this.toolbar = new metaScore.editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    this.toolbar.getTitle()
      .addListener('click', metaScore.Function.proxy(this.toggleState, this));
      
    metaScore.Array.each(this.configs.toolbarButtons, function(index, action){
      this.toolbar.addButton(action);
    }, this);
    
    this.toolbar.addButton('menu')
      .append(this.menu);
    
    this.contents = new metaScore.Dom('<table/>', {'class': 'fields'})
      .appendTo(this);
      
    this.addDelegate('.field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this)); 
      
    this.setupFields();
  }

  Panel.defaults = {
    /**
    * The panel's title
    */
    title: '',
    
    toolbarButtons: [
      'previous',
      'next'
    ],
    
    menuItems: [],
    
    /**
    * The panel's fields
    */
    fields: {}
  };
  
  metaScore.Dom.extend(Panel);
  
  Panel.prototype.setupFields = function(){  
    var row, uuid, configs, field;
  
    metaScore.Object.each(this.configs.fields, function(key, value){      
      row = new metaScore.Dom('<tr/>', {'class': 'field-wrapper '+ key}).appendTo(this.contents);
    
      uuid = 'field-'+ metaScore.String.uuid(5);
      
      configs = value.configs || {};
      
      this.fields[key] = field = new value.type(configs).attr('id', uuid);
      field.data('name', key);
      
      new metaScore.Dom('<td/>').appendTo(row).append(new metaScore.Dom('<label/>', {'text': value.label, 'for': uuid}));
      new metaScore.Dom('<td/>').appendTo(row).append(field);      
    }, this);  
  };
  
  Panel.prototype.getToolbar = function(){    
    return this.toolbar;
  };
  
  Panel.prototype.getField = function(key){    
    if(key === undefined){
      return this.fields;
    }
    
    return this.fields[key];    
  };
  
  Panel.prototype.enableFields = function(){  
    metaScore.Object.each(this.fields, function(key, field){
      field.enable();
    }, this);    
  };
  
  Panel.prototype.toggleFields = function(enable){
    var component = this.getComponent();
  
    metaScore.Object.each(this.fields, function(key, field){
      if(component && ('filter' in this.configs.fields[key]) && this.configs.fields[key].filter(component) === false){
        this.hideField(key);
        field.disable();
      }
      else{
        this.showField(key);
        
        if(enable === true){
          field.enable();
        }
        else{
          field.disable();
        }
      }
    }, this);    
  };
  
  Panel.prototype.showField = function(key){
    this.contents.children('tr.field-wrapper.'+ key).show();
  };
  
  Panel.prototype.hideField = function(key){  
    this.contents.children('tr.field-wrapper.'+ key).hide();
  };
  
  Panel.prototype.toggleState = function(){    
    this.toggleClass('collapsed');
  };
  
  Panel.prototype.disable = function(){    
    this.addClass('disabled');
    this.getToolbar().getButton('previous').addClass('disabled');
    this.getToolbar().getButton('next').addClass('disabled');
  };
  
  Panel.prototype.enable = function(){    
    this.removeClass('disabled');
    this.getToolbar().getButton('previous').removeClass('disabled');
    this.getToolbar().getButton('next').removeClass('disabled');
  };
  
  Panel.prototype.getMenu = function(){  
    return this.menu;  
  };
  
  Panel.prototype.getComponent = function(){  
    return this.component;  
  };
  
  Panel.prototype.getDraggable = function(){  
    return false;
  };
  
  Panel.prototype.getResizable = function(){  
    return false;
  };
  
  Panel.prototype.setComponent = function(component, supressEvent){
    var draggable, resizable;
  
    if(component === this.getComponent()){
      return;
    }
    
    this.unsetComponent(supressEvent);
    
    this.component = component;
    
    this.toggleFields(true);
    this.enable();
    this.updateFieldValues(this.getValues(Object.keys(this.getField())), true);
    
    if(!(component instanceof metaScore.player.Controller)){
      this.getMenu().enableItems('[data-action="delete"]');
    }
    
    draggable = this.getDraggable();
    if(draggable){
      component._draggable = new metaScore.Draggable(draggable).enable();
      component
        .addListener('dragstart', this.onComponentDragStart)
        .addListener('drag', this.onComponentDrag)
        .addListener('dragend', this.onComponentDragEnd);
    }
    
    resizable = this.getResizable();
    if(resizable){
      component._resizable = new metaScore.Resizable(resizable).enable();      
      component
        .addListener('resizestart', this.onComponentResizeStart)
        .addListener('resize', this.onComponentResize)
        .addListener('resizeend', this.onComponentResizeEnd);
    }
    
    component.addClass('selected');
      
    if(supressEvent !== true){
      this.triggerEvent('componentset', {'component': component}, false);
    }
    
    return this;    
  };
  
  Panel.prototype.unsetComponent = function(supressEvent){  
    var component = this.getComponent();
      
    this.toggleFields(false);
    this.disable();
    this.getMenu().disableItems('[data-action="delete"]');
    
    if(component){
      if(component._draggable){
        component._draggable.destroy();
        delete component._draggable;
        
        component
          .removeListener('dragstart', this.onComponentDragStart)
          .removeListener('drag', this.onComponentDrag)
          .removeListener('dragend', this.onComponentDragEnd);
      }
      
      if(component._resizable){      
        component._resizable.destroy();
        delete component._resizable;
        
        component
          .removeListener('resizestart', this.onComponentResizeStart)
          .removeListener('resize', this.onComponentResize)
          .removeListener('resizeend', this.onComponentResizeEnd);
      }
  
      component.removeClass('selected');
      
      this.component = null;
    }
      
    if(supressEvent !== true){
      this.triggerEvent('componentunset', {'component': component}, false);
    }
    
    return this;    
  };
  
  Panel.prototype.onComponentDragStart = function(evt){
    var fields = ['x', 'y'];
    
    this._beforeDragValues = this.getValues(fields);
  };
  
  Panel.prototype.onComponentDrag = function(evt){
    var fields = ['x', 'y'];
    
    this.updateFieldValues(fields, true);
  };
  
  Panel.prototype.onComponentDragEnd = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y'];
    
    this.updateFieldValues(fields, true);
    
    this.triggerEvent('valueschange', {'component': component, 'old_values': this._beforeDragValues, 'new_values': this.getValues(fields)}, false);
    
    delete this._beforeDragValues;
  };
  
  Panel.prototype.onComponentResizeStart = function(evt){
    var fields = ['x', 'y', 'width', 'height'];
    
    this._beforeResizeValues = this.getValues(fields);
  };
  
  Panel.prototype.onComponentResize = function(evt){
    var fields = ['x', 'y', 'width', 'height'];
    
    this.updateFieldValues(fields, true);
  };
  
  Panel.prototype.onComponentResizeEnd = function(evt){
    var component = this.getComponent(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.updateFieldValues(fields, true);
    
    this.triggerEvent('valueschange', {'component': component, 'old_values': this._beforeResizeValues, 'new_values': this.getValues(fields)}, false);
    
    delete this._beforeResizeValues;
  };
  
  Panel.prototype.onFieldValueChange = function(evt){
    var component = this.getComponent(),
      field, value, old_values;
      
    if(!component){
      return;
    }
    
    field = evt.detail.field.data('name');
    value = evt.detail.value;
    old_values = this.getValues([field]);
    
    this.updateProperty(component, field, value);
    
    this.triggerEvent('valueschange', {'component': component, 'old_values': old_values, 'new_values': this.getValues([field])}, false);
  };
  
  Panel.prototype.updateFieldValue = function(name, value, supressEvent){
    var field = this.getField(name);
    
    if(field instanceof metaScore.editor.field.Boolean){
      field.setChecked(value);
    }
    else{
      field.setValue(value);
    }
    
    if(supressEvent !== true){
      field.triggerEvent('change');
    }
  };
  
  Panel.prototype.updateFieldValues = function(values, supressEvent){    
    if(metaScore.Var.is(values, 'array')){
      metaScore.Array.each(values, function(index, field){
        this.updateFieldValue(field, this.getValue(field), supressEvent);
      }, this);
    }
    else{
      metaScore.Object.each(values, function(field, value){
        this.updateFieldValue(field, value, supressEvent);
      }, this);
    }
  };
  
  Panel.prototype.updateProperty = function(component, name, value){
    component.setProperty(this.configs.fields[name].property, value);
  };
  
  Panel.prototype.updateProperties = function(component, values){  
    metaScore.Object.each(values, function(name, value){
      if(!this.getField(name).disabled){
        this.updateProperty(component, name, value);
      }
    }, this);
    
    this.updateFieldValues(values, true);  
  };
  
  Panel.prototype.getValue = function(name){
    var component = this.getComponent();
    
    return component.getProperty(this.configs.fields[name].property);
  };
  
  Panel.prototype.getValues = function(fields){
    var values = {};
    
    fields = fields || Object.keys(this.getField());
    
    metaScore.Array.each(fields, function(index, name){
      if(!this.getField(name).disabled){
        values[name] = this.getValue(name);
      }
    }, this);
    
    return values;  
  };
    
  return Panel;
  
})();
/**
 * Toolbar
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.editor.Toolbar = (function(){

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  function Toolbar(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Toolbar.parent.call(this, '<div/>', {'class': 'toolbar clearfix'});
    
    this.title = new metaScore.Dom('<div/>', {'class': 'title'})
      .appendTo(this);
    
    this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);
      
    if(this.configs.title){
      this.title.text(this.configs.title);
    }
  }
  
  Toolbar.defaults = {    
    /**
    * A text to add as a title
    */
    title: null
  };
  
  metaScore.Dom.extend(Toolbar);
  
  Toolbar.prototype.getTitle = function(){  
    return this.title;    
  };
  
  Toolbar.prototype.addButton = function(action){
    var button = new metaScore.editor.Button().data('action', action)
      .appendTo(this.buttons);
  
    return button;
  };
  
  Toolbar.prototype.getButton = function(action){  
    return this.buttons.children('[data-action="'+ action +'"]');
  };
    
  return Toolbar;
  
})();
/**
 * BooleanField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Boolean = (function () {
  
  function BooleanField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    BooleanField.parent.call(this, this.configs);
    
    if(this.configs.checked){
      this.attr('checked', 'checked');
    }
  }

  BooleanField.defaults = {
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
    disabled: false,
    
    attributes: {
      'type': 'checkbox',
      'class': 'field booleanfield'
    }
  };
  
  metaScore.editor.Field.extend(BooleanField);
  
  BooleanField.prototype.onChange = function(evt){      
    this.value = this.is(":checked") ? this.val() : this.configs.unchecked_value;
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);  
  };
  
  BooleanField.prototype.setChecked = function(checked){  
    this.attr('checked', checked ? 'checked' : '');  
  };
    
  return BooleanField;
  
})();
/**
 * ButtonField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Button = (function () {
  
  function ButtonField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    ButtonField.parent.call(this, this.configs);
  }
  
  metaScore.editor.Field.extend(ButtonField);
    
  return ButtonField;
  
})();
/**
 * ColorField
 *
 * @requires ../metaScore.editor.field.js
 * @requires ../../helpers/metaScore.object.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Color = (function () {
  
  function ColorField(configs) {
    this.configs = this.getConfigs(configs);
      
    // fix event handlers scope
    this.onGradientMousemove = metaScore.Function.proxy(this.onGradientMousemove, this);
    this.onAlphaMousemove = metaScore.Function.proxy(this.onAlphaMousemove, this);
  
    this.button = new metaScore.editor.Button()
      .addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    this.overlay = new metaScore.editor.Overlay()
      .addClass('colorfield-overlay');
    
    this.overlay.gradient = new metaScore.Dom('<div/>', {'class': 'gradient'}).appendTo(this.overlay);
    this.overlay.gradient.canvas = new metaScore.Dom('<canvas/>', {'width': '255', 'height': '255'})
      .addListener('click', metaScore.Function.proxy(this.onGradientClick, this))
      .addListener('mousedown', metaScore.Function.proxy(this.onGradientMousedown, this))
      .addListener('mouseup', metaScore.Function.proxy(this.onGradientMouseup, this))
      .appendTo(this.overlay.gradient);
    this.overlay.gradient.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(this.overlay.gradient);
        
    this.overlay.alpha = new metaScore.Dom('<div/>', {'class': 'alpha'}).appendTo(this.overlay);
    this.overlay.alpha.canvas = new metaScore.Dom('<canvas/>', {'width': '20', 'height': '255'})
      .addListener('click', metaScore.Function.proxy(this.onAlphaClick, this))
      .addListener('mousedown', metaScore.Function.proxy(this.onAlphaMousedown, this))
      .addListener('mouseup', metaScore.Function.proxy(this.onAlphaMouseup, this))
      .appendTo(this.overlay.alpha);
    this.overlay.alpha.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(this.overlay.alpha);
    
    this.overlay.controls = new metaScore.Dom('<div/>', {'class': 'controls'}).appendTo(this.overlay);
    
    this.overlay.controls.r = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'r'})
      .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'R', 'for': 'r'}))
      .append(this.overlay.controls.r)
      .appendTo(this.overlay.controls);
      
    this.overlay.controls.g = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'g'})
      .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'G', 'for': 'g'}))
      .append(this.overlay.controls.g)
      .appendTo(this.overlay.controls);
      
    this.overlay.controls.b = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'b'})
      .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'B', 'for': 'b'}))
      .append(this.overlay.controls.b)
      .appendTo(this.overlay.controls);
      
    this.overlay.controls.a = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '1', 'step': '0.01', 'name': 'a'})
      .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'A', 'for': 'a'}))
      .append(this.overlay.controls.a)
      .appendTo(this.overlay.controls);
      
    this.overlay.controls.current = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper current'})
      .append(this.overlay.controls.current)
      .appendTo(this.overlay.controls);
    
    this.overlay.controls.previous = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper previous'})
      .append(this.overlay.controls.previous)
      .appendTo(this.overlay.controls);
      
    this.overlay.controls.cancel = new metaScore.editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
      .appendTo(this.overlay.controls);
      
    this.overlay.controls.apply = new metaScore.editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
      .appendTo(this.overlay.controls);
          
    this.overlay.mask.addListener('click', metaScore.Function.proxy(this.onApplyClick, this));
    
    // call parent constructor
    ColorField.parent.call(this, this.configs);
    
    new metaScore.Dom('<div/>', {'class': 'icon'})
      .appendTo(this);
    
    this.button.appendTo(this);
    
    this.fillGradient();
  }
  
  ColorField.defaults = {
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
    disabled: false,
    
    tag: '<div/>',
    
    attributes: {
      'class': 'field colorfield'
    }
  };
  
  metaScore.editor.Field.extend(ColorField);
  
  ColorField.prototype.setValue = function(val, refillAlpha, updatePositions, updateInputs){
  
    var hsv;
  
    this.value = this.value || {};
    
    if(!metaScore.Var.is(val, 'object')){
      val = this.parseColor(val);
    }
  
    if('r' in val){
      this.value.r = parseInt(val.r, 10);
    }
    if('g' in val){
      this.value.g = parseInt(val.g, 10);
    }
    if('b' in val){
      this.value.b = parseInt(val.b, 10);
    }
    if('a' in val){
      this.value.a = parseFloat(val.a);
    }
    
    if(refillAlpha !== false){
      this.fillAlpha();
    }
    
    if(updateInputs !== false){
      this.overlay.controls.r.val(this.value.r);
      this.overlay.controls.g.val(this.value.g);
      this.overlay.controls.b.val(this.value.b);
      this.overlay.controls.a.val(this.value.a);
    }
    
    if(updatePositions !== false){
      hsv = this.rgb2hsv(this.value);
      
      this.overlay.gradient.position.css('left', ((1 - hsv.h) * 255) +'px');
      this.overlay.gradient.position.css('top', (hsv.s * (255 / 2)) + ((1 - (hsv.v/255)) * (255/2)) +'px');
      
      this.overlay.alpha.position.css('top', ((1 - this.value.a) * 255) +'px');
    }
    
    this.fillCurrent();
    
    this.button.css('background-color', 'rgba('+ this.value.r +','+ this.value.g +','+ this.value.b +','+ this.value.a +')');
  
  };
  
  ColorField.prototype.onClick = function(evt){  
    if(this.disabled){
      return;
    }
  
    this.previous_value = metaScore.Object.copy(this.value);
    
    this.fillPrevious();
  
    this.overlay.show();  
  };
  
  ColorField.prototype.onControlInput = function(evt){  
    var rgba, hsv;
    
    this.setValue({
      'r': this.overlay.controls.r.val(),
      'g': this.overlay.controls.g.val(),
      'b': this.overlay.controls.b.val(),
      'a': this.overlay.controls.a.val()
    }, true, true, false);  
  };
  
  ColorField.prototype.onCancelClick = function(evt){  
    this.setValue(this.previous_value);
    this.overlay.hide();
  
    evt.stopPropagation();
  };
  
  ColorField.prototype.onApplyClick = function(evt){  
    this.overlay.hide();
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  
    evt.stopPropagation();
  };
  
  ColorField.prototype.fillPrevious = function(){  
    var context = this.overlay.controls.previous.get(0).getContext('2d');
    
    context.fillStyle = "rgba("+ this.previous_value.r +","+ this.previous_value.g +","+ this.previous_value.b +","+ this.previous_value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);  
  };
  
  ColorField.prototype.fillCurrent = function(){  
    var context = this.overlay.controls.current.get(0).getContext('2d');
    
    context.fillStyle = "rgba("+ this.value.r +","+ this.value.g +","+ this.value.b +","+ this.value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);  
  };
  
  ColorField.prototype.fillGradient = function(){  
    var context = this.overlay.gradient.canvas.get(0).getContext('2d'),
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
  
  ColorField.prototype.fillAlpha = function(){  
    var context = this.overlay.alpha.canvas.get(0).getContext('2d'),
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
  
  ColorField.prototype.onGradientMousedown = function(evt){   
    this.overlay.gradient.canvas.addListener('mousemove', this.onGradientMousemove);
    
    evt.stopPropagation();
  };
  
  ColorField.prototype.onGradientMouseup = function(evt){
    this.overlay.gradient.canvas.removeListener('mousemove', this.onGradientMousemove);
    
    evt.stopPropagation();
  };
  
  ColorField.prototype.onGradientClick = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorX = evt.pageX - offset.left,
      colorY = evt.pageY - offset.top,
      context = this.overlay.gradient.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(colorX, colorY, 1, 1),
      value = this.value;
      
    this.overlay.gradient.position.css('left', colorX +'px');
    this.overlay.gradient.position.css('top', colorY +'px');
    
    value.r = imageData.data[0];
    value.g = imageData.data[1];
    value.b =  imageData.data[2];
    
    this.setValue(value, true, false);
    
    evt.stopPropagation();
  };
  
  ColorField.prototype.onGradientMousemove = ColorField.prototype.onGradientClick;
  
  ColorField.prototype.onAlphaMousedown = function(evt){   
    this.overlay.alpha.canvas.addListener('mousemove', this.onAlphaMousemove);
    
    evt.stopPropagation();
  };
  
  ColorField.prototype.onAlphaMouseup = function(evt){
    this.overlay.alpha.canvas.removeListener('mousemove', this.onAlphaMousemove);
    
    evt.stopPropagation();
  };
  
  ColorField.prototype.onAlphaClick = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorY = evt.pageY - offset.top,
      context = this.overlay.alpha.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(0, colorY, 1, 1),
      value = this.value;
      
    this.overlay.alpha.position.css('top', colorY +'px');
    
    value.a = Math.round(imageData.data[3] / 255 * 100) / 100;
    
    this.setValue(value, false, false);
    
    evt.stopPropagation();
  };
  
  ColorField.prototype.onAlphaMousemove = ColorField.prototype.onAlphaClick;
  
  ColorField.prototype.rgb2hsv = function (rgb){    
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
  
  ColorField.prototype.parseColor = function(color){ 
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
    
  return ColorField;
  
})();
/**
 * CornerField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Corner = (function () {
  
  function CornerField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    CornerField.parent.call(this, this.configs);
  }
  
  CornerField.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };
  
  metaScore.editor.Field.extend(CornerField);
    
  return CornerField;
  
})();
/* global Drupal */
/**
 * ImageField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Image = (function () {
  
  function ImageField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    ImageField.parent.call(this, this.configs);
    
    this.attr('readonly', 'readonly');
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
  }
  
  ImageField.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    attributes: {
      'class': 'field imagefield'
    }
  };
  
  metaScore.editor.Field.extend(ImageField);
  
  ImageField.prototype.onClick = function(evt){
    Drupal.media.popups.mediaBrowser(metaScore.Function.proxy(this.onFileSelect, this));
  };
  
  ImageField.prototype.onFileSelect = function(files){
    if(files.length > 0){
      this.setValue(files[0].url);
      this.triggerEvent('change');
    }
  };
    
  return ImageField;
  
})();
/**
 * IntegerField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Integer = (function () {
  
  function IntegerField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    IntegerField.parent.call(this, this.configs);
  }
  
  IntegerField.defaults = {
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
    max: null,
    
    attributes: {
      'type': 'number',
      'class': 'field integerfield'
    }
  };
  
  metaScore.editor.Field.extend(IntegerField);
    
  return IntegerField;
  
})();
/**
 * SelectField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Select = (function () {
  
  function SelectField(configs) {
    this.configs = this.getConfigs(configs);
  
    // call parent constructor
    SelectField.parent.call(this, this.configs);
    
    this.setOptions(this.configs.options);
  }
  
  SelectField.defaults = {
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
    options: {},
    
    tag: '<select/>',
    
    attributes: {
      'class': 'field selectfield'
    }
  };
  
  metaScore.editor.Field.extend(SelectField);
  
  SelectField.prototype.setOptions = function(options){  
    metaScore.Object.each(options, function(key, value){    
      this.append(new metaScore.Dom('<option/>', {'text': value, 'value': key}));
    }, this);    
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  SelectField.prototype.disable = function(){
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
  SelectField.prototype.enable = function(){
    this.disabled = false;
    
    this
      .attr('disabled', null)
      .removeClass('disabled');
    
    return this;
  };
    
  return SelectField;
  
})();
/**
 * TextField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Text = (function () {
  
  function TextField(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    TextField.parent.call(this, this.configs);
  }

  TextField.defaults = {
    /**
    * Defines the default value
    */
    value: '',
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    attributes: {
      'class': 'field textfield'
    }
  };
  
  metaScore.editor.Field.extend(TextField);
    
  return TextField;
  
})();
/**
 * TimeField
 *
 * @requires ../metaScore.editor.field.js
 */
 
metaScore.namespace('editor.field');

metaScore.editor.field.Time = (function () {
  
  function TimeField(configs) {
    this.configs = this.getConfigs(configs);
    
    this.hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'});
    this.minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'});
    this.seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'});
    this.centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'});
  
    // call parent constructor
    TimeField.parent.call(this, this.configs);
    
    this.hours.addListener('input', metaScore.Function.proxy(this.onInput, this)).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    this.minutes.addListener('input', metaScore.Function.proxy(this.onInput, this)).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    this.seconds.addListener('input', metaScore.Function.proxy(this.onInput, this)).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'}).appendTo(this);
    
    this.centiseconds.addListener('input', metaScore.Function.proxy(this.onInput, this)).appendTo(this);
  }
  
  TimeField.defaults = {
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
    max: null,
    
    tag: '<div/>',
    
    attributes: {
      'class': 'field timefield'
    }
  };
  
  metaScore.editor.Field.extend(TimeField);
  
  TimeField.prototype.onInput = function(evt){  
    var centiseconds_val = parseInt(this.centiseconds.val(), 10),
      seconds_val = parseInt(this.seconds.val(), 10),
      minutes_val = parseInt(this.minutes.val(), 10),
      hours_val = parseInt(this.hours.val(), 10);
      
    evt.stopPropagation();
    
    this.setValue((centiseconds_val * 10) + (seconds_val * 1000) + (minutes_val * 60000) + (hours_val * 3600000));
  };
  
  TimeField.prototype.setValue = function(milliseconds){      
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
    
    this.centiseconds.val(centiseconds_val);
    this.seconds.val(seconds_val);
    this.minutes.val(minutes_val);
    this.hours.val(hours_val);
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);  
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  TimeField.prototype.disable = function(){
    this.disabled = true;
    
    this.hours.attr('disabled', 'disabled');
    this.minutes.attr('disabled', 'disabled');
    this.seconds.attr('disabled', 'disabled');
    this.centiseconds.attr('disabled', 'disabled');
    
    this.addClass('disabled');
    
    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  TimeField.prototype.enable = function(){
    this.disabled = false;
    
    this.hours.attr('disabled', null);
    this.minutes.attr('disabled', null);
    this.seconds.attr('disabled', null);
    this.centiseconds.attr('disabled', null);
    
    this.removeClass('disabled');
    
    return this;
  };
    
  return TimeField;
  
})();
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
 
metaScore.namespace('editor.panel');

metaScore.editor.panel.Block = (function () {
  
  function BlockPanel(configs) {    
    // call parent constructor
    BlockPanel.parent.call(this, configs);
  }

  BlockPanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Block'),
    
    menuItems: [
      {
        'text': metaScore.String.t('Add a new block'),
        'data-action': 'new'
      },
      {
        'text': metaScore.String.t('Delete the active block'),
        'data-action': 'delete'
      }
    ],
    
    /**
    * The panel's fields
    */
    fields: {
      'name': {
        'type': metaScore.editor.field.Text,
        'label': metaScore.String.t('Name'),
        'property': 'name'
      },
      'x': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('X'),
        'property': 'x'
      },
      'y': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Y'),
        'property': 'y'
      },
      'width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Width'),
        'property': 'width',
        'filter': function(component){
          return !(component instanceof metaScore.player.Controller);
        }
      },
      'height': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Height'),
        'property': 'height',
        'filter': function(component){
          return !(component instanceof metaScore.player.Controller);
        }
      },
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color'),
        'property': 'bg-color',
        'filter': function(component){
          return !(component instanceof metaScore.player.Controller);
        }
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image'),
        'property': 'bg-image',
        'filter': function(component){
          return !(component instanceof metaScore.player.Controller);
        }
      },
      'synched': {
        'type': metaScore.editor.field.Boolean,
        'label': metaScore.String.t('Synchronized pages ?'),
        'property': 'synched',
        'filter': function(component){
          return !(component instanceof metaScore.player.Controller);
        }
      }
    }
  };
  
  metaScore.editor.Panel.extend(BlockPanel);
  
  BlockPanel.prototype.getDraggable = function(){
    var component = this.getComponent();
    
    if(component instanceof metaScore.player.Controller){
      return {
        'target': component,
        'handle': component.child('.timer'),
        'container': component.parents()
      };
    }
  
    return {
      'target': component,
      'handle': component.child('.pager'),
      'container': component.parents()
    };
  };
  
  BlockPanel.prototype.getResizable = function(){  
    var component = this.getComponent();
    
    if(component instanceof metaScore.player.Controller){
      return false;
    }
    
    return {
      'target': component,
      'container': component.parents()
    };
  };
    
  return BlockPanel;
  
})();
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
 
metaScore.namespace('editor.panel');

metaScore.editor.panel.Element = (function () {
  
  function ElementPanel(configs) {    
    // call parent constructor
    ElementPanel.parent.call(this, configs);
  }

  ElementPanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Element'),
    
    menuItems: [
      {
        'text': metaScore.String.t('Add a new cursor'),
        'data-action': 'new',
        'data-type': 'Cursor'
      },
      {
        'text': metaScore.String.t('Add a new image'),
        'data-action': 'new',
        'data-type': 'Image'
      },
      {
        'text': metaScore.String.t('Add a new text element'),
        'data-action': 'new',
        'data-type': 'Text'
      },
      {
        'text': metaScore.String.t('Delete the active element'),
        'data-action': 'delete'
      }
    ],
    
    /**
    * The panel's fields
    */
    fields: {
      'name': {
        'type': metaScore.editor.field.Text,
        'label': metaScore.String.t('Name'),
        'property': 'name'
      },
      'x': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('X'),
        'property': 'x'
      },
      'y': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Y'),
        'property': 'y'
      },
      'width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Width'),
        'property': 'width'
      },
      'height': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Height'),
        'property': 'height'
      },
      'r-index': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Reading index'),
        'property': 'r-index',
        'configs': {
          'min': 0
        }
      },
      'z-index': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Display index'),
        'property': 'z-index'
      },
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color'),
        'property': 'bg-color'
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image'),
        'property': 'bg-image'
      },
      'border-width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Border width'),
        'property': 'border-width'
      },
      'border-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Border color'),
        'property': 'border-color'
      },
      'rounded-conrners': {
        'type': metaScore.editor.field.Corner,
        'label': metaScore.String.t('Rounded conrners'),
        'property': 'rounded-conrners'
      },
      'start-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('Start time'),
        'property': 'start-time'
      },
      'end-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('End time'),
        'property': 'end-time'
      },
      'direction': {
        'type': metaScore.editor.field.Select,
        'label': metaScore.String.t('Direction'),
        'property': 'direction',
        'filter': function(component){
          return component.data('type') === 'cursor';
        },
        'configs': {
          'options': {
            'right': metaScore.String.t('Left > Right'),
            'left': metaScore.String.t('Right > Left'),
            'bottom': metaScore.String.t('Top > Bottom'),
            'top': metaScore.String.t('Bottom > Top'),
          }
        }
      },
      'cursor-width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Cursor width'),
        'property': 'cursor-width',
        'filter': function(component){
          return component.data('type') === 'cursor';
        }
      },
      'cursor-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Cursor color'),
        'property': 'cursor-color',
        'filter': function(component){
          return component.data('type') === 'cursor';
        }
      },
      'font-family': {
        'type': metaScore.editor.field.Select,
        'label': metaScore.String.t('Font'),
        'property': 'font-family',
        'filter': function(component){
          return component.data('type') === 'text';
        },
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
        }
      },
      'text-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Text color'),
        'property': 'text-color',
        'filter': function(component){
          return component.data('type') === 'text';
        }
      }
    }
  };
  
  metaScore.editor.Panel.extend(ElementPanel);
  
  ElementPanel.prototype.getDraggable = function(){
    var component = this.getComponent();
  
    return {
      'target': component,
      'handle': component,
      'container': component.parents()
    };
  };
  
  ElementPanel.prototype.getResizable = function(){
    var component = this.getComponent();
    
    return {
      'target': component,
      'container': component.parents()
    };
  };
  
  ElementPanel.prototype.setComponent = function(component, supressEvent){    
    // call parent function
    ElementPanel.parent.prototype.setComponent.call(this, component, supressEvent);
    
    if(component.data('type') === 'text'){
      component.setEditable(true);
    }
    
    return this;
  };
    
  return ElementPanel;
  
})();
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
 
metaScore.namespace('editor.panel');

metaScore.editor.panel.Page = (function () {
  
  function PagePanel(configs) {    
    // call parent constructor
    PagePanel.parent.call(this, configs);
  }

  PagePanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Page'),
    
    menuItems: [
      {
        'text': metaScore.String.t('Add a new page'),
        'data-action': 'new'
      },
      {
        'text': metaScore.String.t('Delete the active page'),
        'data-action': 'delete'
      }
    ],
    
    /**
    * The panel's fields
    */
    fields: {
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color'),
        'property': 'bg-color'
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image'),
        'property': 'bg-image'
      },
      'start-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('Start time'),
        'property': 'start-time'
      },
      'end-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('End time'),
        'property': 'end-time'
      }
    }
  };
  
  metaScore.editor.Panel.extend(PagePanel);
    
  return PagePanel;
  
})();
/**
 * Alert
 *
 * @requires ./metaScore.editor.Overlay.js
 */
 
metaScore.namespace('editor.overlay');

metaScore.editor.overlay.Alert = (function () {
  
  function Alert(configs) {
    this.configs = this.getConfigs(configs);
  
    // call parent constructor
    Alert.parent.call(this, this.configs);
    
    this.addClass('alert');
    
    this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);
      
    if(this.configs.buttons){
      
    }
    
    this.text = new metaScore.Dom('<div/>', {'class': 'text'})
      .appendTo(this);
      
    if(this.configs.text){
      this.setText(this.configs.text);
    }
  }

  Alert.defaults = {
    /**
    * The popup's title
    */
    title: '',
    
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
    draggable: false,
    
    text: '',
    
    buttons: []
  };
  
  metaScore.editor.Overlay.extend(Alert);
  
  Alert.prototype.setText = function(str){
    this.text.text(str);
  };
  
  Alert.prototype.setButtons = function(){
  };
    
  return Alert;
  
})();
/**
 * Popup
 *
 * @requires ./metaScore.editor.overlay.js
 */
 
metaScore.namespace('editor.overlay');

metaScore.editor.overlay.Popup = (function () {
  
  function Popup(configs) {
    this.configs = this.getConfigs(configs);
  
    // call parent constructor
    Popup.parent.call(this, this.configs);
    
    this.addClass('popup');
  
    this.toolbar = new metaScore.editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    this.toolbar.addButton('close')
      .addListener('click', metaScore.Function.proxy(this.onCloseClick, this));
    
    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this);
  }

  Popup.defaults = {
    /**
    * The popup's title
    */
    title: '',
    
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
    draggable: false
  };
  
  metaScore.editor.Overlay.extend(Popup);
  
  Popup.prototype.getToolbar = function(){    
    return this.toolbar;    
  };
  
  Popup.prototype.getContents = function(){    
    return this.contents;    
  };
  
  Popup.prototype.onCloseClick = function(){
    this.hide();
  };
    
  return Popup;
  
})();
/**
 * GuideSelector
 *
 * @requires ../metaScore.editor.popup.js
 * @requires ../../helpers/metaScore.ajax.js
 */
 
metaScore.namespace('editor.overlay.popup');

metaScore.editor.overlay.popup.GuideSelector = (function () {
  
  function GuideSelector(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    GuideSelector.parent.call(this, this.configs);
    
    this.addClass('guide-selector loading');
    
    new metaScore.Dom('<div/>', {'class': 'loading', 'text': metaScore.String.t('Loading...')})
      .appendTo(this.getContents());
    
    metaScore.Ajax.get(this.configs.url, {
      'success': metaScore.Function.proxy(this.onLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onLoadError, this)
    });
  }

  GuideSelector.defaults = {
    /**
    * The popup's title
    */
    title: metaScore.String.t('Select a guide'),
    
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
    draggable: false,
    
    /**
    * The url from which to retreive the list of guides
    */
    url: null,
    
    /**
    * A function to call when a guide is selected
    */
    selectCallback: metaScore.Function.emptyFn,
    
    /**
    * Whether to automatically hide the popup when a guide is selected
    */
    hideOnSelect: true
  };
  
  metaScore.editor.overlay.Popup.extend(GuideSelector);
  
  GuideSelector.prototype.onLoadSuccess = function(xhr){
  
    var contents = this.getContents(),
      data = JSON.parse(xhr.response),
      table, row;
      
    this.removeClass('loading');
      
    contents.empty();
      
    table = new metaScore.Dom('<table/>', {'class': 'guides'})
      .appendTo(contents);
    
    metaScore.Object.each(data, function(key, guide){
      row = new metaScore.Dom('<tr/>', {'class': 'guide guide-'+ guide.id})
        .addListener('click', metaScore.Function.proxy(this.onGuideClick, this, [guide]))
        .appendTo(table);
      
      new metaScore.Dom('<td/>', {'class': 'thumbnail'})
        .append(new metaScore.Dom('<img/>', {'src': guide.thumbnail.url}))
        .appendTo(row);
        
      new metaScore.Dom('<td/>', {'class': 'details'})
        .append(new metaScore.Dom('<h1/>', {'class': 'title', 'text': guide.title}))
        .append(new metaScore.Dom('<p/>', {'class': 'description', 'text': guide.description}))
        .append(new metaScore.Dom('<h2/>', {'class': 'author', 'text': guide.author.name}))
        .appendTo(row);
        
    }, this);    
  };
  
  GuideSelector.prototype.onLoadError = function(){    
  };
  
  GuideSelector.prototype.onGuideClick = function(guide){
    this.configs.selectCallback(guide);
    
    if(this.configs.hideOnSelect){
      this.hide();
    }
  };
    
  return GuideSelector;
  
})();
/**
 * Player
 *
 * @requires ../metaScore.base.js
 */
metaScore.Player = (function () {
  
  function Player(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Player.parent.call(this);
    
    this.id = this.configs.id || metaScore.String.uuid();
    
    this.media = new metaScore.player.Media({
        'type': this.configs.file.type,
        'sources': this.configs.transcoded_files
      })
      .addListener('play', metaScore.Function.proxy(this.onMediaPlay, this))
      .addListener('pause', metaScore.Function.proxy(this.onMediaPause, this))
      .appendTo(this.configs.container);
    
    this.controller = new metaScore.player.Controller(this.configs.controller)
      .addDelegate('.buttons button', 'click', metaScore.Function.proxy(this.onControllerButtonClick, this))
      .data('player-id', this.id)
      .appendTo(this.configs.container);   
    
    metaScore.Array.each(this.configs.blocks, function(index, configs){
      this.addBlock(metaScore.Object.extend({}, configs, {
        'container': this.configs.container,
        'listeners': {
          'propertychange': metaScore.Function.proxy(this.onComponenetPropertyChange, this)
        }
      }));
    }, this);
  }
  
  Player.defaults = {
    'container': 'body',
    'blocks': [],
    'keyboard': true
  };
  
  metaScore.Evented.extend(Player);
  
  Player.prototype.onControllerButtonClick = function(evt){  
    var action = metaScore.Dom.data(evt.target, 'action');
    
    switch(action){
      case 'rewind':
        this.media.reset();
        break;
        
      case 'play':
        if(this.media.isPlaying()){
          this.media.pause();
        }
        else{
          this.media.play();
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Player.prototype.onMediaPlay = function(evt){
    this.controller.addClass('playing');
  };
  
  Player.prototype.onMediaPause = function(evt){
    this.controller.removeClass('playing');
  };
  
  Player.prototype.onComponenetPropertyChange = function(evt){
    switch(evt.detail.property){
      case 'start-time':
      case 'end-time':
        console.log(evt.detail.property, evt.detail.value);
        break;
    }
  };
  
  Player.prototype.addBlock = function(configs){
    var block, page;
  
    if(configs instanceof metaScore.player.Block){
      block = configs;
    }
    else{
      block = new metaScore.player.Block(configs)
        .data('player-id', this.id);
    }
    
    this.triggerEvent('blockadd', {'player': this, 'block': block}, true, false);
    
    return block;
  };
  
  Player.prototype.destroy = function(parent){
    var blocks = metaScore.Dom.selectElements('.metaScore-block[data-player-id="'+ this.id +'"]', parent);
    
    metaScore.Array.each(blocks, function(index, block){
      block._metaScore.destroy();
    }, this);
  };
    
  return Player;
  
})();
/**
 * Player Block
 *
 * @requires metaScore.player.pager.js
 * @requires metaScore.player.page.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
 
metaScore.namespace('player');

metaScore.player.Block = (function () {

  function Block(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Block.parent.call(this, '<div/>', {'class': 'metaScore-block'});
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    if(this.configs.container){
      this.appendTo(this.configs.container);
    }
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
          
    this.pages = new metaScore.Dom('<div/>', {'class': 'pages'}).appendTo(this);
    this.pager = new metaScore.player.Pager().appendTo(this);
      
    this.pager.addDelegate('.button', 'click', metaScore.Function.proxy(this.onPagerClick, this));
    
    metaScore.Object.each(this.configs.listeners, function(key, value){
      this.addListener(key, value);
    }, this);
    
    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }
  
  Block.defaults = {
    'container': null,
    'player_id': null,
    'pages': []
  };
  
  metaScore.Dom.extend(Block);
  
  Block.prototype.onClick = function(evt){
    if(evt instanceof MouseEvent){
      this.triggerEvent('click', {'block': this});
    
      evt.stopPropagation();
    }
  };
  
  Block.prototype.onPagerClick = function(evt){
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
  };
  
  Block.prototype.getPages = function(){  
    return this.pages.children('.page');  
  };
  
  Block.prototype.addPage = function(configs){
    var page;
    
    if(configs instanceof metaScore.player.Page){
      page = configs;
    }
    else{
      page = new metaScore.player.Page(configs);
    }
  
    page.appendTo(this.pages);
    
    this.setActivePage(this.getPages().count() - 1);
    
    return page;
  };
  
  Block.prototype.getActivePage = function(){    
    var pages = this.getPages(),
      index = this.getActivePageIndex();
  
    if(index < 0){
      return null;
    }
  
    return this.getPages().get(index)._metaScore;
  };
  
  Block.prototype.getActivePageIndex = function(){    
    var pages = this.getPages(),
      index = pages.index('.active');
  
    return index;  
  };
  
  Block.prototype.getPageCount = function(){  
    return this.getPages().count();  
  };
  
  Block.prototype.setActivePage = function(page){    
    var pages = this.getPages();
      
    if(metaScore.Var.is(page, "number")){
      page = pages.get(page)._metaScore;
    }
  
    pages.removeClass('active');
    
    page.addClass('active');
    
    this.updatePager();
    
    this.triggerEvent('pageactivate', {'page': page});
  };
  
  Block.prototype.updatePager = function(){  
    var index = this.getActivePageIndex();
    var count = this.getPageCount();
  
    this.pager.updateCount(index, count);  
  };
  
  Block.prototype.isSynched = function(){    
    return this.data('synched') === "true";    
  };
  
  Block.prototype.getProperty = function(prop){
    switch(prop){
      case 'id':
        return this.data('id');
        
      case 'name':
        return this.data('name');
        
      case 'x':
        return parseInt(this.css('left'), 10);
        
      case 'y':
        return parseInt(this.css('top'), 10);
        
      case 'width':
        return parseInt(this.css('width'), 10);
        
      case 'height':
        return parseInt(this.css('height'), 10);
        
      case 'bg-color':
        return this.css('background-color');
        
      case 'bg-image':
        return this.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        
     case  'synched':
        return this.data('synched') === "true";
    }
  };
  
  Block.prototype.setProperty = function(prop, value){
    switch(prop){
      case 'id':
        this.data('id', value);
        break;
        
      case 'name':
        this.data('name', value);
        break;
        
      case 'x':
        this.css('left', value +'px');
        break;
        
      case 'y':
        this.css('top', value +'px');
        break;
        
      case 'width':
        this.css('width', value +'px');
        break;
        
      case 'height':
        this.css('height', value +'px');
        break;
        
      case 'bg-color':
        this.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
        
      case 'bg-image':
        this.css('background-image', 'url('+ value +')');
        break;
        
     case 'synched':
        this.data('synched', value);
        break;
        
     case 'pages':
        metaScore.Array.each(value, function(index, configs){
          this.addPage(configs);
        }, this);
        break;
    }
    
    this.triggerEvent('propertychange', {'property': prop, 'value': value});
  };
  
  Block.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Block;
  
})();
/**
 * Player Controller
 *
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
 
metaScore.namespace('player');

metaScore.player.Controller = (function () {

  function Controller(configs) {
    var buttons;
  
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Controller.parent.call(this, '<div/>', {'class': 'metaScore-block controller'});
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
          
    this.timer = new metaScore.Dom('<div/>', {'class': 'timer', 'text': '00:00.00'})
      .appendTo(this);
      
    buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);
          
    this.rewind_btn = new metaScore.Dom('<button/>')
      .data('action', 'rewind')
      .appendTo(buttons);
          
    this.play_btn = new metaScore.Dom('<button/>')
      .data('action', 'play')
      .appendTo(buttons);
    
    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }
  
  metaScore.Dom.extend(Controller);
  
  Controller.prototype.onClick = function(evt){
    if(evt instanceof MouseEvent){
      this.triggerEvent('click', {'block': this});
    
      evt.stopPropagation();
    }
  };
  
  Controller.prototype.getProperty = function(prop){
    switch(prop){
      case 'x':
        return parseInt(this.css('left'), 10);
        
      case 'y':
        return parseInt(this.css('top'), 10);
    }
  };
  
  Controller.prototype.setProperty = function(prop, value){
    switch(prop){        
      case 'x':
        this.css('left', value +'px');
        break;
        
      case 'y':
        this.css('top', value +'px');
        break;
    }
  };
  
  Controller.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Controller;
  
})();
/**
 * CuePoints
 *
 * @requires metaScore.player.media.js
 * @requires ../metaScore.base.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.var.js
 */
 
metaScore.namespace('player');

metaScore.player.CuePoints = (function () {
  
  function CuePoints(media) {  
    this.media = media;
    
    this.cuepoints = [];
    
    this.media.addEventListener('timeupdate', this.onMediaTimeUpdate);
  }
  
  metaScore.Class.extend(CuePoints);
  
  CuePoints.prototype.onMediaTimeUpdate = function(e){
    var curTime;
    
    curTime = parseFloat(this.media.currentTime);
    
    metaScore.Object.each(this.cuepoints, function (index, cuepoint) {
      if (!cuepoint.timer && curTime >= cuepoint.inTime - 0.5 && curTime < cuepoint.inTime) {
        this.setupTimer(cuepoint, (cuepoint.inTime - curTime) * 1000);
      }
    });
  };
  
  CuePoints.prototype.add = function(cuepoint){
    return this.cuepoints.push(cuepoint) - 1;
  };
  
  CuePoints.prototype.remove = function(index){
    var cuepoint = this.cuepoints[index];
  
    this.stop(cuepoint, false);
    
    this.cuepoints.splice(index, 1);
  };
  
  CuePoints.prototype.setupTimer = function(cuepoint, delay){
    cuepoint.timer = setTimeout(metaScore.Function.proxy(this.launch, this, cuepoint), delay);
  };
  
  CuePoints.prototype.launch = function(cuepoint){
    if(('onStart' in cuepoint) && metaScore.Var.is(cuepoint.onStart, 'function')){
      cuepoint.onStart(this.media);
    }    
  };
  
  CuePoints.prototype.stop = function(cuepoint, launchHandler){    
    if('timer' in cuepoint){
      clearTimeout(cuepoint.timer);
      delete cuepoint.timer;
    }
    
    if('interval' in cuepoint){
      clearInterval(cuepoint.interval);
      delete cuepoint.interval;
    }
    
    if(launchHandler !== false && ('onEnd' in cuepoint) && metaScore.Var.is(cuepoint.onEnd, 'function')){
      cuepoint.onEnd(this.media);
    }
  };
    
  return CuePoints;
  
})();
/**
 * Player Element
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Element = (function () {

  function Element(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Element.parent.call(this, '<div/>', {'class': 'element'});
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this);
    
    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }
  
  metaScore.Dom.extend(Element);
  
  Element.prototype.onClick = function(evt){
    if(evt instanceof MouseEvent){
      this.triggerEvent('click', {'element': this});
    
      evt.stopPropagation();
    }
  };
  
  Element.prototype.getProperty = function(prop){
    switch(prop){
      case 'id':
        return this.data('id');
        
      case 'name':
        return this.data('name');
        
      case 'x':
        return parseInt(this.css('left'), 10);
        
      case 'y':
        return parseInt(this.css('top'), 10);
        
      case 'width':
        return parseInt(this.css('width'), 10);
        
      case 'height':
        return parseInt(this.css('height'), 10);
        
      case 'r-index':
        return parseInt(this.data('r-index'), 10);
        
      case 'z-index':
        return parseInt(this.css('z-index'), 10);
        
      case 'bg-color':
        return this.css('background-color');
        
      case 'bg-image':
        return this.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        
      case 'border-width':
        return parseInt(this.css('border-width'), 10);
        
      case 'border-color':
        return this.css('border-color');
        
      case 'rounded-conrners':
        break;
        
      case 'start-time':
        return this.data('start-time');
        
      case 'end-time':
        return this.data('end-time');
        
      case 'direction':
        return this.data('direction');
        
      case 'cursor-width':
        return this.cursor.css('width');
        
      case 'cursor-color':
        return this.cursor.css('background-color');
        
      case 'font-family':
        return this.css('font-family');
        
      case 'text-color':
        return this.css('color');
    }
  };
  
  Element.prototype.setProperty = function(prop, value){
    switch(prop){
      case 'id':
        this.data('id', value);
        break;
        
      case 'name':
        this.data('name', value);
        break;
        
      case 'x':
        this.css('left', value +'px');
        break;
        
      case 'y':
        this.css('top', value +'px');
        break;
        
      case 'width':
        this.css('width', value +'px');
        break;
        
      case 'height':
        this.css('height', value +'px');
        break;
        
      case 'r-index':
        this.data('r-index', value);
        break;
        
      case 'z-index':
        this.css('z-index', value);
        break;
        
      case 'bg-color':
        this.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
        
      case 'bg-image':
        this.css('background-image', 'url('+ value +')');
        break;
        
      case 'border-width':
        this.css('border-width', value +'px');
        break;
        
      case 'border-color':
        this.css('border-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
        
      case 'rounded-conrners':
        break;
        
      case 'start-time':
        this.data('start-time', value);
        break;
        
      case 'end-time':
        this.data('end-time', value);
        break;
        
      case 'direction':
        this.data('direction', value);
        break;
        
      case 'cursor-width':
        this.cursor.css('width', value +'px');
        break;
        
      case 'cursor-color':
        this.cursor.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
        
      case 'font-family':
        this.css('font-family', value);
        break;
        
      case 'text-color':
        this.css('color', value);
        break;
    }
    
    this.triggerEvent('propertychange', {'property': prop, 'value': value});
  };
  
  Element.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Element;
  
})();
/**
 * Media
 *
 * @requires metaScore.player.js
 * @requires ../metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Media = (function () {
  
  function Media(configs){
    var sources = '';
  
    this.configs = this.getConfigs(configs);
    
    this.playing = false;
    
    metaScore.Array.each(this.configs.sources, function(index, source) {
      sources += '<source src="'+ source.url +'" type="'+ source.mime +'"></source>';
    });
    
    // call parent constructor
    Media.parent.call(this, '<'+ this.configs.type +'>'+ sources +'</'+ this.configs.type +'>', {'preload': 'auto'});
    
    this
      .addListener('play', metaScore.Function.proxy(this.onPlay, this))
      .addListener('pause', metaScore.Function.proxy(this.onPause, this));

    this.el = this.get(0);
  }

  Media.defaults = {
    'type': 'audio',
    'sources': []
  };
  
  metaScore.Dom.extend(Media);
  
  Media.prototype.onPlay = function(evt) {
    this.playing = true;
  };
  
  Media.prototype.onPause = function(evt) {
    this.playing = false;
  };
  
  Media.prototype.isPlaying = function() {
    return this.playing;
  };

  Media.prototype.reset = function(supressEvent) {
    this.setCurrentTime(0);
    
    if(supressEvent !== true){
      this.triggerEvent('reset');
    }
  };

  Media.prototype.play = function(supressEvent) {
    this.el.play();
    
    if(supressEvent !== true){
      this.triggerEvent('play');
    }
  };
  
  Media.prototype.pause = function(supressEvent) {
    this.el.pause();
    
    if(supressEvent !== true){
      this.triggerEvent('pause');
    }
  };
  
  Media.prototype.stop = function(supressEvent) {
    this.setCurrentTime(0);
    this.pause(true);
    
    if(supressEvent !== true){
      this.triggerEvent('stop');
    }
  };
  
  Media.prototype.setCurrentTime = function(time) {
    this.el.currentTime = time;
  };
  
  Media.prototype.getCurrentTime = function() {
    return this.el.currentTime;
  };
  
  Media.prototype.getDuration = function() {
    return this.el.duration;
  };
    
  return Media;
  
})();
/**
 * Player Page
 *
 * @requires metaScore.player.element.js
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Page = (function () {

  function Page(configs) {
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    Page.parent.call(this, '<div/>', {'class': 'page'});
    
    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;
    
    this.addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    metaScore.Object.each(this.configs, function(key, value){
      this.setProperty(key, value);
    }, this);
  }
  
  Page.defaults = {
    'elements': []
  };
  
  metaScore.Dom.extend(Page);
  
  Page.prototype.onClick = function(evt){  
    if(evt instanceof MouseEvent){
      this.triggerEvent('click', {'page': this});
    
      evt.stopPropagation();
    }
  };
  
  Page.prototype.addElement = function(configs){
    var element;
    
    if(configs instanceof metaScore.player.Element){
      element = configs;
    }
    else{
      element = new metaScore.player.element[configs.type](configs);
    }
    
    element.appendTo(this);
    
    return element;  
  };
  
  Page.prototype.getProperty = function(prop){
    switch(prop){
      case 'bg-color':
        return this.css('background-color');
        
      case 'bg-image':
        return this.css('background-image').replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        
      case 'start-time':
        console.log(this.data('ds'));
        return this.data('start-time');
        
      case 'end-time':
        return this.data('end-time');
    }
  };
  
  Page.prototype.setProperty = function(prop, value){
    switch(prop){
      case 'bg-color':
        this.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
        
      case 'bg-image':
        this.css('background-image', 'url('+ value +')');
        break;
        
      case 'start-time':
        this.data('start-time', value);
        break;
        
      case 'end-time':
        this.data('end-time', value);
        break;
        
     case 'elements':
        metaScore.Array.each(value, function(index, configs){
          this.addElement(configs);
        }, this);
        break;
    }
    
    this.triggerEvent('propertychange', {'property': prop, 'value': value});
  };
  
  Page.prototype.destroy = function(){
    this.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Page;
  
})();
/**
 * Player Page
 *
 * @requires ../helpers/metaScore.dom.js
 */
 
metaScore.namespace('player');

metaScore.player.Pager = (function () {

  function Pager(configs) {
    this.configs = this.getConfigs(configs);
  
    // call parent constructor
    Pager.parent.call(this, '<div/>', {'class': 'pager'});
    
    this.count = new metaScore.Dom('<div/>', {'class': 'count'}).appendTo(this);      
    this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .addListener('mousedown', function(evt){
        evt.stopPropagation();
      })
      .appendTo(this);        
    this.buttons.first = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'first'}).appendTo(this.buttons);      
    this.buttons.previous = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'previous'}).appendTo(this.buttons);      
    this.buttons.next = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'next'}).appendTo(this.buttons);
  }
  
  metaScore.Dom.extend(Pager);
  
  Pager.prototype.updateCount = function(index, count){
  
    this.count.text(metaScore.String.t('page !current/!count', {'!current': (index + 1), '!count': count}));
    
    this.buttons.first.toggleClass('inactive', index === 0);
    this.buttons.previous.toggleClass('inactive', index === 0);
    this.buttons.next.toggleClass('inactive', index >= count - 1);
  
  };
    
  return Pager;
  
})();
/**
 * Cursor
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.element');

metaScore.player.element.Cursor = (function () {

  function Cursor(configs) {  
    // call parent constructor
    Cursor.parent.call(this, configs);
    
    this.data('type', 'cursor');
    
    this.cursor = new metaScore.Dom('<div/>', {'class': 'cursor'})
      .appendTo(this.contents);
  }
  
  metaScore.player.Element.extend(Cursor);
    
  return Cursor;
  
})();
/**
 * Image
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.element');

metaScore.player.element.Image = (function () {

  function Image(configs) {
    // call parent constructor
    Image.parent.call(this, configs);
    
    this.data('type', 'image');    
  }
  
  metaScore.player.Element.extend(Image);
    
  return Image;
  
})();
/**
 * Text
 *
 * @requires ../metaScore.player.element.js
 */
 
metaScore.namespace('player.element');

metaScore.player.element.Text = (function () {

  function Text(configs) {  
    // call parent constructor
    Text.parent.call(this, configs);
    
    this.data('type', 'text');
    
    this.text = new metaScore.Dom('<div/>', {'class': 'text'})
      .appendTo(this.contents);
  }
  
  metaScore.player.Element.extend(Text);
  
  Text.prototype.setEditable = function(editable){
    this.text.attr('contenteditable', editable ? 'true' : 'null');
  };
    
  return Text;
  
})();

  global.metaScore = metaScore;

} (this));