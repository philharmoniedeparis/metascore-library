/*! metaScore - v0.0.1 - 2014-09-12 - Oussama Mubarak */
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
    
    if(!child.hasOwnProperty('defaults')){
      child.defaults = {};
    }
    
    for(var prop in this.defaults){
      if(!child.defaults.hasOwnProperty(prop)){
        child.defaults[prop] = this.defaults[prop];
      }
    } 
  };
  
  Class.prototype.getConfigs = function(configs){
    configs = configs || {};
  
    for(var prop in this.constructor.defaults){
      if(!configs.hasOwnProperty(prop)){
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
      useCapture = Dom.bubbleEvents.hasOwnProperty('type') ? Dom.bubbleEvents[type] : false;
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
      useCapture = Dom.bubbleEvents.hasOwnProperty('type') ? Dom.bubbleEvents[type] : false;
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
    if(elements.hasOwnProperty('length')){
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
      if (obj.hasOwnProperty(key)) {
        value = callback.call(scope_provided ? scope : obj[key], key, obj[key]);
      
        if (value === false) {
          break;
        }
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
    
    if(this.configs.container){
      this.appendTo(this.configs.container);
    } 
  
    // add components    
    this.workspace = new metaScore.Dom('<div/>', {'class': 'workspace'}).appendTo(this);      
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
      .addListener('blockset', metaScore.Function.proxy(this.onBlockSet, this))
      .addListener('blockunset', metaScore.Function.proxy(this.onBlockUnset, this))
      .addListener('valueschange', metaScore.Function.proxy(this.onBlockPanelValueChange, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onBlockPanelToolbarClick, this));
    
    this.page_panel
      .addListener('pageset', metaScore.Function.proxy(this.onPageSet, this))
      .addListener('pageunset', metaScore.Function.proxy(this.onPageUnset, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onPagePanelToolbarClick, this));
    
    this.element_panel
      .addListener('elementset', metaScore.Function.proxy(this.onElementSet, this))
      .getToolbar().addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onElementPanelToolbarClick, this));
    
    this.player_body
      .addListener('click', metaScore.Function.proxy(this.onPlayerClick, this))
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));
      
    this.history
      .addListener('add', metaScore.Function.proxy(this.onHistoryAdd, this))
      .addListener('undo', metaScore.Function.proxy(this.onHistoryUndo, this))
      .addListener('redo', metaScore.Function.proxy(this.onHistoryRedo, this));

    new metaScore.Dom('body')
      .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
      .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));
      
    this.addPlayer({'container': this.player_body});
      
    this.block_panel.unsetBlock();
  }
  
  metaScore.Dom.extend(Editor);
  
  Editor.prototype.addPlayerCSS = function(url){
    new metaScore.Dom('<link/>', {'rel': 'stylesheet', 'type': 'text/css', 'href': url}).appendTo(this.player_head);
  };
  
  Editor.prototype.addPlayer = function(configs){
    configs.container = this.player_body;
  
    this.player = new metaScore.Player(configs)
      .addListener('blockclick', metaScore.Function.proxy(this.onBlockClick, this))
      .addListener('pageclick', metaScore.Function.proxy(this.onPageClick, this))
      .addListener('elementclick', metaScore.Function.proxy(this.onElementClick, this))
      .addListener('pageactivate', metaScore.Function.proxy(this.onPageActivated, this));
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

    this.block_panel.setBlock(block);
    
    return block;
  };
  
  Editor.prototype.addPage = function(block, page){
    if(!(page instanceof metaScore.player.Page)){
      page = block.addPage(page);
    }
    
    this.page_panel.setPage(page);
    
    return page;
  };
  
  Editor.prototype.addElement = function(page, element){
    if(!(element instanceof metaScore.player.Element)){
      element = page.addElement(element);
    }
    
    this.element_panel.setElement(element);
    
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
    var configs = JSON.parse(xhr.response);
    
    this.removePlayer();
    this.addPlayer(configs);
    
    this.alert.hide();
    
    delete this.alert;
  };
  
  Editor.prototype.onGuideLoadError = function(evt){
  
  };
  
  Editor.prototype.onKeydown = function(evt){
    switch(evt.keyCode){
      case 18: //alt
        this.player_body.addClass('alt-down');
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
        this.player_body.removeClass('alt-down');
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
    var block = evt.detail.block;
    
    this.page_panel.setPage(block.getActivePage(), true);
    this.page_panel.getMenu().enableItems('[data-action="new"]');
    this.element_panel.getMenu().enableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onBlockUnset = function(evt){
    this.page_panel.unsetPage();
    this.page_panel.getMenu().disableItems('[data-action="new"]');
  };
  
  Editor.prototype.onBlockPanelValueChange = function(evt){
    var block = evt.detail.block,
      old_values = evt.detail.old_values,
      new_values = evt.detail.new_values;
     
    this.history.add({
      'undo': metaScore.Function.proxy(this.block_panel.updateBlockProperties, this.block_panel, [block, old_values]),
      'redo': metaScore.Function.proxy(this.block_panel.updateBlockProperties, this.block_panel, [block, new_values])
    });
  };
  
  Editor.prototype.onBlockPanelToolbarClick = function(evt){
    var block;
  
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        block = this.addBlock({'container': this.player_body});
            
        this.history.add({
          'undo': metaScore.Function.proxy(block.destroy, this),
          'redo': metaScore.Function.proxy(this.addBlock, this, [block])
        });
        break;
        
      case 'delete':
        block = this.block_panel.getBlock();
        
        if(block){
          block.destroy();
          this.block_panel.unsetBlock();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addBlock, this, [block]),
            'redo': metaScore.Function.proxy(block.destroy, this)
          });
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageSet = function(evt){
    var page = evt.detail.page,
      block = page.dom.parents().parents().get(0)._metaScore;
    
    this.block_panel.setBlock(block, true);
    this.page_panel.getMenu().enableItems('[data-action="new"]');
    this.element_panel.getMenu().enableItems('[data-action="new"]');
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageUnset = function(evt){
    this.element_panel.unsetElement();
    this.element_panel.getMenu().disableItems('[data-action="new"]');
  };
  
  Editor.prototype.onPagePanelToolbarClick = function(evt){
    var block, page;
  
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        block = this.block_panel.getBlock();
        page = this.addPage(block);
            
        this.history.add({
          'undo': metaScore.Function.proxy(page.destroy, this),
          'redo': metaScore.Function.proxy(this.addPage, this, [block, page])
        });
        break;
        
      case 'delete':
        block = this.block_panel.getBlock();
        page = this.page_panel.getPage();
        
        if(page){
          page.destroy();
          this.page_panel.unsetPage();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addPage, this, [block, page]),
            'redo': metaScore.Function.proxy(page.destroy, this)
          });
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementSet = function(evt){
    var element = evt.detail.element,
      page = element.dom.parents().get(0)._metaScore,
      block = page.dom.parents().parents().get(0)._metaScore;
    
    this.page_panel.setPage(page, true);
    this.block_panel.setBlock(block, true);
      
    evt.stopPropagation();
  };
  
  Editor.prototype.onElementPanelToolbarClick = function(evt){
    var page, element;
  
    switch(metaScore.Dom.data(evt.target, 'action')){
      case 'new':
        page = this.page_panel.getPage();
        element = this.addElement(page, {'type': metaScore.Dom.data(evt.target, 'type')});
    
        this.element_panel.setElement(element);
            
        this.history.add({
          'undo': metaScore.Function.proxy(element.destroy, this),
          'redo': metaScore.Function.proxy(this.addElement, this, [page, element])
        });
        break;
        
      case 'delete':
        page = this.page_panel.getPage();
        element = this.element_panel.getElement();
        
        if(element){
          element.destroy();
          this.element_panel.unsetElement();
            
          this.history.add({
            'undo': metaScore.Function.proxy(this.addElement, this, [page, element]),
            'redo': metaScore.Function.proxy(element.destroy, this)
          });
        }
        break;
    }
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onBlockClick = function(evt){
    this.block_panel.setBlock(evt.detail.block);
  };
  
  Editor.prototype.onPageClick = function(evt){
    this.page_panel.setPage(evt.detail.page);
  };
  
  Editor.prototype.onElementClick = function(evt){
    this.element_panel.setElement(evt.detail.element);
  };
  
  Editor.prototype.onPlayerClick = function(evt){
    this.block_panel.unsetBlock();
    
    evt.stopPropagation();
  };
  
  Editor.prototype.onPageActivated = function(evt){
    var page = evt.detail.page;
    
    this.page_panel.setPage(page);
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
  
  Field.prototype.setValue = function(val){    
    this.val(val);  
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
    if (command && command.hasOwnProperty(action)) {      
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
    
    this.fields = {};
  
    this.toolbar = new metaScore.editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    this.toolbar.getTitle()
      .addListener('click', metaScore.Function.proxy(this.toggleState, this));
    
    this.contents = new metaScore.Dom('<table/>', {'class': 'fields'})
      .appendTo(this);
      
    this.setupFields();    
  }

  Panel.defaults = {
    /**
    * The panel's title
    */
    title: '',
    
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
  
  Panel.prototype.disableFields = function(){
  
    metaScore.Object.each(this.fields, function(key, field){
      field.disable();
    }, this);
    
  };
  
  Panel.prototype.showFields = function(keys){
  
    if(!keys){
      this.contents.children('tr.field-wrapper').show();
    }
    else if(keys.length > 0){
      this.contents.children('tr.field-wrapper.'+ keys.join(', tr.field-wrapper.')).show();
    }
    
  };
  
  Panel.prototype.hideFields = function(keys){
  
    if(!keys){
      this.contents.children('tr.field-wrapper').hide();
    }
    else if(keys.length > 0){
      this.contents.children('tr.field-wrapper.'+ keys.join(', tr.field-wrapper.')).hide();
    }
    
  };
  
  Panel.prototype.toggleState = function(evt){
    
    this.toggleClass('collapsed');
    
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
  
  Toolbar.prototype.addButton = function(configs){
  
    return new metaScore.editor.Button(configs)
      .appendTo(this.buttons);
  
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

    this.addListener('change', metaScore.Function.proxy(this.onFileSelect, this), false);
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
      'type': 'file',
      'class': 'field imagefield'
    }
  };
  
  metaScore.editor.Field.extend(ImageField);
  
  ImageField.prototype.setValue = function(val, triggerChange){  
    this.value = val;
    
    if(triggerChange !== false){
      this.triggerEvent('valuechange', {'field': this, 'value': this.value}, false, true);
    }  
  };
  
  ImageField.prototype.onFileSelect = function(evt) {  
    var files = evt.target.files;
  
    if(files.length > 0 && files[0].type.match('image.*')){
      this.file = files[0];
    }
    else{
      this.file = null;
    }
    
    /*this.getBase64(function(result){
      this.setValue(result);
    });*/    
  };
  
  ImageField.prototype.getBase64 = function(callback){  
    var reader;
  
    if(this.file){
      reader = new FileReader();
      reader.onload = metaScore.Function.proxy(function(evt){
        callback.call(this, evt.target.result, evt);
      }, this);
      reader.readAsDataURL(this.file);
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
  
  SelectField.prototype.setValue = function(value){
    
    this.val(value);
    
    this.triggerEvent('valuechange', {'field': this, 'value': this.value}, true, false);
  
  };
  
  SelectField.prototype.getValue = function(){
  
    return this.value;
  
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
  
  TimeField.prototype.getValue = function(){
  
    return this.value;
  
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
    this.configs = this.getConfigs(configs);
    
    // call parent constructor
    BlockPanel.parent.call(this, this.configs);
      
    // fix event handlers scope
    this.onBlockDragStart = metaScore.Function.proxy(this.onBlockDragStart, this);
    this.onBlockDragEnd = metaScore.Function.proxy(this.onBlockDragEnd, this);
    this.onBlockResizeStart = metaScore.Function.proxy(this.onBlockResizeStart, this);
    this.onBlockResizeEnd = metaScore.Function.proxy(this.onBlockResizeEnd, this);
    
    this.menu = new metaScore.editor.DropDownMenu();
    this.menu.addItem({'text': metaScore.String.t('Add a new block'), 'data-action': 'new'});
    this.menu.addItem({'text': metaScore.String.t('Delete the active block'), 'data-action': 'delete'});
    
    this.getToolbar().addButton()
      .data('action', 'menu')
      .append(this.menu);
      
    this.addDelegate('.field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this));
  }

  BlockPanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Block'),
    
    /**
    * The panel's fields
    */
    fields: {
      'name': {
        'type': metaScore.editor.field.Text,
        'label': metaScore.String.t('Name')
      },
      'x': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('X')
      },
      'y': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Y')
      },
      'width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Width')
      },
      'height': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Height')
      },
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color')
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image')
      },
      'synched': {
        'type': metaScore.editor.field.Boolean,
        'label': metaScore.String.t('Synchronized pages ?')
      }
    }
  };
  
  metaScore.editor.Panel.extend(BlockPanel);
  
  BlockPanel.prototype.getMenu = function(){  
    return this.menu;  
  };
  
  BlockPanel.prototype.getBlock = function(){  
    return this.block;  
  };
  
  BlockPanel.prototype.setBlock = function(block, supressEvent){  
    if(block === this.getBlock()){
      return;
    }
    
    this.unsetBlock(supressEvent);
    
    this.block = block;
    
    this.enableFields();
    this.updateFieldValues(this.getValues(Object.keys(this.getField())), true);
    this.getMenu().enableItems('[data-action="delete"]');
    
    block._draggable = new metaScore.Draggable({'target': block.dom, 'handle': block.dom.child('.pager'), 'container': block.dom.parents()}).enable();
    block._resizable = new metaScore.Resizable({'target': block.dom, 'container': block.dom.parents()}).enable();
    
    block.dom
      .addListener('dragstart', this.onBlockDragStart)
      .addListener('dragend', this.onBlockDragEnd)
      .addListener('resizestart', this.onBlockResizeStart)
      .addListener('resizeend', this.onBlockResizeEnd)
      .addClass('selected');
      
    if(supressEvent !== true){
      this.triggerEvent('blockset', {'block': block});
    }
    
    return this;    
  };
  
  BlockPanel.prototype.unsetBlock = function(supressEvent){  
    var block = this.getBlock();
      
    this.disableFields();    
    this.getMenu().disableItems('[data-action="delete"]');
    
    if(block){
      block._draggable.destroy();
      delete block._draggable;
      
      block._resizable.destroy();
      delete block._resizable;
  
      block.dom
        .removeListener('dragstart', this.onBlockDragStart)
        .removeListener('dragend', this.onBlockDragEnd)
        .removeListener('resizestart', this.onBlockResizeStart)
        .removeListener('resizeend', this.onBlockResizeEnd)
        .removeClass('selected');
      
      this.block = null;
    }
      
    if(supressEvent !== true){
      this.triggerEvent('blockunset', {'block': block});
    }
    
    return this;    
  };
  
  BlockPanel.prototype.onBlockDragStart = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y'];
    
    this.beforeDragValues = this.getValues(fields);
  };
  
  BlockPanel.prototype.onBlockDragEnd = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y'];
    
    this.updateFieldValues(fields, true);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': this.beforeDragValues, 'new_values': this.getValues(fields)});
    
    delete this.beforeDragValues;
  };
  
  BlockPanel.prototype.onBlockResizeStart = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.beforeResizeValues = this.getValues(fields);
  };
  
  BlockPanel.prototype.onBlockResizeEnd = function(evt){
    var block = this.getBlock(),
      fields = ['x', 'y', 'width', 'height'];
    
    this.updateFieldValues(fields, true);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': this.beforeResizeValues, 'new_values': this.getValues(fields)});
    
    delete this.beforeResizeValues;
  };
  
  BlockPanel.prototype.onFieldValueChange = function(evt){
    var block = this.getBlock(),
      field, value, old_values;
      
    if(!block){
      return;
    }
    
    field = evt.detail.field.data('name');
    value = evt.detail.value;
    old_values = this.getValues([field]);
    
    this.updateBlockProperty(block, field, value);
    
    this.triggerEvent('valueschange', {'block': block, 'old_values': old_values, 'new_values': this.getValues([field])});
  };
  
  BlockPanel.prototype.updateFieldValue = function(name, value, supressEvent){
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
  
  BlockPanel.prototype.updateFieldValues = function(values, supressEvent){  
    var block = this.getBlock();
    
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
  
  BlockPanel.prototype.updateBlockProperty = function(block, name, value){  
    switch(name){
      case 'x':
        block.dom.css('left', value +'px');
        break;
      case 'y':
        block.dom.css('top', value +'px');
        break;
      case 'width':
        block.dom.css('width', value +'px');
        break;
      case 'height':
        block.dom.css('height', value +'px');
        break;
      case 'bg-color':
        block.dom.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg-image':
        // TODO
        break;
      case 'synched':
        block.dom.data('synched', value);
        break;
    }  
  };
  
  BlockPanel.prototype.updateBlockProperties = function(block, values){
    metaScore.Object.each(values, function(name, value){
      this.updateBlockProperty(block, name, value);
    }, this);
    
    this.updateFieldValues(values, true);  
  };
  
  BlockPanel.prototype.getValue = function(name){
    var block = this.getBlock(),
      value;
  
    switch(name){
      case 'x':
        value = parseInt(block.dom.css('left'), 10);
        break;
      case 'y':
        value = parseInt(block.dom.css('top'), 10);
        break;
      case 'width':
       value = parseInt(block.dom.css('width'), 10);
        break;
      case 'height':
        value = parseInt(block.dom.css('height'), 10);
        break;
      case 'bg-color':
        value = block.dom.css('background-color');
        break;
      case 'bg-image':
        // TODO
        break;
      case 'synched':
        value = block.dom.data('synched') === "true";
        break;
    }
    
    return value;  
  };
  
  BlockPanel.prototype.getValues = function(fields){
    var block = this.getBlock(),
      values = {};
    
    fields = fields || Object.keys(this.getField());
    
    metaScore.Array.each(fields, function(index, field){
      values[field] = this.getValue(field);
    }, this);
    
    return values;  
  };
    
  return BlockPanel;
  
})();
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
 
metaScore.namespace('editor.panel');
 
metaScore.editor.panel.Element = (function () {
  
  function ElementPanel(configs) {
    var toolbar;
    
    this.configs = this.getConfigs(configs);
  
    // call parent constructor
    ElementPanel.parent.call(this, this.configs);
      
    // fix event handlers scope
    this.onElementDrag = metaScore.Function.proxy(this.onElementDrag, this);
    this.onElementResize = metaScore.Function.proxy(this.onElementResize, this);
    
    toolbar = this.getToolbar();
    
    toolbar.addButton().data('action', 'previous');
    toolbar.addButton().data('action', 'next');
    
    this.menu = new metaScore.editor.DropDownMenu();
    this.menu.addItem({'text': metaScore.String.t('Add a new cursor'), 'data-action': 'new', 'data-type': 'Cursor'});
    this.menu.addItem({'text': metaScore.String.t('Add a new image'), 'data-action': 'new', 'data-type': 'Image'});
    this.menu.addItem({'text': metaScore.String.t('Add a new text element'), 'data-action': 'new', 'data-type': 'Text'});
    this.menu.addItem({'text': metaScore.String.t('Delete the active element'), 'data-action': 'delete'});
    
    toolbar.addButton()
      .data('action', 'menu')
      .append(this.menu);
      
    this.addDelegate('.field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this));
  }

  ElementPanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Element'),
    
    /**
    * The panel's fields
    */
    fields: {
      'name': {
        'type': metaScore.editor.field.Text,
        'label': metaScore.String.t('Name'),
      },
      'x': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('X')
      },
      'y': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Y')
      },
      'width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Width')
      },
      'height': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Height')
      },
      'r-index': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Reading index'),
        'configs': {
          'min': 0
        }
      },
      'z-index': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Display index')
      },
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color')
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image')
      },
      'border-width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Border width')
      },
      'border-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Border color')
      },
      'rounded-conrners': {
        'type': metaScore.editor.field.Corner,
        'label': metaScore.String.t('Rounded conrners')
      },
      'start-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('Start time')
      },
      'end-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('End time')
      },
      'direction': {
        'type': metaScore.editor.field.Select,
        'configs': {
          'options': {
            'right': metaScore.String.t('Left > Right'),
            'left': metaScore.String.t('Right > Left'),
            'bottom': metaScore.String.t('Top > Bottom'),
            'top': metaScore.String.t('Bottom > Top'),
          }
        },
        'label': metaScore.String.t('Direction'),
        'element-types': ['cursor']
      },
      'cursor-width': {
        'type': metaScore.editor.field.Integer,
        'label': metaScore.String.t('Cursor width'),
        'element-types': ['cursor']
      },
      'cursor-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Cursor color'),
        'element-types': ['cursor']
      },
      'font-family': {
        'type': metaScore.editor.field.Select,
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
        'label': metaScore.String.t('Font'),
        'element-types': ['text']
      },
      'text-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Text color'),
        'element-types': ['text']
      }
    }
  };
  
  metaScore.editor.Panel.extend(ElementPanel);
  
  ElementPanel.prototype.getMenu = function(){  
    return this.menu;  
  };
  
  ElementPanel.prototype.getElement = function(){  
    return this.element;  
  };
  
  ElementPanel.prototype.setElement = function(element, supressEvent){  
    if(this.element && (this.element.dom.get(0) === element.dom.get(0))){
      return;
    }
    
    this.unsetElement(this.element, supressEvent);
    
    this.element = element;
    
    if(this.element.dom.data('type') === 'text'){
      this.element.setEditable(true);
    }
    
    this.toggleFields();
    this.updateValues();
    this.enableFields();
    this.getMenu().enableItems('[data-action="delete"]');
    
    this.element._draggable = new metaScore.Draggable({'target': this.element.dom, 'handle': this.element.dom, 'container': this.element.dom.parents()}).enable();
    this.element._resizable = new metaScore.Resizable({'target': this.element.dom, 'container': this.element.dom.parents()}).enable();
    
    this.element.dom
      .addListener('drag', this.onElementDrag)
      .addListener('resize', this.onElementResize)
      .addClass('selected');
    
    if(supressEvent !== true){
      this.triggerEvent('elementset', {'element': this.element});
    }
    
    return this;    
  };
  
  ElementPanel.prototype.unsetElement = function(element, supressEvent){
    element = element || this.getElement();
      
    this.disableFields();
    this.getMenu().disableItems('[data-action="delete"]');
  
    if(element){
      element._draggable.destroy();
      delete element._draggable;
      
      element._resizable.destroy();
      delete element._resizable;
  
      element.dom
        .removeListener('drag', this.onElementDrag)
        .removeListener('resize', this.onElementResize)
        .removeClass('selected');
    
      if(this.element.dom.data('type') === 'text'){
        this.element.setEditable(false);
      }
      
      this.element = null;
    }
    
    if(supressEvent !== true){
      this.triggerEvent('elementunset', {'element': element});
    }
    
    return this;    
  };
  
  ElementPanel.prototype.onElementDrag = function(evt){  
    this.updateValues(['x', 'y']);
  };
  
  ElementPanel.prototype.onElementResize = function(evt){  
    this.updateValues(['x', 'y', 'width', 'height']);
  };
  
  ElementPanel.prototype.onFieldValueChange = function(evt){  
    var field = evt.detail.field,
      value = evt.detail.value;
      
    if(!this.element){
      return;
    }
  
    switch(field.data('name')){
      case 'x':
        this.element.dom.css('left', value +'px');
        break;
      case 'y':
        this.element.dom.css('top', value +'px');
        break;
      case 'width':
        this.element.dom.css('width', value +'px');
        break;
      case 'height':
        this.element.dom.css('height', value +'px');
        break;
      case 'r-index':
        this.element.dom.data('r-index', value);
        break;
      case 'z-index':
        this.element.dom.css('z-index', value);
        break;
      case 'bg-color':
        this.element.dom.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg-image':
        // TODO
        break;
      case 'border-width':
        this.element.dom.css('border-width', value +'px');
        break;
      case 'border-color':
        this.element.dom.css('border-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'rounded-conrners':
        // TODO
        break;
      case 'start-time':
        this.element.dom.data('start-time', value);
        break;
      case 'end-time':
        this.element.dom.data('end-time', value);
        break;
      case 'direction':
        this.element.dom.data('direction', value);
        break;
      case 'cursor-width':
        this.element.cursor.css('width', value +'px');
        break;
      case 'cursor-color':
        this.element.cursor.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'font-family':
        this.element.dom.css('font-family', value);
        break;
      case 'text-color':
        this.element.dom.css('color', value);
        break;
    }
  };
  
  ElementPanel.prototype.getApplicableFields = function(){
    var type = this.element.dom.data('type'),
      fields = [];
    
    metaScore.Object.each(this.configs.fields, function(key, configs){      
      if(!configs.hasOwnProperty('element-types') || metaScore.Array.inArray(configs['element-types'], type) > -1){
        fields.push(key);
      }
    }, this);
    
    return fields;  
  };
  
  ElementPanel.prototype.getNonApplicableFields = function(){
    var type = this.element.dom.data('type'),
      fields = [];
    
    metaScore.Object.each(this.configs.fields, function(key, configs){      
      if(configs.hasOwnProperty('element-types') && metaScore.Array.inArray(configs['element-types'], type) === -1){
        fields.push(key);
      }
    }, this);
    
    return fields;  
  };
  
  ElementPanel.prototype.toggleFields = function(type){    
    this.showFields(this.getApplicableFields());
    this.hideFields(this.getNonApplicableFields());
  };
  
  ElementPanel.prototype.updateValue = function(name){
    var field = this.getField(name);
    
    switch(name){
      case 'x':
        field.setValue(parseInt(this.element.dom.css('left'), 10));
        break;
      case 'y':
        field.setValue(parseInt(this.element.dom.css('top'), 10));
        break;
      case 'width':
        field.setValue(parseInt(this.element.dom.css('width'), 10));
        break;
      case 'height':
        field.setValue(parseInt(this.element.dom.css('height'), 10));
        break;
      case 'r-index':
        field.setValue(this.element.dom.data('r-index') || null);
        break;
      case 'z-index':
        field.setValue(parseInt(this.element.dom.css('z-index'), 10));
        break;
      case 'bg-color':
        field.setValue(this.element.dom.css('background-color'));
        break;
      case 'bg-image':
        // TODO
        break;
      case 'border-width':
        field.setValue(parseInt(this.element.dom.css('border-width'), 10));
        break;
      case 'border-color':
        field.setValue(this.element.dom.css('border-color'));
        break;
      case 'rounded-conrners':
        // TODO
        break;
      case 'start-time':
        field.setValue(this.element.dom.data('start-time') || null);
        break;
      case 'end-time':
        field.setValue(this.element.dom.data('end-time') || null);
        break;
      case 'direction':
        field.setValue(this.element.dom.data('direction') || null);
        break;
      case 'cursor-width':
        field.setValue(this.element.cursor.css('width'));
        break;
      case 'cursor-color':
        field.setValue(this.element.cursor.css('background-color'));
        break;
      case 'font-family':
        field.setValue(this.element.dom.css('font-family'));
        break;
      case 'text-color':
        field.setValue(this.element.dom.css('color'));
        break;
    }
  };
  
  ElementPanel.prototype.updateValues = function(fields){  
    if(fields === undefined){
      fields = this.getApplicableFields();
    }
    
    metaScore.Object.each(fields, function(key, field){
      this.updateValue(field);
    }, this);  
  };
    
  return ElementPanel;
  
})();
/**
 * Page
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.timefield.js
 * @requires ../../helpers/metaScore.string.js
 */
 
metaScore.namespace('editor.panel');

metaScore.editor.panel.Page = (function () {
  
  function PagePanel(configs) {
     this.configs = this.getConfigs(configs);
  
    // call parent constructor
    PagePanel.parent.call(this, this.configs);
    
    this.menu = new metaScore.editor.DropDownMenu();
    this.menu.addItem({'text': metaScore.String.t('Add a new page'), 'data-action': 'new'});
    this.menu.addItem({'text': metaScore.String.t('Delete the active page'), 'data-action': 'delete'});
    
    this.getToolbar().addButton()
      .data('action', 'menu')
      .append(this.menu);
      
    this.addDelegate('.field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this));
  }

  PagePanel.defaults = {
    /**
    * The panel's title
    */
    title: metaScore.String.t('Page'),
    
    /**
    * The panel's fields
    */
    fields: {
      'bg-color': {
        'type': metaScore.editor.field.Color,
        'label': metaScore.String.t('Background color')
      },
      'bg-image': {
        'type': metaScore.editor.field.Image,
        'label': metaScore.String.t('Background image')
      },
      'start-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('Start time')
      },
      'end-time': {
        'type': metaScore.editor.field.Time,
        'label': metaScore.String.t('End time')
      }
    }
  };
  
  metaScore.editor.Panel.extend(PagePanel);
  
  PagePanel.prototype.getMenu = function(){
  
    return this.menu;
  
  };
  
  PagePanel.prototype.getPage = function(){
  
    return this.page;
  
  };
  
  PagePanel.prototype.setPage = function(page, supressEvent){
  
    if(this.page && (this.page.dom.get(0) === page.dom.get(0))){
      return;
    }
    
    this.unsetPage(this.page, supressEvent);
    
    this.page = page;
    
    this.updateValues();      
    this.enableFields();
    this.getMenu().enableItems('[data-action="delete"]');
      
    if(supressEvent !== true){
      this.triggerEvent('pageset', {'page': this.page});
    }
    
    return this;
    
  };
  
  PagePanel.prototype.unsetPage = function(page, supressEvent){
    
    page = page || this.getPage();
      
    this.disableFields();    
    this.getMenu().disableItems('[data-action="delete"]');
      
    if(page){    
      this.page = null;
    }
    
    if(supressEvent !== true){
      this.triggerEvent('pageunset', {'page': page});
    }
    
    return this;
    
  };
  
  PagePanel.prototype.onFieldValueChange = function(evt){  
    var field = evt.detail.field,
      value = evt.detail.value;
      
    if(!this.page){
      return;
    }
  
    switch(field.data('name')){
      case 'bg-color':
        this.page.dom.css('background-color', 'rgba('+ value.r +','+ value.g +','+ value.b +','+ value.a +')');
        break;
      case 'bg_image':
        // TODO
      case 'start-time':
        this.page.dom.data('start-time', value);
        break;
      case 'end-time':
        this.page.dom.data('end-time', value);
        break;
    }
  };
  
  PagePanel.prototype.updateValue = function(name){
    var field = this.getField(name);
    
    switch(name){
      case 'bg-color':
        field.setValue(this.page.dom.css('background-color'));
        break;
      case 'bg-image':
        // TODO
        break;
      case 'start-time':
        field.setValue(this.page.dom.data('start-time') || 0);
        break;
      case 'end-time':
        field.setValue(this.page.dom.data('end-time') || 0);
        break;
    }
  };
  
  PagePanel.prototype.updateValues = function(fields){
  
    if(fields === undefined){
      fields = Object.keys(this.getField());
    }
    
    metaScore.Object.each(fields, function(key, field){
      this.updateValue(field);
    }, this);
  
  };
    
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
      
    this.toolbar.addButton()
      .data('action', 'close')
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
    
    this.media = new metaScore.player.Media();
    
    if(!(this.configs.hasOwnProperty('id'))){
      this.configs.id = metaScore.String.uuid();
    }
    
    metaScore.Array.each(this.configs.blocks, function(index, block){
      this.addBlock(block);
    }, this);
  }
  
  Player.defaults = {
    container: 'body',
    blocks: [],
    keyboard: true
  };
  
  metaScore.Evented.extend(Player);
  
  Player.prototype.addBlock = function(configs){
    var block, page;
  
    if(configs instanceof metaScore.player.Block){
      block = configs;
    }
    else{
      block = new metaScore.player.Block(metaScore.Object.extend({}, configs, {'container': this.configs.container}));
    }
    
    block.dom.data('player-id', this.configs.id);
    
    if(block.getPageCount() < 1){
      block.addPage();
    }
    
    block
      .addListener('click', metaScore.Function.proxy(this.onBlockClick, this))
      .addListener('pageclick', metaScore.Function.proxy(this.onPageClick, this))
      .addListener('elementclick', metaScore.Function.proxy(this.onElementClick, this));
    
    this.triggerEvent('blockadd', {'player': this, 'block': block}, true, false);
    
    return block;
  };
  
  Player.prototype.destroy = function(parent){
    var blocks = metaScore.Dom.selectElements('.metaScore-block[data-player-id="'+ this.configs.id +'"]', parent);
    
    metaScore.Array.each(blocks, function(index, block){
      block._metaScore.destroy();
    }, this);
  };
  
  Player.prototype.onBlockClick = function(evt){
    this.triggerEvent('blockclick', {'block': evt.target});
  };
  
  Player.prototype.onPageClick = function(evt){
    this.triggerEvent('pageclick', {'page': evt.detail.page});
  };
  
  Player.prototype.onElementClick = function(evt){
    this.triggerEvent('elementclick', {'element': evt.detail.element});
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
    Block.parent.call(this);
    
    this.dom = new metaScore.Dom('<div/>', {'class': 'metaScore-block'});
    this.dom.get(0)._metaScore = this;
    
    if(this.configs.container){
      this.dom.appendTo(this.configs.container);
    }
          
    this.pages = new metaScore.Dom('<div/>', {'class': 'pages'}).appendTo(this.dom);
    this.pager = new metaScore.player.Pager().appendTo(this.dom);
      
    this.pager.addDelegate('.button', 'click', metaScore.Function.proxy(this.onPagerClick, this));
      
    this.dom.addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    metaScore.Array.each(this.configs.pages, function(index, page){
      this.addPage(page);
    }, this);
  }
  
  Block.defaults = {
    'container': null,
    'pages': []
  };
  
  metaScore.Evented.extend(Block);
  
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
  
    page.dom.appendTo(this.pages);
    
    page
      .addListener('click', metaScore.Function.proxy(this.onPageClick, this))
      .addListener('elementclick', metaScore.Function.proxy(this.onElementClick, this));
    
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
  
  Block.prototype.setActivePage = function(index){    
    var pages = this.getPages(),
      page = pages.get(index)._metaScore;
  
    pages.removeClass('active');
    
    page.dom.addClass('active');
    
    this.updatePager();
    
    this.triggerEvent('pageactivate', {'index': index, 'page': page});  
  };
  
  Block.prototype.updatePager = function(){  
    var index = this.getActivePageIndex();
    var count = this.getPageCount();
  
    this.pager.updateCount(index, count);  
  };
  
  Block.prototype.isSynched = function(){    
    return this.dom.data('synched') === "true";    
  };
  
  Block.prototype.onClick = function(evt){
    this.triggerEvent('click');
    
    evt.stopPropagation();    
  };
  
  Block.prototype.onPageClick = function(evt){
    this.triggerEvent('pageclick', {'page': evt.target});
  };
  
  Block.prototype.onElementClick = function(evt){
    this.triggerEvent('elementclick', {'element': evt.detail.element});
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
  
  Block.prototype.destroy = function(){
    this.dom.remove();
    
    this.triggerEvent('destroy');
  };
    
  return Block;
  
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
    if(cuepoint.hasOwnProperty('onStart') && metaScore.Var.is(cuepoint.onStart, 'function')){
      cuepoint.onStart(this.media);
    }    
  };
  
  CuePoints.prototype.stop = function(cuepoint, launchHandler){    
    if(cuepoint.hasOwnProperty('timer')){
      clearTimeout(cuepoint.timer);
      delete cuepoint.timer;
    }
    
    if(cuepoint.hasOwnProperty('interval')){
      clearInterval(cuepoint.interval);
      delete cuepoint.interval;
    }
    
    if(launchHandler !== false && cuepoint.hasOwnProperty('onEnd') && metaScore.Var.is(cuepoint.onEnd, 'function')){
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
    Element.parent.call(this);
    
    this.dom = new metaScore.Dom('<div/>', {'class': 'element'});
    this.dom.get(0)._metaScore = this;
    
    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this.dom);
      
    this.dom.addListener('click', metaScore.Function.proxy(this.onClick, this));
  }
  
  metaScore.Evented.extend(Element);
  
  Element.prototype.onClick = function(evt){
    this.triggerEvent('click');
    
    evt.stopPropagation();
  };
  
  Element.prototype.destroy = function(){
    this.dom.remove();
    
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
    this.configs = this.getConfigs(configs);
  }

  Media.defaults = {
    'type': 'video',
    'sources': []
  };
  
  metaScore.Dom.extend(Media);

  Media.prototype.play = function() {

  };
  
  Media.prototype.pause = function() {

  };
  
  Media.prototype.stop = function() {

  };
  
  Media.prototype.setCurrentTime = function(time) {
  
  };
  
  Media.prototype.getCurrentTime = function() {
      
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
    Page.parent.call(this);
    
    this.dom = new metaScore.Dom('<div/>', {'class': 'page'});
    this.dom.get(0)._metaScore = this;
      
    this.dom.addListener('click', metaScore.Function.proxy(this.onClick, this));
    
    metaScore.Array.each(this.configs.elements, function(index, element){
      this.addElement(element);
    }, this);
  }
  
  Page.defaults = {
    'elements': []
  };
  
  metaScore.Evented.extend(Page);
  
  Page.prototype.addElement = function(configs){
    var element;
    
    if(configs instanceof metaScore.player.Element){
      element = configs;
    }
    else{
      element = new metaScore.player.element[configs.type](configs);
    }
    
    element.dom.appendTo(this.dom);
    
    element.addListener('click', metaScore.Function.proxy(this.onElementClick, this));
    
    return element;  
  };
  
  Page.prototype.onClick = function(evt){
    this.triggerEvent('click');
    
    evt.stopPropagation();    
  };
  
  Page.prototype.onElementClick = function(evt){
    this.triggerEvent('elementclick', {'element': evt.target});
  };
  
  Page.prototype.destroy = function(){
    this.dom.remove();
    
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

  function Pager(dom) {
    if(dom){
      // call parent constructor
      Pager.parent.call(this, dom);
      
      this.count = this.child('.count');      
      this.buttons = this.child('.buttons');        
      this.buttons.first = this.buttons.child('[data-action="first"]');
      this.buttons.previous = this.buttons.child('[data-action="previous"]');
      this.buttons.next = this.buttons.child('[data-action="next"]');
    }
    else{
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
    
    this.dom.data('type', 'cursor');
    
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
    
    this.dom.data('type', 'image');    
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
    
    this.dom.data('type', 'text');
    
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