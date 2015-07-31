/*! metaScore - v0.0.2 - 2015-07-31 - Oussama Mubarak */
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

var metaScore = global.metaScore;


/**
 * Polyfills
 */
 
// Element.matches
if(Element && !Element.prototype.matches){
  Element.prototype.matches = Element.prototype.matchesSelector =
    Element.prototype.matchesSelector ||
    Element.prototype.webkitMatchesSelector ||
    Element.prototype.mozMatchesSelector ||
    Element.prototype.msMatchesSelector ||
    Element.prototype.oMatchesSelector ||
    function (selector) {
      var element = this,
        matches = (element.document || element.ownerDocument).querySelectorAll(selector),
        i = 0;

      while (matches[i] && matches[i] !== element) {
        i++;
      }

      return matches[i] ? true : false;
    };
}

// Element.closest
if(Element && !Element.prototype.closest){
  /**
   * Description
   * @method closest
   * @param {} selector
   * @return Literal
   */
  Element.prototype.closest = function closest(selector) {
    var node = this;

    while(node){
      if(node.matches(selector)){
        return node;
      }
      else{
        node = node.parentElement;
      }
    }

    return null;
  };
}

// CustomEvent constructor
// https://github.com/krambuhl/custom-event-polyfill/blob/master/custom-event-polyfill.js
if (!window.CustomEvent || typeof window.CustomEvent !== 'function') {
  /**
   * Description
   * @method CustomEvent
   * @param {} event
   * @param {} params
   * @return evt
   */
  window.CustomEvent = function(event, params) {
    var evt;
    
    params = params || {
      bubbles: false,
      cancelable: false,
      detail: undefined
    };

    evt = document.createEvent("CustomEvent");
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    
    return evt;
  };

  window.CustomEvent.prototype = window.Event.prototype;
}


// requestAnimationFrame
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
  var lastTime = 0,
    vendors = ['ms', 'moz', 'webkit', 'o'];
  for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
    window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
  }

  if (!window.requestAnimationFrame){
    /**
     * Description
     * @method requestAnimationFrame
     * @param {} callback
     * @param {} element
     * @return id
     */
    window.requestAnimationFrame = function(callback, element) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };
  }

  if (!window.cancelAnimationFrame){
    /**
     * Description
     * @method cancelAnimationFrame
     * @param {} id
     * @return 
     */
    window.cancelAnimationFrame = function(id) {
      clearTimeout(id);
    };
  }
}());
/**
* The code class
* Implements global helper methods
* @class metaScore
*/

metaScore = global.metaScore = {

  /**
   * Returns the current version identifier
   * @method getVersion
   * @return {String} The version identifier
   */
  getVersion: function(){
    return "0.0.2";
  },

  /**
   * Returns the current revision identifier
   * @method getRevision
   * @return {String} The revision identifier
   */
  getRevision: function(){
    return "207194";
  },

  /**
   * Extends the metaScore namespace
   * @method namespace
   * @param {String} The namespace to add
   * @return {Object} The extended namespace
   */
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
* The base class
* Implements a class extension mechanism and defines shared methods 
* @class Class
* @namespace metaScore
*/

metaScore.Class = (function () {

  /**
   * @constructor
   */
  function Class(){
  }

  Class.defaults = {};

  /**
   * Extends a class by another
   * @method extend
   * @param {Object} child
   * @return 
   */
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

  /**
   * Extends the passed configs with default configs
   * @method getConfigs
   * @param {Object} configs
   * @return configs
   */
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
* A helper class for event handling
* @class Evented
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Evented = (function () {

  /**
   * Description
   * @constructor
   */
  function Evented() {
    // call parent constructor
    Evented.parent.call(this);

    this.listeners = {};
  }

  metaScore.Class.extend(Evented);

  /**
   * Description
   * @method addListener
   * @param {} type
   * @param {} listener
   * @return ThisExpression
   */
  Evented.prototype.addListener = function(type, listener){
    if (typeof this.listeners[type] === "undefined"){
      this.listeners[type] = [];
    }

    this.listeners[type].push(listener);

    return this;
  };

  /**
   * Description
   * @method removeListener
   * @param {} type
   * @param {} listener
   * @return ThisExpression
   */
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

  /**
   * Description
   * @method triggerEvent
   * @param {} type
   * @param {} data
   * @param {} bubbling
   * @param {} cancelable
   * @return ThisExpression
   */
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
* Description
* @class Ajax
* @extends metaScore.Class
*/

metaScore.Ajax = (function () {

  /**
   * Description
   * @constructor
   */
  function Ajax() {
  }

  metaScore.Class.extend(Ajax);

  /**
   * Send an XMLHttp request
   * @method send
   * @param {} url
   * @param {object} options to set for the request; see the defaults variable
   * @return xhr
   */
  Ajax.send = function(url, options) {

    var key,
      xhr = new XMLHttpRequest(),
      defaults = {
        'method': 'GET',
        'headers': {},
        'async': true,
        'data': {},
        'dataType': 'json', // xml, json, script, text or html
        'complete': null,
        'success': null,
        'error': null,
        'scope': this
      };

    options = metaScore.Object.extend({}, defaults, options);

    xhr.open(options.method, url, options.async);

    metaScore.Object.each(options.headers, function(key, value){
      xhr.setRequestHeader(key, value);
    });

    /**
     * Description
     * @method onreadystatechange
     * @return 
     */
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

    xhr.send(options.data);

    return xhr;

  };

  /**
   * Send an XMLHttp GET request
   * @method get
   * @param {} url
   * @param {object} options to set for the request; see the defaults variable
   * @return CallExpression
   */
  Ajax.get = function(url, options) {

    metaScore.Object.extend(options, {'method': 'GET'});

    return Ajax.send(url, options);

  };

  /**
   * Send an XMLHttp POST request
   * @method post
   * @param {} url
   * @param {object} options to set for the request; see the defaults variable
   * @return CallExpression
   */
  Ajax.post = function(url, options) {

    metaScore.Object.extend(options, {'method': 'POST'});

    return Ajax.send(url, options);

  };

  /**
   * Send an XMLHttp PUT request
   * @method put
   * @param {} url
   * @param {object} options to set for the request; see the defaults variable
   * @return CallExpression
   */
  Ajax.put = function(url, options) {

    metaScore.Object.extend(options, {'method': 'PUT'});

    return Ajax.send(url, options);

  };

  return Ajax;

})();
/**
* Description
* @class Array
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Array = (function () {

  /**
   * Description
   * @constructor
   */
  function Array() {
  }

  metaScore.Class.extend(Array);

  /**
   * Checks if a value is in an array
   * @method inArray
   * @param {} value
   * @param {} arr
   * @return UnaryExpression
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
   * @method copy
   * @param {} arr
   * @return CallExpression
   */
  Array.copy = function (arr) {
    return [].concat(arr);
  };

  /**
   * Shuffles elements in an array
   * @method shuffle
   * @param {} arr
   * @return shuffled
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
   * @method unique
   * @param {} arr
   * @return unique
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
   * @method each
   * @param {} arr
   * @param {} callback
   * @param {} scope
   * @return arr
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
   * @method remove
   * @param {} arr
   * @param {} element
   * @return arr
   */
  Array.remove = function(arr, element){
    var index = Array.inArray(element, arr);

    while(index > -1){
      arr.splice(index, 1);
      index = Array.inArray(element, arr);
    }

    return arr;
  };

  /**
   * Natural Sort algorithm
   * Author: Jim Palmer (http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm-with-unicode-support/)
   * Version 0.7 - Released under MIT license
   * @method naturalSort
   * @param {} insensitive
   * @return CallExpression
   */
  Array.naturalSort = function(insensitive){
    return function(a, b){
      var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
        sre = /(^[ ]*|[ ]*$)/g,
        dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
        hre = /^0x[0-9a-f]+$/i,
        ore = /^0/,
        i = function(s) { return insensitive && (''+s).toLowerCase() || ''+s },
        // convert all to strings strip whitespace
        x = i(a).replace(sre, '') || '',
        y = i(b).replace(sre, '') || '',
        // chunk/tokenize
        xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
        // numeric, hex or date detection
        xD = parseInt(x.match(hre)) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
        yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
        oFxNcL, oFyNcL;
      // first try and sort Hex codes or Dates
      if (yD) {
        if ( xD < yD ) { return -1; }
        else if ( xD > yD ) { return 1; }
      }
      // natural sorting through split numeric strings and default strings
      for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
          // find floats not starting with '0', string or 0 if not defined (Clint Priest)
          oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
          oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
          // handle numeric vs string comparison - number < string - (Kyle Adams)
          if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
          // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
          else if (typeof oFxNcL !== typeof oFyNcL) {
              oFxNcL += '';
              oFyNcL += '';
          }
          if (oFxNcL < oFyNcL) { return -1; }
          if (oFxNcL > oFyNcL) { return 1; }
      }
      return 0;
    };
  };

  return Array;

})();
/**
* Description
* @class Color
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Color = (function () {

  /**
   * Description
   * @constructor
   */
  function Color() {
  }

  metaScore.Class.extend(Color);

  /**
   * Description
   * @method rgb2hsv
   * @param {} rgb
   * @return ObjectExpression
   */
  Color.rgb2hsv = function (rgb){
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

  /**
   * Description
   * @method parse
   * @param {} color
   * @return rgba
   */
  Color.parse = function(color){
    var rgba, matches;
    
    rgba = {
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    };

    if(metaScore.Var.is(color, 'object')){
      rgba.r = 'r' in color ? color.r : 0;
      rgba.g = 'g' in color ? color.g : 0;
      rgba.b = 'b' in color ? color.b : 0;
      rgba.a = 'a' in color ? color.a : 1;
    }
    else if(metaScore.Var.is(color, 'string')){
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
    }

    return rgba;
  };

  return Color;

})();
/**
* Description
* @class Dom
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Dom = (function () {

  /**
   * Description
   * @constructor
   */
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
   * @method camelReplaceFn
   * @param {} all
   * @param {} letter
   * @return CallExpression
   */
  Dom.camelReplaceFn = function(all, letter) {
    return letter.toUpperCase();
  };

  /**
   * Normaliz a string to Camel Case; used for CSS properties
   * @method camel
   * @param {} str
   * @return CallExpression
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
   * @method selectElement
   * @param {} selector
   * @param {} parent
   * @return element
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
   * @method selectElements
   * @param {} selector
   * @param {} parent
   * @return elements
   */
  Dom.selectElements = function (selector, parent) {
    var elements;

    if(selector !== undefined){
      if(!parent){
        parent = document;
      }
      else if(parent instanceof Dom){
        parent = parent.get(0);
      }
      
      if(metaScore.Var.is(selector, 'string')) {
        elements = parent.querySelectorAll(selector);
      }
      else if('length' in selector) {
        elements = selector;
      }
      else {
        elements = [selector];
      }
    }

    return elements;
  };

  /**
   * Creates elements from an HTML string (see http://krasimirtsonev.com/blog/article/Revealing-the-magic-how-to-properly-convert-HTML-string-to-a-DOM-element)
   * @method elementsFromString
   * @param {} html
   * @return Literal
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
   * Get the window containing an element
   * @method getElementWindow
   * @param {} el
   * @return {}
   */
  Dom.getElementWindow = function(el){
    var doc = el.ownerDocument;
      
    return doc.defaultView || doc.parentWindow;
  };

  /**
   * Checks if an element has a given class
   * @method hasClass
   * @param {} element
   * @param {} className
   * @return CallExpression
   */
  Dom.hasClass = function(element, className){
    return element.classList.contains(className);
  };

  /**
   * Adds a given class to an element
   * @method addClass
   * @param {} element
   * @param {} className
   * @return 
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
   * @method removeClass
   * @param {} element
   * @param {} className
   * @return 
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
   * @method toggleClass
   * @param {} element
   * @param {} className
   * @param {} force
   * @return 
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
   * @method addListener
   * @param {} element
   * @param {} type
   * @param {} callback
   * @param {} useCapture
   * @return CallExpression
   */
  Dom.addListener = function(element, type, callback, useCapture){
    if(useCapture === undefined){
      useCapture = ('type' in Dom.bubbleEvents) ? Dom.bubbleEvents[type] : false;
    }

    return element.addEventListener(type, callback, useCapture);
  };

  /**
   * Remove an event listener from an element
   * @method removeListener
   * @param {} element
   * @param {} type
   * @param {} callback
   * @param {} useCapture
   * @return CallExpression
   */
  Dom.removeListener = function(element, type, callback, useCapture){
    if(useCapture === undefined){
      useCapture = ('type' in Dom.bubbleEvents) ? Dom.bubbleEvents[type] : false;
    }

    return element.removeEventListener(type, callback, useCapture);
  };

  /**
   * Trigger an event from an element
   * @method triggerEvent
   * @param {} element
   * @param {} type
   * @param {} data
   * @param {} bubbles
   * @param {} cancelable
   * @return CallExpression
   */
  Dom.triggerEvent = function(element, type, data, bubbles, cancelable){
    var fn = CustomEvent || Dom.getElementWindow(element).CustomEvent;
    
    var event = new fn(type, {
      'detail': data,
      'bubbles': bubbles !== false,
      'cancelable': cancelable !== false
    });

    return element.dispatchEvent(event);
  };

  /**
   * Sets or gets the innerHTML of an element
   * @method text
   * @param {} element
   * @param {} value
   * @return MemberExpression
   */
  Dom.text = function(element, value){
    if(value !== undefined){
      element.innerHTML = value;
    }

    return element.innerHTML;
  };

  /**
   * Sets or gets the value of an element
   * @method val
   * @param {} element
   * @param {} value
   * @return MemberExpression
   */
  Dom.val = function(element, value){
    if(value !== undefined){
      element.value = value;
    }

    return element.value;
  };

  /**
   * Sets an attribute on an element
   * @method attr
   * @param {} element
   * @param {} name
   * @param {} value
   * @return 
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
   * @method css
   * @param {} element
   * @param {} name
   * @param {} value
   * @param {} inline
   * @return CallExpression
   */
  Dom.css = function(element, name, value, inline){
    var camel, style;

    camel = this.camel(name);

    if(value !== undefined){
      element.style[camel] = value;
    }

    style = inline === true ? element.style : window.getComputedStyle(element);

    return style.getPropertyValue(name);
  };

  /**
   * Sets or gets a data string of an element
   * @method data
   * @param {} element
   * @param {} name
   * @param {} value
   * @return MemberExpression
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
   * @method append
   * @param {} element
   * @param {} children
   * @return 
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
   * Inserts siblings before an element
   * @method before
   * @param {} element
   * @param {} siblings
   * @return 
   */
  Dom.before = function(element, siblings){
    if (!metaScore.Var.is(siblings, 'array')) {
      siblings = [siblings];
    }

    metaScore.Array.each(siblings, function(index, sibling){
      element.parentElement.insertBefore(sibling, element);
    }, this);
  };

  /**
   * Inserts siblings after an element
   * @method after
   * @param {} element
   * @param {} siblings
   * @return 
   */
  Dom.after = function(element, siblings){
    if (!metaScore.Var.is(siblings, 'array')) {
      siblings = [siblings];
    }

    metaScore.Array.each(siblings, function(index, sibling){
      element.parentElement.insertBefore(sibling, element.nextSibling);
    }, this);
  };

  /**
   * Removes all element children
   * @method empty
   * @param {} element
   * @return 
   */
  Dom.empty = function(element){
    while(element.firstChild){
      element.removeChild(element.firstChild);
    }
  };

  /**
   * Removes an element from the dom
   * @method remove
   * @param {} element
   * @return 
   */
  Dom.remove = function(element){
    if(element.parentElement){
      element.parentElement.removeChild(element);
    }
  };

  /**
   * Checks if an element matches a selector
   * @method is
   * @param {} el
   * @param {} selector
   * @return Literal
   */
  Dom.is = function(el, selector){
    var win;
    
    if(el instanceof Element){
      return Element.prototype.matches.call(el, selector);
    }
    
    win = Dom.getElementWindow(el);
    
    return (el instanceof win.Element) && Element.prototype.matches.call(el, selector);
  };
  
  /**
   * Description
   * @method closest
   * @param {} el
   * @param {} selector
   * @return Literal
   */
  Dom.closest = function(el, selector){
    var document, win;
    
    if(el instanceof Element){
      return Element.prototype.closest.call(el, selector);
    }
      
    if(document = el.ownerDocument){
      if(win = document.defaultView || document.parentWindow){
        if(el instanceof win.Element){
          return Element.prototype.closest.call(el, selector);
        }
      }
    }
    
    return null;
  };

  /**
   * Description
   * @method add
   * @param {} elements
   * @return 
   */
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

  /**
   * Description
   * @method count
   * @return MemberExpression
   */
  Dom.prototype.count = function(){
    return this.elements.length;
  };

  /**
   * Description
   * @method get
   * @param {} index
   * @return MemberExpression
   */
  Dom.prototype.get = function(index){
    return this.elements[index];
  };

  /**
   * Description
   * @method filter
   * @param {} selector
   * @return filtered
   */
  Dom.prototype.filter = function(selector){
    var filtered = new Dom();

    this.each(function(index, element) {
      if(Dom.is(element, selector)){
        filtered.add(element);
      }
    }, this);

    return filtered;
  };

  /**
   * Description
   * @method index
   * @param {} selector
   * @return found
   */
  Dom.prototype.index = function(selector){
    var found = -1;

    this.each(function(index, element) {
      if(Dom.is(element, selector)){
        found = index;
        return false;
      }
    }, this);

    return found;
  };

  /**
   * Description
   * @method find
   * @param {} selector
   * @return descendents
   */
  Dom.prototype.find = function(selector){
    var descendents = new Dom();

    this.each(function(index, element) {
      descendents.add(Dom.selectElements.call(this, selector, element));
    }, this);

    return descendents;
  };

  /**
   * Description
   * @method children
   * @param {} selector
   * @return children
   */
  Dom.prototype.children = function(selector){
    var children = new Dom();

    this.each(function(index, element) {
      children.add(element.children);
    }, this);

    if(selector){
      children = children.filter(selector);
    }

    return children;
  };

  /**
   * Description
   * @method child
   * @param {} selector
   * @return NewExpression
   */
  Dom.prototype.child = function(selector){
    return new Dom(this.children(selector).get(0));
  };

  /**
   * Description
   * @method parents
   * @param {} selector
   * @return parents
   */
  Dom.prototype.parents = function(selector){
    var parents = new Dom();

    this.each(function(index, element) {
      parents.add(element.parentElement);
    }, this);

    if(selector){
      parents = parents.filter(selector);
    }

    return parents;
  };

  /**
   * Description
   * @method each
   * @param {} callback
   * @param {} scope
   * @return 
   */
  Dom.prototype.each = function(callback, scope){
    scope = scope || this;

    metaScore.Array.each(this.elements, callback, scope);
  };

  /**
   * Description
   * @method hasClass
   * @param {} className
   * @return found
   */
  Dom.prototype.hasClass = function(className) {
    var found;

    this.each(function(index, element) {
      found = Dom.hasClass(element, className);
      return !found;
    }, this);

    return found;
  };

  /**
   * Description
   * @method addClass
   * @param {} className
   * @return ThisExpression
   */
  Dom.prototype.addClass = function(className) {
    this.each(function(index, element) {
      Dom.addClass(element, className);
    }, this);

    return this;
  };

  /**
   * Description
   * @method removeClass
   * @param {} className
   * @return ThisExpression
   */
  Dom.prototype.removeClass = function(className) {
    this.each(function(index, element) {
      Dom.removeClass(element, className);
    }, this);

    return this;
  };

  /**
   * Description
   * @method toggleClass
   * @param {} className
   * @param {} force
   * @return ThisExpression
   */
  Dom.prototype.toggleClass = function(className, force) {
    this.each(function(index, element) {
      Dom.toggleClass(element, className, force);
    }, this);

    return this;
  };

  /**
   * Description
   * @method addListener
   * @param {} type
   * @param {} callback
   * @param {} useCapture
   * @return ThisExpression
   */
  Dom.prototype.addListener = function(type, callback, useCapture) {
   this.each(function(index, element) {
      Dom.addListener(element, type, callback, useCapture);
    }, this);

    return this;
  };

  /**
   * Description
   * @method addDelegate
   * @param {} selector
   * @param {} type
   * @param {} callback
   * @param {} scope
   * @param {} useCapture
   * @return CallExpression
   */
  Dom.prototype.addDelegate = function(selector, type, callback, scope, useCapture) {
    scope = scope || this;

    return this.addListener(type, function(evt){
      var element = evt.target,
        match;

      while (element) {
        if(Dom.is(element, selector)){
          match = element;
          break;
        }

        element = element.parentElement;
      }

      if(match){
        callback.call(scope, evt, match);
      }
    }, useCapture);
  };

  /**
   * Description
   * @method removeListener
   * @param {} type
   * @param {} callback
   * @param {} useCapture
   * @return ThisExpression
   */
  Dom.prototype.removeListener = function(type, callback, useCapture) {
    this.each(function(index, element) {
      Dom.removeListener(element, type, callback, useCapture);
    }, this);

    return this;
  };

  /**
   * Description
   * @method triggerEvent
   * @param {} type
   * @param {} data
   * @param {} bubbles
   * @param {} cancelable
   * @return return_value
   */
  Dom.prototype.triggerEvent = function(type, data, bubbles, cancelable){
    var return_value = true;

    this.each(function(index, element) {
      return_value = Dom.triggerEvent(element, type, data, bubbles, cancelable) && return_value;
    }, this);

    return return_value;
  };

  /**
   * Description
   * @method text
   * @param {} value
   * @return 
   */
  Dom.prototype.text = function(value) {
    if(value !== undefined){
      this.each(function(index, element) {
        Dom.text(element, value);
      }, this);
    }
    else{
      return Dom.text(this.get(0));
    }
  };

  /**
   * Description
   * @method val
   * @param {} value
   * @return 
   */
  Dom.prototype.val = function(value) {
    if(value !== undefined){
      this.each(function(index, element) {
        Dom.val(element, value);
      }, this);
      return this;
    }
    else{
      return Dom.val(this.get(0));
    }
  };

  /**
   * Description
   * @method attr
   * @param {} name
   * @param {} value
   * @return 
   */
  Dom.prototype.attr = function(name, value) {
    if(value !== undefined || metaScore.Var.is(name, 'object')){
      this.each(function(index, element) {
        Dom.attr(element, name, value);
      }, this);
      return this;
    }
    else{
      return Dom.attr(this.get(0), name);
    }
  };

  /**
   * Description
   * @method css
   * @param {} name
   * @param {} value
   * @param {} inline
   * @return 
   */
  Dom.prototype.css = function(name, value, inline) {
    if(value !== undefined){
      this.each(function(index, element) {
        Dom.css(element, name, value, inline);
      }, this);
      return this;
    }
    else{
      return Dom.css(this.get(0), name, value, inline);
    }
  };

  /**
   * Description
   * @method data
   * @param {} name
   * @param {} value
   * @return 
   */
  Dom.prototype.data = function(name, value) {
    if(value !== undefined){
      this.each(function(index, element) {
        Dom.data(element, name, value);
      }, this);
      return this;
    }
    else{
      return Dom.data(this.get(0), name);
    }
  };

  /**
   * Description
   * @method append
   * @param {} children
   * @return ThisExpression
   */
  Dom.prototype.append = function(children){
    if(children instanceof Dom){
      children = children.elements;
    }

    Dom.append(this.get(0), children);

    return this;
  };

  /**
   * Description
   * @method appendTo
   * @param {} parent
   * @return ThisExpression
   */
  Dom.prototype.appendTo = function(parent){
    if(!(parent instanceof Dom)){
      parent = new Dom(parent);
    }

    parent = parent.get(0);

    this.each(function(index, element) {
      Dom.append(parent, element);
    }, this);

    return this;
  };

  /**
   * Description
   * @method insertAt
   * @param {} parent
   * @param {} index
   * @return ThisExpression
   */
  Dom.prototype.insertAt = function(parent, index){
    var element;
  
    if(!(parent instanceof Dom)){
      parent = new Dom(parent);
    }
    
    element = parent.children().get(index);
    
    if(element){
      Dom.before(element, this.elements);
    }
    else{
      this.appendTo(parent);
    }

    return this;
  };

  /**
   * Description
   * @method empty
   * @return ThisExpression
   */
  Dom.prototype.empty = function(){
    this.each(function(index, element) {
      Dom.empty(element);
    }, this);

    return this;
  };

  /**
   * Description
   * @method show
   * @return ThisExpression
   */
  Dom.prototype.show = function(){
    this.css('display', '');

    return this;
  };

  /**
   * Description
   * @method hide
   * @return ThisExpression
   */
  Dom.prototype.hide = function(){
    this.css('display', 'none');

    return this;
  };

  /**
   * Description
   * @method focus
   * @return ThisExpression
   */
  Dom.prototype.focus = function(){
    this.get(0).focus();

    return this;
  };

  /**
   * Description
   * @method blur
   * @return ThisExpression
   */
  Dom.prototype.blur = function(){
    this.get(0).blur();

    return this;
  };

  /**
   * Description
   * @method remove
   * @return ThisExpression
   */
  Dom.prototype.remove = function(){
    if(this.triggerEvent('beforeremove') !== false){
      this.each(function(index, element) {
        var parent = element.parentElement;
        Dom.remove(element);
        Dom.triggerEvent(parent, 'childremove', {'child': element});
      }, this);
    }

    return this;
  };

  /**
   * Description
   * @method is
   * @param {} selector
   * @return found
   */
  Dom.prototype.is = function(selector){
    var found;

    this.each(function(index, element) {
      found = Dom.is(element, selector);
      return found;
    }, this);

    return found;
  };

  /**
   * Description
   * @method closest
   * @param {} selector
   * @return found
   */
  Dom.prototype.closest = function(selector){
    var found;

    this.each(function(index, element) {
      found = Dom.closest(element, selector);
      return found !== null;
    }, this);

    return found;
  };

  return Dom;

})();
/**
* Description
* @class Draggable
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Draggable = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Draggable(configs) {
    this.configs = this.getConfigs(configs);

    this.configs.container = this.configs.container || new metaScore.Dom('body');
    this.doc = new metaScore.Dom(this.configs.container.get(0).ownerDocument);

    // fix event handlers scope
    this.onMouseDown = metaScore.Function.proxy(this.onMouseDown, this);
    this.onMouseMove = metaScore.Function.proxy(this.onMouseMove, this);
    this.onMouseUp = metaScore.Function.proxy(this.onMouseUp, this);

    this.configs.handle.addListener('mousedown', this.onMouseDown);

    this.enable();
  }

  Draggable.defaults = {
    /**
    * The limits of the dragging
    */
    limits: {
      top: null,
      left: null
    }
  };

  metaScore.Class.extend(Draggable);

  /**
   * Description
   * @method onMouseDown
   * @param {} evt
   * @return 
   */
  Draggable.prototype.onMouseDown = function(evt){
    if(!this.enabled){
      return;
    }

    this.start_state = {
      'left': parseInt(this.configs.target.css('left'), 10) - evt.clientX,
      'top': parseInt(this.configs.target.css('top'), 10) - evt.clientY
    };

    this.doc
      .addListener('mouseup', this.onMouseUp)
      .addListener('mousemove', this.onMouseMove);

    this.configs.target
      .addClass('dragging')
      .triggerEvent('dragstart', null, false, true);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onMouseMove
   * @param {} evt
   * @return 
   */
  Draggable.prototype.onMouseMove = function(evt){
    var left = evt.clientX + this.start_state.left,
      top = evt.clientY + this.start_state.top;

    if(!isNaN(this.configs.limits.top)){
      top = Math.max(top, this.configs.limits.top);
    }

    if(!isNaN(this.configs.limits.left)){
      left = Math.max(left, this.configs.limits.left);
    }

    this.configs.target
      .css('left', left + 'px')
      .css('top', top + 'px')
      .triggerEvent('drag', null, false, true);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onMouseUp
   * @param {} evt
   * @return 
   */
  Draggable.prototype.onMouseUp = function(evt){
    this.doc
      .removeListener('mousemove', this.onMouseMove)
      .removeListener('mouseup', this.onMouseUp);

    this.configs.target
      .removeClass('dragging')
      .triggerEvent('dragend', null, false, true);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method enable
   * @return ThisExpression
   */
  Draggable.prototype.enable = function(){
    this.configs.target.addClass('draggable');

    this.configs.handle.addClass('drag-handle');

    this.enabled = true;

    return this;
  };

  /**
   * Description
   * @method disable
   * @return ThisExpression
   */
  Draggable.prototype.disable = function(){
    this.configs.target.removeClass('draggable');

    this.configs.handle.removeClass('drag-handle');

    this.enabled = false;

    return this;
  };

  /**
   * Description
   * @method destroy
   * @return ThisExpression
   */
  Draggable.prototype.destroy = function(){
    this.disable();

    this.configs.handle.removeListener('mousedown', this.onMouseDown);

    return this;
  };

  return Draggable;

})();
/**
* Description
* @class Function
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Function = (function () {

  /**
   * Description
   * @constructor
   */
  function Function() {
  }

  metaScore.Class.extend(Function);

  /**
   * Checks if a variable is of a certain type
   * @method proxy
   * @param {} fn
   * @param {} scope
   * @param {} args
   * @return FunctionExpression
   */
  Function.proxy = function(fn, scope, args){  
    if (!metaScore.Var.type(fn, 'function')){
      return undefined;
    }

    return function () {
      var args_array;
    
      if(args){
        args_array = Array.prototype.slice.call(args); // transform args to a true array
        args_array = args_array.concat(Array.prototype.slice.call(arguments)); // concat passed arguments to the args_array
      }
      else{
        args_array = arguments;
      }
    
      return fn.apply(scope || this, args_array);
    };
  };

  /**
   * A reusable empty function
   * @method emptyFn
   * @return 
   */
  Function.emptyFn = function(){};

  return Function;

})();
/**
* Description
* @class Object
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Object = (function () {

  /**
   * Description
   * @constructor
   */
  function Object() {
  }

  metaScore.Class.extend(Object);

  /**
   * Merge the contents of two or more objects together into the first object.
   * @method extend
   * @return target
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
   * @method copy
   * @param {} obj
   * @return CallExpression
   */
  Object.copy = function(obj) {

    return Object.extend({}, obj);

  };

  /**
   * Call a function on each property of an object
   * @method each
   * @param {} obj
   * @param {} callback
   * @param {} scope
   * @return obj
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
* Description
* @class Resizable
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Resizable = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Resizable(configs) {
    this.configs = this.getConfigs(configs);

    this.configs.container = this.configs.container || new metaScore.Dom('body');
    this.doc = new metaScore.Dom(this.configs.container.get(0).ownerDocument);

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

  /**
   * Description
   * @method onMouseDown
   * @param {} evt
   * @return 
   */
  Resizable.prototype.onMouseDown = function(evt){
    if(!this.enabled){
      return;
    }

    this.start_state = {
      'handle': evt.target,
      'x': evt.clientX,
      'y': evt.clientY,
      'left': parseInt(this.configs.target.css('left'), 10),
      'top': parseInt(this.configs.target.css('top'), 10),
      'w': parseInt(this.configs.target.css('width'), 10),
      'h': parseInt(this.configs.target.css('height'), 10)
    };

    this.doc
      .addListener('mousemove', this.onMouseMove, this)
      .addListener('mouseup', this.onMouseUp, this);

    this.configs.target
      .addClass('resizing')
      .triggerEvent('resizestart', null, false, true);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onMouseMove
   * @param {} evt
   * @return 
   */
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

  /**
   * Description
   * @method onMouseUp
   * @param {} evt
   * @return 
   */
  Resizable.prototype.onMouseUp = function(evt){      
    this.doc
      .removeListener('mousemove', this.onMouseMove, this)
      .removeListener('mouseup', this.onMouseUp, this);

    this.configs.target
      .removeClass('resizing')
      .triggerEvent('resizeend', null, false, true);

    evt.stopPropagation();
  };

  /**
   * Description
   * @method enable
   * @return ThisExpression
   */
  Resizable.prototype.enable = function(){
    this.configs.target.addClass('resizable');

    this.enabled = true;

    return this;
  };

  /**
   * Description
   * @method disable
   * @return ThisExpression
   */
  Resizable.prototype.disable = function(){
    this.configs.target.removeClass('resizable');

    this.enabled = false;

    return this;
  };

  /**
   * Description
   * @method destroy
   * @return ThisExpression
   */
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
* Description
* @class String
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.String = (function () {

  /**
   * Description
   * @constructor
   */
  function String() {
  }

  metaScore.Class.extend(String);

  /**
   * Capitalize a string
   * @method capitalize
   * @param {} str
   * @return CallExpression
   */
  String.capitalize = function(str){
    return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  };

  /**
   * Generate a random uuid (see http://www.broofa.com/2008/09/javascript-uuid-function/)
   * @method uuid
   * @param {} len
   * @param {} radix
   * @return CallExpression
   */
  String.uuid = function(len, radix) {
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
   * Description
   * @method pad
   * @param {} str
   * @param {} len
   * @param {} pad
   * @param {} dir
   * @return str
   */
  String.pad = function(str, len, pad, dir) {
    var right, left,
      padlen;

    if (typeof(len) === "undefined") { len = 0; }
    if (typeof(pad) === "undefined") { pad = ' '; }
    if (typeof(dir) === "undefined") { dir = 'right'; }

    str = str +'';

    if (len + 1 >= str.length) {
      switch (dir){
        case 'left':
          str = Array(len + 1 - str.length).join(pad) + str;
          break;

        case 'both':
          padlen = len - str.length;
          right = Math.ceil(padlen / 2);
          left = padlen - right;
          str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
          break;

        default:
          str = str + Array(len + 1 - str.length).join(pad);
          break;
      }
    }
    return str;
  };

  return String;

})();
/**
* Description
* @class StyleSheet
* @namespace metaScore
* @extends metaScore.Dom
*/

metaScore.StyleSheet = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function StyleSheet(configs) {
    this.configs = this.getConfigs(configs);

    // call the super constructor.
    metaScore.Dom.call(this, '<style/>', {'type': 'text/css'});
    
    this.el = this.get(0);

    // WebKit hack :(
    this.setInternalValue("");
  }

  metaScore.Dom.extend(StyleSheet);

  /**
   * Adds a CSS rule to the style sheet
   * @method addRule
   * @param {} selector
   * @param {} rules
   * @param {} index
   * @return 
   */
  StyleSheet.prototype.addRule = function(selector, rules, index) {
    var sheet = this.el.sheet;
    
    if(index === undefined){
      index = sheet.cssRules.length;
    }

    if("insertRule" in sheet) {
      return sheet.insertRule(selector + "{" + rules + "}", index);
    }
    else if("addRule" in sheet) {
      return sheet.addRule(selector, rules, index);
    }
  };

  /**
   * Removes a CSS rule from the style sheet
   * @method removeRule
   * @param {} index
   * @return ThisExpression
   */
  StyleSheet.prototype.removeRule = function(index) {
    var sheet = this.el.sheet;
  
    if("deleteRule" in sheet) {
      sheet.deleteRule(index);
    }
    else if("removeRule" in sheet) {
      sheet.removeRule(index);
    }

    return this;
  };

  /**
   * Removes the first CSS rule that matches a selector
   * @method removeRulesBySelector
   * @param {} selector
   * @return ThisExpression
   */
  StyleSheet.prototype.removeRulesBySelector = function(selector) {
    var sheet = this.el.sheet,
      rules = sheet.cssRules || sheet.rules;

    selector = selector.toLowerCase();

    for (var i=0; i<rules.length; i++){
      if(rules[i].selectorText.toLowerCase() === selector){
        this.removeRule(i);
        break;
      }
    }

    return this;
  };

  /**
   * Removes all CSS rule from the style sheet
   * @method removeRules
   * @return ThisExpression
   */
  StyleSheet.prototype.removeRules = function() {
    var sheet = this.el.sheet,
      rules = sheet.cssRules || sheet.rules;

    while(rules.length > 0){
      this.removeRule(0);
    }

    return this;
  };

  /**
   * Set the internal text value
   * @method setInternalValue
   * @param {} value
   * @return ThisExpression
   */
  StyleSheet.prototype.setInternalValue = function(value) {
    if(this.el.styleSheet){
      this.el.styleSheet.cssText = value;
    }
    else{
      this.text(value);
    }

    return this;
  };

  return StyleSheet;

})();
/**
* A helper class for variable type detection and value.
* @class Var
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Var = (function () {

  /**
  * Helper object used by the type function
  *
  * @property dot
  * @type {Object}
  * @private
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

  /**
   * @constructor
   */
  function Var() {
  }

  metaScore.Class.extend(Var);

  /**
   * Get the type of a variable
   * @method type
   * @param {} obj
   * @return ConditionalExpression
   */
  Var.type = function(obj) {
    return obj == null ? String(obj) : classes2types[ Object.prototype.toString.call(obj) ] || "object";
  };

  /**
   * Checks if a variable is of a certain type
   * @method is
   * @param {} obj
   * @param {} type
   * @return BinaryExpression
   */
  Var.is = function(obj, type) {
    return Var.type(obj) === type.toLowerCase();
  };

  /**
   * Checks if a variable is empty
   * @method isEmpty
   * @param {} obj
   * @return Literal
   */
  Var.isEmpty = function(obj) {
    if(obj === undefined || obj == null){
      return true;
    }

    if(obj.hasOwnProperty('length')){
      return obj.length <= 0;
    }

    if(metaScore.Var.is(obj, 'object')){
      return Object.keys(obj).length <= 0;
    }

    return false;
  };

  return Var;

})();
/**
* The i18n handling class
* @class Locale
* @namespace metaScore
* @extends metaScore.Class
*/

metaScore.Locale = (function () {

  /**
   * Description
   * @constructor
   */
  function Locale() {
  }

  metaScore.Class.extend(Locale);

  /**
   * Translate a string
   * @method t
   * @param {} key
   * @param {} str
   * @param {} args
   * @return CallExpression
   */
  Locale.t = function(key, str, args){
    if(typeof(metaScoreLocale) !== "undefined" && metaScoreLocale.hasOwnProperty(key)){
      str = metaScoreLocale[key];
    }

    return Locale.formatString(str, args);
  };

  /**
   * Replace placeholders with sanitized values in a string.
   * @method formatString
   * @param {} str
   * @param {} args
   * @return str
   */
  Locale.formatString = function(str, args) {
    metaScore.Object.each(args, function(key, value){
      str = str.replace(key, args[key]);
    }, this);

    return str;
  };

  return Locale;

})();
/**
* The main player class
* @class Player
* @namespace metaScore
* @extends metaScore.Dom
*/

metaScore.Player = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Player(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Player.parent.call(this, '<div></div>', {'class': 'metaScore-player'});

    if(this.configs.api){
      metaScore.Dom.addListener(window, 'message', metaScore.Function.proxy(this.onAPIMessage, this));
    }
    
    this.appendTo(this.configs.container);

    this.load();
  }

  Player.defaults = {
    'url': '',
    'container': 'body',
    'ajax': {},
    'keyboard': false,
    'api': false
  };

  metaScore.Dom.extend(Player);

  /**
   * Description
   * @method onKeydown
   * @param {} evt
   * @return 
   */
  Player.prototype.onKeydown = function(evt){    
    switch(evt.keyCode){
      case 32: //space-bar
        this.togglePlay();
        evt.preventDefault();
        break;
      case 37: //left
        this.find('.metaScore-component.block:hover .pager .button[data-action="previous"]').triggerEvent('click');
        evt.preventDefault();
        break;
      case 39: //right
        this.find('.metaScore-component.block:hover .pager .button[data-action="next"]').triggerEvent('click');
        evt.preventDefault();
        break;
    }
  };

  /**
   * Description
   * @method onAPIMessage
   * @param {} evt
   * @return 
   */
  Player.prototype.onAPIMessage = function(evt){
    var data, source, origin, method, params;
    
    try {
      data = JSON.parse(evt.data);
    }
    catch(e){
      return false;
    }
    
    if (!('method' in data)) {
      return false;
    }
    
    source = evt.source;
    origin = event.origin;
    method = data.method;
    params = 'params' in data ? data.params : null;
    
    switch(method){
      case 'play':
        this.getMedia().play();
        break;
        
      case 'pause':
        this.getMedia().pause();
        break;
        
      case 'paused':
        source.postMessage(JSON.stringify({
          'callback': params,
          'params': !this.getMedia().isPlaying()
        }), origin);
        break;
        
      case 'seek':
        this.getMedia().setTime(parseFloat(params, 10) * 100);
        break;
        
      case 'time':
        source.postMessage(JSON.stringify({
          'callback': params, 
          'params': this.getMedia().getTime() / 100
        }), origin);
        break;
        
      case 'addEventListener':
        switch(params.type){
          case 'ready':
            this.addListener('loadsuccess', function(event){
              source.postMessage(JSON.stringify({
                'callback': params.callback
              }), origin);
            });
            break;
            
          case 'timeupdate':
            this.addListener(params.type, function(event){
              source.postMessage(JSON.stringify({
                'callback': params.callback,
                'params': event.detail.media.getTime() / 100
              }), origin);
            });
            break;
            
          case 'rindex':
            this.addListener(params.type, function(event){
              source.postMessage(JSON.stringify({
                'callback': params.callback,
                'params': event.detail.value
              }), origin);
            });
            break;
        }
        break;
        
      case 'removeEventListener':
        break;
    }
  };

  /**
   * Description
   * @method onControllerButtonClick
   * @param {} evt
   * @return 
   */
  Player.prototype.onControllerButtonClick = function(evt){
    var action = metaScore.Dom.data(evt.target, 'action');

    switch(action){
      case 'rewind':
        this.getMedia().reset();
        break;

      case 'play':
        this.togglePlay();
        break;
    }

    evt.stopPropagation();
  };

  /**
   * Description
   * @method onMediaLoadedMetadata
   * @param {} evt
   * @return 
   */
  Player.prototype.onMediaLoadedMetadata = function(evt){
    this.getMedia().reset();
  };

  /**
   * Description
   * @method onMediaPlay
   * @param {} evt
   * @return 
   */
  Player.prototype.onMediaPlay = function(evt){
    this.controller.addClass('playing');
  };

  /**
   * Description
   * @method onMediaPause
   * @param {} evt
   * @return 
   */
  Player.prototype.onMediaPause = function(evt){
    this.controller.removeClass('playing');
  };

  /**
   * Description
   * @method onMediaTimeUpdate
   * @param {} evt
   * @return 
   */
  Player.prototype.onMediaTimeUpdate = function(evt){
    var currentTime = evt.detail.media.getTime();

    this.controller.updateTime(currentTime);
  };

  /**
   * Description
   * @method onPageActivate
   * @param {} evt
   * @return 
   */
  Player.prototype.onPageActivate = function(evt){
    var block = evt.target._metaScore,
      page = evt.detail.page,
      basis = evt.detail.basis;

    if(block.getProperty('synched') && (basis !== 'pagecuepoint')){
      this.getMedia().setTime(page.getProperty('start-time'));
    }
  };

  /**
   * Description
   * @method onCursorElementTime
   * @param {} evt
   * @return 
   */
  Player.prototype.onCursorElementTime = function(evt){
    this.getMedia().setTime(evt.detail.value);
  };

  /**
   * Description
   * @method onTextElementTime
   * @param {} evt
   * @return 
   */
  Player.prototype.onTextElementTime = function(evt){
    var player = this;
  
    if(this.linkcuepoint){
      this.linkcuepoint.destroy();
    }

    this.linkcuepoint = new metaScore.player.CuePoint({
      media: this.getMedia(),
      inTime: evt.detail.inTime,
      outTime: evt.detail.outTime,
      onStart: function(cuepoint){
        player.setReadingIndex(evt.detail.rIndex);
      },
      onEnd: function(cuepoint){
        cuepoint.getMedia().pause();
      },
      onSeekOut: function(cuepoint){
        cuepoint.destroy();
        delete player.linkcuepoint;
        
        player.setReadingIndex(0);
      },
      considerError: true
    });

    this.getMedia()
      .setTime(evt.detail.inTime)
      .play();
  };

  /**
   * Description
   * @method onComponenetPropChange
   * @param {} evt
   * @return 
   */
  Player.prototype.onComponenetPropChange = function(evt){
    var component = evt.detail.component;

    switch(evt.detail.property){
      case 'start-time':
      case 'end-time':
        component.setCuePoint({
          'media': this.getMedia()
        });
        break;
    }
  };

  /**
   * Description
   * @method onLoadSuccess
   * @param {} xhr
   * @return 
   */
  Player.prototype.onLoadSuccess = function(xhr){
    this.json = JSON.parse(xhr.response);

    this.setId(this.json.id)
      .setRevision(this.json.vid);

    // setup the base url
    if(this.json.base_url){
      new metaScore.Dom('<base/>', {'href': this.json.base_url, 'target': '_blank'})
        .appendTo(document.head);
    }

    // add style sheets
    new metaScore.Dom('<link/>', {'rel': 'stylesheet', 'type': 'text/css', 'href': this.json.library_css})
      .appendTo(document.head);

    this.css = new metaScore.StyleSheet()
      .setInternalValue(this.json.css)
      .appendTo(document.head);

    this.rindex_css = new metaScore.StyleSheet()
      .appendTo(document.head);

    metaScore.Array.each(this.json.blocks, function(index, block){
      switch(block.type){
        case 'media':
          this.addMedia(metaScore.Object.extend({}, block, {'type': this.json.type}));
          this.getMedia().setSources([this.json.media]);
          break;
          
        case 'controller':
          this.addController(block);
          break;
        
        default:
          this.addBlock(block);
      }
    }, this);

    if(this.configs.keyboard){
      new metaScore.Dom('body').addListener('keydown', metaScore.Function.proxy(this.onKeydown, this));
    }

    this.removeClass('loading');
    
    this.triggerEvent('loadsuccess', {'player': this, 'data': this.json}, true, false);
  };

  /**
   * Description
   * @method onLoadError
   * @param {} xhr
   * @return 
   */
  Player.prototype.onLoadError = function(xhr){
    this.removeClass('loading');
    
    this.triggerEvent('loaderror', {'player': this}, true, false);
  };

  /**
   * Description
   * @method load
   * @return 
   */
  Player.prototype.load = function(){
    var options;

    this.addClass('loading');

    options = metaScore.Object.extend({}, {
      'success': metaScore.Function.proxy(this.onLoadSuccess, this),
      'error': metaScore.Function.proxy(this.onLoadError, this)
    }, this.configs.ajax);


    metaScore.Ajax.get(this.configs.url, options);
  };

  /**
   * Description
   * @method getId
   * @return CallExpression
   */
  Player.prototype.getId = function(){
    return this.data('id');
  };

  /**
   * Description
   * @method setId
   * @return CallExpression
   */
  Player.prototype.setId = function(id, supressEvent){
    this.data('id', id);

    if(supressEvent !== true){
      this.triggerEvent('idset', {'player': this, 'id': id}, true, false);
    }
    
    return this;
  };

  /**
   * Description
   * @method getRevision
   * @return CallExpression
   */
  Player.prototype.getRevision = function(){
    return this.data('vid');
  };

  /**
   * Description
   * @method setRevision
   * @return CallExpression
   */
  Player.prototype.setRevision = function(vid, supressEvent){
    this.data('vid', vid);

    if(supressEvent !== true){
      this.triggerEvent('revisionset', {'player': this, 'vid': vid}, true, false);
    }
    
    return this;
  };

  /**
   * Description
   * @method getData
   * @return MemberExpression
   */
  Player.prototype.getData = function(){
    return this.json;
  };

  /**
   * Description
   * @method getMedia
   * @return MemberExpression
   */
  Player.prototype.getMedia = function(){
    return this.media;
  };

  /**
   * Description
   * @method updateData
   * @return MemberExpression
   */
  Player.prototype.updateData = function(data){
    metaScore.Object.extend(this.json, data);

    if('css' in data){
      this.updateCSS(data.css);
    }
    
    if('media' in data){
      this.getMedia().setSources([data.media]);
    }
    
    if('vid' in data){
      this.setRevision(data.vid);
    }
  };

  /**
   * Description
   * @method getComponent
   * @param {} selector
   * @return CallExpression
   */
  Player.prototype.getComponent = function(selector){    
    return this.getComponents(selector).get(0);
  };

  /**
   * Description
   * @method getComponents
   * @param {} selector
   * @return components
   */
  Player.prototype.getComponents = function(selector){
    var components;
    
    components = this.find('.metaScore-component');
    
    if(selector){
      components = components.filter(selector);
    }

    return components;
  };

  /**
   * Description
   * @method addMedia
   * @param {} configs
   * @param {} supressEvent
   * @return ThisExpression
   */
  Player.prototype.addMedia = function(configs, supressEvent){
    this.media = new metaScore.player.component.Media(configs)
      .addMediaListener('loadedmetadata', metaScore.Function.proxy(this.onMediaLoadedMetadata, this))
      .addMediaListener('play', metaScore.Function.proxy(this.onMediaPlay, this))
      .addMediaListener('pause', metaScore.Function.proxy(this.onMediaPause, this))
      .addMediaListener('timeupdate', metaScore.Function.proxy(this.onMediaTimeUpdate, this))
      .appendTo(this);

    if(supressEvent !== true){
      this.triggerEvent('mediaadd', {'player': this, 'media': this.media}, true, false);
    }
    
    return this;
  };

  /**
   * Description
   * @method addController
   * @param {} configs
   * @param {} supressEvent
   * @return ThisExpression
   */
  Player.prototype.addController = function(configs, supressEvent){
    this.controller = new metaScore.player.component.Controller(configs)
      .addDelegate('.buttons button', 'click', metaScore.Function.proxy(this.onControllerButtonClick, this))
      .appendTo(this);

    if(supressEvent !== true){
      this.triggerEvent('controlleradd', {'player': this, 'controller': this.controller}, true, false);
    }
    
    return this;
  };

  /**
   * Description
   * @method addBlock
   * @param {} configs
   * @param {} supressEvent
   * @return block
   */
  Player.prototype.addBlock = function(configs, supressEvent){
    var block, page;

    if(configs instanceof metaScore.player.component.Block){
      block = configs;
      block.appendTo(this);
    }
    else{
      block = new metaScore.player.component.Block(metaScore.Object.extend({}, configs, {
          'container': this,
          'listeners': {
            'propchange': metaScore.Function.proxy(this.onComponenetPropChange, this)
          }
        }))
        .addListener('pageactivate', metaScore.Function.proxy(this.onPageActivate, this))
        .addDelegate('.element[data-type="Cursor"]', 'time', metaScore.Function.proxy(this.onCursorElementTime, this))
        .addDelegate('.element[data-type="Text"]', 'time', metaScore.Function.proxy(this.onTextElementTime, this));
    }

    if(supressEvent !== true){
      this.triggerEvent('blockadd', {'player': this, 'block': block}, true, false);
    }

    return block;
  };

  /**
   * Description
   * @method updateCSS
   * @param {} value
   * @return 
   */
  Player.prototype.updateCSS = function(value){
    this.css.setInternalValue(value);
  };

  /**
   * Description
   * @method togglePlay
   * @return 
   */
  Player.prototype.togglePlay = function(){
    var media = this.getMedia();
  
    if(media.isPlaying()){
      media.pause();
    }
    else{
      media.play();
    }
  };

  /**
   * Description
   * @method setReadingIndex
   * @param {} index
   * @param {} supressEvent
   * @return ThisExpression
   */
  Player.prototype.setReadingIndex = function(index, supressEvent){
    this.rindex_css.removeRules();

    if(index !== 0){
      this.rindex_css.addRule('.metaScore-component.element[data-r-index="'+ index +'"]', 'display: block;');
      this.rindex_css.addRule('.metaScore-component.element[data-r-index="'+ index +'"]:not([data-start-time]) .contents', 'display: block;');
      this.rindex_css.addRule('.metaScore-component.element[data-r-index="'+ index +'"].active .contents', 'display: block;');      
      this.rindex_css.addRule('.in-editor.editing.show-contents .metaScore-component.element[data-r-index="'+ index +'"] .contents', 'display: block;');
    }

    if(supressEvent !== true){
      this.triggerEvent('rindex', {'player': this, 'value': index}, true, false);
    }
    
    return this;
  };

  return Player;

})();
/**
* Description
* @class Component
* @namespace metaScore.player
* @extends metaScore.Dom
*/

metaScore.namespace('player').Component = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Component(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Component.parent.call(this, '<div/>', {'class': 'metaScore-component', 'id': 'component-'+ metaScore.String.uuid(5)});

    // keep a reference to this class instance in the DOM node
    this.get(0)._metaScore = this;

    if(this.configs.container){
      if(metaScore.Var.is(this.configs.index, 'number')){
        this.insertAt(this.configs.container, this.configs.index);
      }
      else{
        this.appendTo(this.configs.container);
      }
    }

    metaScore.Object.each(this.configs.listeners, function(key, value){
      this.addListener(key, value);
    }, this);

    this.setupDOM();

    this.setProperties(this.configs);
  }

  metaScore.Dom.extend(Component);

  Component.defaults = {
    'container': null,
    'index': null,
    'properties': {}
  };

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Component.prototype.setupDOM = function(){};

  /**
   * Description
   * @method getId
   * @return CallExpression
   */
  Component.prototype.getId = function(){
    return this.attr('id');
  };

  /**
   * Description
   * @method getName
   * @return CallExpression
   */
  Component.prototype.getName = function(){
    return this.getProperty('name');
  };

  /**
   * Description
   * @method instanceOf
   * @return CallExpression
   */
  Component.prototype.instanceOf = function(type){
  
    return (type in metaScore.player.component) && (this instanceof metaScore.player.component[type]);
  
  };

  /**
   * Description
   * @method hasProperty
   * @param {} name
   * @return BinaryExpression
   */
  Component.prototype.hasProperty = function(name){
    return name in this.configs.properties;
  };

  /**
   * Description
   * @method getProperty
   * @param {} name
   * @return 
   */
  Component.prototype.getProperty = function(name){
    if(this.hasProperty(name) && 'getter' in this.configs.properties[name]){
      return this.configs.properties[name].getter.call(this);
    }
  };

  /**
   * Description
   * @method getProperties
   * @param {} skipDefaults
   * @return values
   */
  Component.prototype.getProperties = function(skipDefaults){
    var values = {},
      value;

    metaScore.Object.each(this.configs.properties, function(name, prop){
      if('getter' in prop){
        value = prop.getter.call(this, skipDefaults);

        if(value !== null){
          values[name] = value;
        }
      }
    }, this);

    return values;
  };

  /**
   * Description
   * @method setProperty
   * @param {} name
   * @param {} value
   * @param {} supressEvent
   * @return 
   */
  Component.prototype.setProperty = function(name, value, supressEvent){
    if(name in this.configs.properties && 'setter' in this.configs.properties[name]){
      this.configs.properties[name].setter.call(this, value);
      
      if(supressEvent !== true){
        this.triggerEvent('propchange', {'component': this, 'property': name, 'value': value});
      }
    }
    
    return this;
  };

  /**
   * Description
   * @method setProperties
   * @param {} name
   * @param {} value
   * @param {} supressEvent
   * @return 
   */
  Component.prototype.setProperties = function(properties, supressEvent){
    metaScore.Object.each(properties, function(key, value){
      this.setProperty(key, value, supressEvent);
    }, this);
    
    return this;
  };

  /**
   * Description
   * @method setCuePoint
   * @param {} configs
   * @return MemberExpression
   */
  Component.prototype.setCuePoint = function(configs){
    var inTime = this.getProperty('start-time'),
      outTime = this.getProperty('end-time');

    if(this.cuepoint){
      this.cuepoint.destroy();
    }

    if(inTime != null || outTime != null){
      this.cuepoint = new metaScore.player.CuePoint(metaScore.Object.extend({}, configs, {
        'inTime': inTime,
        'outTime': outTime,
        'onStart': this.onCuePointStart ? metaScore.Function.proxy(this.onCuePointStart, this) : null,
        'onUpdate': this.onCuePointUpdate ? metaScore.Function.proxy(this.onCuePointUpdate, this) : null,
        'onEnd': this.onCuePointEnd ? metaScore.Function.proxy(this.onCuePointEnd, this) : null,
        'onSeekOut': this.onCuePointSeekOut ? metaScore.Function.proxy(this.onCuePointSeekOut, this) : null
      }));
    }

    return this.cuepoint;
  };

  /**
   * Description
   * @method setDraggable
   * @param {} draggable
   * @return MemberExpression
   */
  Component.prototype.setDraggable = function(draggable){
  
    return false;
  
  };

  /**
   * Description
   * @method setResizable
   * @param {} resizable
   * @return MemberExpression
   */
  Component.prototype.setResizable = function(resizable){
  
    return false;
  
  };

  return Component;

})();
/**
* Description
* @class CuePoint
* @namespace metaScore.player
* @extends metaScore.Evented
*/

metaScore.namespace('player').CuePoint = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function CuePoint(configs) {
    this.configs = this.getConfigs(configs);

    this.id = metaScore.String.uuid();

    this.running = false;

    this.launch = metaScore.Function.proxy(this.launch, this);
    this.stop = metaScore.Function.proxy(this.stop, this);
    this.onMediaTimeUpdate = metaScore.Function.proxy(this.onMediaTimeUpdate, this);
    this.onMediaSeeked = metaScore.Function.proxy(this.onMediaSeeked, this);

    this.configs.media.addMediaListener('timeupdate', this.onMediaTimeUpdate);
    
    this.max_error = 0;
  }

  metaScore.Evented.extend(CuePoint);

  CuePoint.defaults = {
    'media': null,
    'inTime': null,
    'outTime': null,
    'onStart': null,
    'onUpdate': null,
    'onEnd': null,
    'onSeekOut': null,
    'considerError': false
  };

  /**
   * Description
   * @method onMediaTimeUpdate
   * @param {} evt
   * @return 
   */
  CuePoint.prototype.onMediaTimeUpdate = function(evt){
    var cur_time = this.configs.media.getTime();

    if(!this.running){
      if((Math.floor(cur_time) >= this.configs.inTime) && ((this.configs.outTime === null) || (Math.ceil(cur_time) < this.configs.outTime))){
        this.launch();
      }
    }
    else{
      if(this.configs.considerError){
        if('previous_time' in this){
          this.max_error = Math.max(this.max_error, Math.abs(cur_time - this.previous_time));
        }
        
        this.previous_time = cur_time;
      }
    
      if((Math.ceil(cur_time) < this.configs.inTime) || ((this.configs.outTime !== null) && (Math.floor(cur_time + this.max_error) >= this.configs.outTime))){
        this.stop();
      }

      if(this.configs.onUpdate){
        this.configs.onUpdate(this, cur_time);
      }
    }
    
    if(this.configs.onSeekOut){
      this.configs.media.addMediaListener('seeking', this.onMediaSeeked);
    }
  };

  /**
   * Description
   * @method onMediaSeeked
   * @param {} evt
   * @return 
   */
  CuePoint.prototype.onMediaSeeked = function(evt){
    var cur_time;
    
    this.configs.media.removeMediaListener('play', this.onMediaSeeked);
    
    if(this.configs.onSeekOut){
      cur_time = this.configs.media.getTime();
    
      if((Math.ceil(cur_time) < this.configs.inTime) || (Math.floor(cur_time) > this.configs.outTime)){
        this.configs.onSeekOut(this);
      }
    }
  };

  /**
   * Description
   * @method getMedia
   * @return MemberExpression
   */
  CuePoint.prototype.getMedia = function(){
    return this.configs.media;
  };

  /**
   * Description
   * @method getInTime
   * @return MemberExpression
   */
  CuePoint.prototype.getInTime = function(){
    return this.configs.inTime;
  };

  /**
   * Description
   * @method getOutTime
   * @return MemberExpression
   */
  CuePoint.prototype.getOutTime = function(){
    return this.configs.outTime;
  };

  /**
   * Description
   * @method launch
   * @return 
   */
  CuePoint.prototype.launch = function(){
    if(this.running){
      return;
    }

    if(this.configs.onStart){
      this.configs.onStart(this);
    }

    // stop the cuepoint if it doesn't have an outTime or doesn't have onUpdate and onEnd callbacks
    if((this.configs.outTime === null) || (!this.configs.onUpdate && !this.configs.onEnd)){
      this.stop();
    }
    else{
      this.running = true;
    }
  };

  /**
   * Description
   * @method stop
   * @param {} launchCallback
   * @return 
   */
  CuePoint.prototype.stop = function(launchCallback){
    if(launchCallback !== false && this.configs.onEnd){
      this.configs.onEnd(this);
    
      if(this.configs.onSeekOut){
        this.configs.media.addMediaListener('play', this.onMediaSeeked);
      }
    }
    
    if(this.configs.considerError){
      this.max_error = 0;
      delete this.previous_time;
    }

    this.running = false;
  };

  /**
   * Description
   * @method destroy
   * @return 
   */
  CuePoint.prototype.destroy = function(){
    this.stop(false);
    
    this.configs.media
      .removeMediaListener('timeupdate', this.onMediaTimeUpdate)
      .removeMediaListener('seeking', this.onMediaSeeked)
      .removeMediaListener('play', this.onMediaSeeked);
  };

  return CuePoint;

})();
/**
* Description
* @class Pager
* @namespace metaScore.player
* @extends metaScore.Dom
*/

metaScore.namespace('player').Pager = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Pager(configs) {
    this.configs = this.getConfigs(configs);

    // call parent constructor
    Pager.parent.call(this, '<div/>', {'class': 'pager'});

    this.count = new metaScore.Dom('<div/>', {'class': 'count'})
      .appendTo(this);

    this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .addListener('mousedown', function(evt){
        evt.stopPropagation();
      })
      .appendTo(this);

    this.buttons.first = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'first'})
      .appendTo(this.buttons);
    this.buttons.previous = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'previous'})
      .appendTo(this.buttons);
    this.buttons.next = new metaScore.Dom('<div/>', {'class': 'button', 'data-action': 'next'})
      .appendTo(this.buttons);
  }

  metaScore.Dom.extend(Pager);

  /**
   * Description
   * @method updateCount
   * @param {} index
   * @param {} count
   * @return 
   */
  Pager.prototype.updateCount = function(index, count){
    this.count.text(metaScore.Locale.t('player.Pager.count', 'page !current/!count', {'!current': (index + 1), '!count': count}));

    this.buttons.first.toggleClass('inactive', index < 1);
    this.buttons.previous.toggleClass('inactive', index < 1);
    this.buttons.next.toggleClass('inactive', index >= count - 1);
  };

  return Pager;

})();
/**
* Description
* @class Block
* @namespace metaScore.player.component
* @extends metaScore.player.Component
*/

metaScore.namespace('player.component').Block = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Block(configs) {
    // call parent constructor
    Block.parent.call(this, configs);
  }

  metaScore.player.Component.extend(Block);

  Block.defaults = {
    'container': null,
    'properties': {
      'name': {
        'type': 'Text',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.name', 'Name')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.data('name');
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('name', value);
        }
      },
      'locked': {
        'type': 'Boolean',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.locked', 'Locked ?')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return BinaryExpression
         */
        'getter': function(skipDefault){
          return this.data('locked') === "true";
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('locked', value ? "true" : null);
        }
      },
      'x': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.x', 'X')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('left'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('left', value +'px');
        }
      },
      'y': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.y', 'Y')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('top'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('top', value +'px');
        },
      },
      'width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.width', 'Width')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('width'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('width', value +'px');
        }
      },
      'height': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.height', 'Height')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('height'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('height', value +'px');
        }
      },
      'background-color': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.background-color', 'Background color')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.css('background-color', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'background-image': {
        'type':'Image',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.background-image', 'Background image')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          var value = this.css('background-image', undefined, skipDefault);

          if(value === 'none' || !metaScore.Var.is(value, "string")){
            return null;
          }

          return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
          this.css('background-image', value);
        }
      },
      'border-width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.border-width', 'Border width')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = this.css('border-width', undefined, skipDefault);
          return value !== null ? parseInt(value, 10) : null;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('border-width', value +'px');
        }
      },
      'border-color': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.border-color', 'Border color')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.css('border-color', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('border-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'border-radius': {
        'type': 'BorderRadius',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.border-radius', 'Border radius')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.css('border-radius', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('border-radius', value);
        }
      },
      'synched': {
        'type': 'Boolean',
        'configs': {
          'label': metaScore.Locale.t('player.component.Block.synched', 'Synchronized pages ?'),
          'readonly': true
        },
        /**
         * Description
         * @param {} skipDefault
         * @return BinaryExpression
         */
        'getter': function(skipDefault){
          return this.data('synched') === "true";
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('synched', value);
        }
      },
      'pages': {
        'editable':false,
        /**
         * Description
         * @param {} skipDefault
         * @return pages
         */
        'getter': function(skipDefault){
          var pages = [];

          this.getPages().each(function(index, page){
            pages.push(page._metaScore.getProperties(skipDefault));
          }, this);

          return pages;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.getPages().remove();

          metaScore.Array.each(value, function(index, configs){
            this.addPage(configs);
          }, this);

          this.setActivePage(0);
        }
      }
    }
  };

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Block.prototype.setupDOM = function(){
    // call parent function
    Block.parent.prototype.setupDOM.call(this);

    this.addClass('block');

    this.page_wrapper = new metaScore.Dom('<div/>', {'class': 'pages'})
      .addDelegate('.page', 'cuepointstart', metaScore.Function.proxy(this.onPageCuePointStart, this))
      .addDelegate('.element', 'page', metaScore.Function.proxy(this.onElementPage, this))
      .appendTo(this);

    this.pager = new metaScore.player.Pager()
      .addDelegate('.button', 'click', metaScore.Function.proxy(this.onPagerClick, this))
      .appendTo(this);
  };

  /**
   * Description
   * @method onPageCuePointStart
   * @param {} evt
   * @return 
   */
  Block.prototype.onPageCuePointStart = function(evt){
    this.setActivePage(evt.target._metaScore, 'pagecuepoint');
  };

  /**
   * Description
   * @method onElementPage
   * @param {} evt
   * @return 
   */
  Block.prototype.onElementPage = function(evt){
    this.setActivePage(evt.detail.value);
  };

  /**
   * Description
   * @method onPagerClick
   * @param {} evt
   * @return 
   */
  Block.prototype.onPagerClick = function(evt){
    var active = !metaScore.Dom.hasClass(evt.target, 'inactive'),
      action;

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

  /**
   * Description
   * @method getPages
   * @return CallExpression
   */
  Block.prototype.getPages = function(){
    return this.page_wrapper.children('.page');
  };

  /**
   * Description
   * @method addPage
   * @param {} configs
   * @param {} supressEvent
   * @return page
   */
  Block.prototype.addPage = function(configs, index, supressEvent){
    var page;

    if(configs instanceof metaScore.player.component.Page){
      page = configs;
      
      if(metaScore.Var.is(index, 'number')){
        page.insertAt(this.page_wrapper, index);
      }
      else{
        page.appendTo(this.page_wrapper);
      }
    }
    else{    
      page = new metaScore.player.component.Page(metaScore.Object.extend({}, configs, {
        'container': this.page_wrapper,
        'index': index
      }));
    }

    this.setActivePage(page);

    if(supressEvent !== true){
      this.triggerEvent('pageadd', {'block': this, 'page': page});
    }

    return page;
  };

  /**
   * Description
   * @method removePage
   * @param {} page
   * @param {} supressEvent
   * @return page
   */
  Block.prototype.removePage = function(page, supressEvent){
    var index;

    page.remove();

    if(supressEvent !== true){
      this.triggerEvent('pageremove', {'block': this, 'page': page});
    }

    return page;
  };

  /**
   * Description
   * @method getPage
   * @param {} index
   * @return ConditionalExpression
   */
  Block.prototype.getPage = function(index){
    var pages = this.getPages(),
      page = pages.get(index);

    return page ? page._metaScore : null;
  };

  /**
   * Description
   * @method getActivePage
   * @return CallExpression
   */
  Block.prototype.getActivePage = function(){
    return this.getPage(this.getActivePageIndex());
  };

  /**
   * Description
   * @method getActivePageIndex
   * @return index
   */
  Block.prototype.getActivePageIndex = function(){
    var pages = this.getPages(),
      index = pages.index('.active');

    return index;
  };

  /**
   * Description
   * @method getPageCount
   * @return CallExpression
   */
  Block.prototype.getPageCount = function(){
    return this.getPages().count();
  };

  /**
   * Description
   * @method setActivePage
   * @param {} page
   * @param {} supressEvent
   * @return 
   */
  Block.prototype.setActivePage = function(page, basis, supressEvent){
    var pages = this.getPages(), dom;

    if(metaScore.Var.is(page, 'number')){
      page = pages.get(parseInt(page, 10));
      page = page ? page._metaScore : null;
    }

    if(page instanceof metaScore.player.component.Page){
      pages.removeClass('active');
      page.addClass('active');
      this.updatePager();

      if(supressEvent !== true){
        this.triggerEvent('pageactivate', {'block': this, 'page': page, 'basis': basis});
      }
    }
  };

  /**
   * Description
   * @method updatePager
   * @return 
   */
  Block.prototype.updatePager = function(){
    var index = this.getActivePageIndex(),
      count = this.getPageCount();

    this.pager.updateCount(index, count);

    this.data('page-count', count);
  };

  /**
   * Description
   * @method setDraggable
   * @param {} draggable
   * @return MemberExpression
   */
  Block.prototype.setDraggable = function(draggable){
    
    draggable = draggable !== false;
  
    if(this.getProperty('locked') && draggable){
      return false;
    }

    if(draggable && !this._draggable){ 
      this._draggable = new metaScore.Draggable({
        'target': this,
        'handle': this.child('.pager'),
        'container': this.parents(),
        'limits': {
          'top': 0,
          'left': 0
        }
      });
    }
    else if(!draggable && this._draggable){
      this._draggable.destroy();
      delete this._draggable;
    }
    
    return this._draggable;
  
  };

  /**
   * Description
   * @method setResizable
   * @param {} resizable
   * @return MemberExpression
   */
  Block.prototype.setResizable = function(resizable){
    
    resizable = resizable !== false;
  
    if(this.getProperty('locked') && resizable){
      return false;
    }
  
    if(resizable && !this._resizable){
      this._resizable = new metaScore.Resizable({
        'target': this,
        'container': this.parents()
      });
    }
    else if(!resizable && this._resizable){
      this._resizable.destroy();
      delete this._resizable;
    }
    
    return this._resizable;
  
  };

  return Block;

})();
/**
* Description
* @class Controller
* @namespace metaScore.player.component
* @extends metaScore.player.Component
*/

metaScore.namespace('player.component').Controller = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Controller(configs) {
    // call parent constructor
    Controller.parent.call(this, configs);
  }

  metaScore.player.Component.extend(Controller);

  Controller.defaults = {
    'properties': {
      'locked': {
        'type': 'Boolean',
        'configs': {
          'label': metaScore.Locale.t('player.component.Controller.locked', 'Locked ?')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return BinaryExpression
         */
        'getter': function(skipDefault){
          return this.data('locked') === "true";
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('locked', value ? "true" : null);
        }
      },
      'x': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Controller.x', 'X')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('left'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('left', value +'px');
        }
      },
      'y': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Controller.y', 'Y')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('top'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('top', value +'px');
        }
      },
      'border-radius': {
        'type': 'BorderRadius',
        'configs': {
          'label': metaScore.Locale.t('player.component.Controller.border-radius', 'Border radius')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.css('border-radius', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('border-radius', value);
        }
      }
    }
  };

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Controller.prototype.setupDOM = function(){
    // call parent function
    Controller.parent.prototype.setupDOM.call(this);

    this.addClass('controller');

    this.timer = new metaScore.Dom('<div/>', {'class': 'timer', 'text': '00:00.00'})
      .appendTo(this);

    this.rewind_btn = new metaScore.Dom('<button/>')
      .data('action', 'rewind');

    this.play_btn = new metaScore.Dom('<button/>')
      .data('action', 'play');

    new metaScore.Dom('<div/>', {'class': 'buttons'})
      .append(this.rewind_btn)
      .append(this.play_btn)
      .appendTo(this);
  };

  /**
   * Description
   * @method getName
   * @return Literal
   */
  Controller.prototype.getName = function(){
    return '[controller]';
  };

  /**
   * Description
   * @method updateTime
   * @param {} time
   * @return 
   */
  Controller.prototype.updateTime = function(time){
    var centiseconds = metaScore.String.pad(parseInt(time % 100, 10), 2, '0', 'left'),
      seconds = metaScore.String.pad(parseInt((time / 100) % 60, 10), 2, '0', 'left'),
      minutes = metaScore.String.pad(parseInt((time / 6000), 10), 2, '0', 'left');

    this.timer.text(minutes +':'+ seconds +'.'+ centiseconds);
  };

  /**
   * Description
   * @method setDraggable
   * @param {} draggable
   * @return MemberExpression
   */
  Controller.prototype.setDraggable = function(draggable){
    
    draggable = draggable !== false;
  
    if(this.getProperty('locked') && draggable){
      return false;
    }

    if(draggable && !this._draggable){    
      this._draggable = new metaScore.Draggable({
        'target': this,
        'handle': this.child('.timer'),
        'container': this.parents(),
        'limits': {
          'top': 0,
          'left': 0
        }
      });
    }
    else if(!draggable && this._draggable){
      this._draggable.destroy();
      delete this._draggable;
    }
    
    return this._draggable;
  
  };

  /**
   * Description
   * @method setResizable
   * @param {} resizable
   * @return MemberExpression
   */
  Controller.prototype.setResizable = function(resizable){
  
    return false;
  
  };

  return Controller;

})();
/**
* Description
* @class Element
* @namespace metaScore.player.component
* @extends metaScore.player.Component
*/

metaScore.namespace('player.component').Element = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Element(configs) {
    // call parent constructor
    Element.parent.call(this, configs);
  }

  metaScore.player.Component.extend(Element);

  Element.defaults = {
    'properties': {
      'name': {
        'type': 'Text',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.name', 'Name')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.data('name');
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('name', value);
        }
      },
      'type': {
        'editable':false,
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.data('type');
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('type', value);
        }
      },
      'locked': {
        'type': 'Boolean',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.locked', 'Locked ?')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return BinaryExpression
         */
        'getter': function(skipDefault){
          return this.data('locked') === "true";
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('locked', value ? "true" : null);
        }
      },
      'x': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.x', 'X')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('left'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('left', value +'px');
        }
      },
      'y': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.y', 'Y')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('top'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('top', value +'px');
        }
      },
      'width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.width', 'Width'),
          'min': 10
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('width'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('width', value +'px');
        }
      },
      'height': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.height', 'Height'),
          'min': 10
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('height'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('height', value +'px');
        }
      },
      'r-index': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.r-index', 'Reading index'),
          'min': 0
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = this.data('r-index');
          return value !== null ? parseInt(value, 10) : null;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('r-index', value);
        }
      },
      'z-index': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.z-index', 'Display index')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = this.css('z-index', undefined, skipDefault);
          return value !== null ? parseInt(value, 10) : null;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('z-index', value);
        }
      },
      'background-color': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.background-color', 'Background color')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.contents.css('background-color', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.contents.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'background-image': {
        'type': 'Image',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.background-image', 'Background image')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          var value = this.contents.css('background-image', undefined, skipDefault);

          if(value === 'none' || !metaScore.Var.is(value, "string")){
            return null;
          }

          return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
          this.contents.css('background-image', value);
        }
      },
      'border-width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.border-width', 'Border width')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = this.contents.css('border-width', undefined, skipDefault);
          return value !== null ? parseInt(value, 10) : null;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.contents.css('border-width', value +'px');
        }
      },
      'border-color': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.border-color', 'Border color')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.contents.css('border-color', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.contents.css('border-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'border-radius': {
        'type': 'BorderRadius',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.border-radius', 'Border radius')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.contents.css('border-radius', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.contents.css('border-radius', value);
        }
      },
      'opacity': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.opacity', 'Opacity'),
          'min': 0,
          'max': 1,
          'step': 0.1
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.contents.css('opacity', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.contents.css('opacity', value);
        }
      },
      'start-time': {
        'type': 'Time',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.start-time', 'Start time'),
          'checkbox': true,
          'inButton': true,
          'outButton': true
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = parseFloat(this.data('start-time'));
          return isNaN(value) ? null : value;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('start-time', isNaN(value) ? null : value);
        }
      },
      'end-time': {
        'type': 'Time',
        'configs': {
          'label': metaScore.Locale.t('player.component.Element.end-time', 'End time'),
          'checkbox': true,
          'inButton': true,
          'outButton': true
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = parseFloat(this.data('end-time'));
          return isNaN(value) ? null : value;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('end-time', isNaN(value) ? null : value);
        }
      }
    }
  };

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Element.prototype.setupDOM = function(){
    // call parent function
    Element.parent.prototype.setupDOM.call(this);

    this.addClass('element');

    this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
      .appendTo(this);
  };

  /**
   * Description
   * @method getBlock
   * @return CallExpression
   */
  Element.prototype.getPage = function(){
    var dom = this.parents().get(0),
      page;
    
    if(dom){
      page = dom._metaScore;
    
    }
    return page;
  };

  /**
   * Description
   * @method onCuePointStart
   * @param {} cuepoint
   * @return 
   */
  Element.prototype.onCuePointStart = function(cuepoint){
    this.addClass('active');
  };

  /**
   * Description
   * @method onCuePointEnd
   * @param {} cuepoint
   * @return 
   */
  Element.prototype.onCuePointEnd = function(cuepoint){
    this.removeClass('active');
  };

  /**
   * Description
   * @method onCuePointSeekOut
   * @param {} cuepoint
   * @return 
   */
  Element.prototype.onCuePointSeekOut = Element.prototype.onCuePointEnd;

  /**
   * Description
   * @method setDraggable
   * @param {} draggable
   * @return MemberExpression
   */
  Element.prototype.setDraggable = function(draggable){
    
    draggable = draggable !== false;
  
    if(this.getProperty('locked') && draggable){
      return false;
    }

    if(draggable && !this._draggable){
      this._draggable = new metaScore.Draggable({
        'target': this,
        'handle': this,
        'container': this.parents()
      });
    }
    else if(!draggable && this._draggable){
      this._draggable.destroy();
      delete this._draggable;
    }
    
    return this._draggable;
  
  };

  /**
   * Description
   * @method setResizable
   * @param {} resizable
   * @return MemberExpression
   */
  Element.prototype.setResizable = function(resizable){
    
    resizable = resizable !== false;
  
    if(this.getProperty('locked') && resizable){
      return false;
    }
  
    if(resizable && !this._resizable){
      this._resizable = new metaScore.Resizable({
        'target': this,
        'container': this.parents()
      });
    }
    else if(!resizable && this._resizable){
      this._resizable.destroy();
      delete this._resizable;
    }
    
    return this._resizable;
  
  };

  return Element;

})();
/**
* Description
* @class Media
* @namespace metaScore.player.component
* @extends metaScore.player.Component
*/

metaScore.namespace('player.component').Media = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Media(configs){
    // call parent constructor
    Media.parent.call(this, configs);

    this.addClass('media').addClass(this.configs.type);
      
    this.el = new metaScore.Dom('<'+ this.configs.type +'></'+ this.configs.type +'>', {'preload': 'auto'})
      .appendTo(this);

    this.dom = this.el.get(0);

    this
      .addMediaListener('play', metaScore.Function.proxy(this.onPlay, this))
      .addMediaListener('pause', metaScore.Function.proxy(this.onPause, this))
      .addMediaListener('timeupdate', metaScore.Function.proxy(this.onTimeUpdate, this));

    this.playing = false;
  }

  metaScore.player.Component.extend(Media);

  Media.defaults = {
    'type': 'audio',
    'useFrameAnimation': true,
    'properties': {
      'locked': {
        'type': 'Boolean',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.locked', 'Locked ?')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return BinaryExpression
         */
        'getter': function(skipDefault){
          return this.data('locked') === "true";
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('locked', value ? "true" : null);
        }
      },
      'x': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.x', 'X')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('left'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('left', value +'px');
        }
      },
      'y': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.y', 'Y')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('top'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('top', value +'px');
        },
      },
      'width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.width', 'Width')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('width'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('width', value +'px');
        }
      },
      'height': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.height', 'Height')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return parseInt(this.css('height'), 10);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('height', value +'px');
        }
      },
      'border-radius': {
        'type': 'BorderRadius',
        'configs': {
          'label': metaScore.Locale.t('player.component.Media.border-radius', 'Border radius')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.css('border-radius', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.css('border-radius', value);
        }
      }
    }
  };

  /**
   * Description
   * @method setSources
   * @return ThisExpression
   */
  Media.prototype.setSources = function(sources, supressEvent){
    var source_tags = '';

    metaScore.Array.each(sources, function(index, source) {      
      source_tags += '<source src="'+ source.url +'" type="'+ source.mime +'"></source>';
    }, this);
      
    this.el.text(source_tags);
    
    this.dom.load();

    if(supressEvent !== true){
      this.triggerEvent('sourcesset', {'media': this});
    }

    return this;
    
  };

  /**
   * Description
   * @method getName
   * @return Literal
   */
  Media.prototype.getName = function(){
    return '[media]';
  };

  /**
   * Description
   * @method onPlay
   * @param {} evt
   * @return 
   */
  Media.prototype.onPlay = function(evt) {
    this.playing = true;
    
    if(this.configs.useFrameAnimation){
      this.triggerTimeUpdate();
    }
  };

  /**
   * Description
   * @method onPause
   * @param {} evt
   * @return 
   */
  Media.prototype.onPause = function(evt) {
    this.playing = false;
  };

  /**
   * Description
   * @method onTimeUpdate
   * @param {} evt
   * @return 
   */
  Media.prototype.onTimeUpdate = function(evt){
    if(!(evt instanceof CustomEvent)){
      evt.stopImmediatePropagation();
    }

    if(!this.configs.useFrameAnimation){
      this.triggerTimeUpdate(false);
    }
  };

  /**
   * Description
   * @method isPlaying
   * @return MemberExpression
   */
  Media.prototype.isPlaying = function() {
    return this.playing;
  };

  /**
   * Description
   * @method reset
   * @return ThisExpression
   */
  Media.prototype.reset = function() {
    this.setTime(0);
    
    return this;
  };

  /**
   * Description
   * @method play
   * @return ThisExpression
   */
  Media.prototype.play = function() {
    this.dom.play();
    
    return this;
  };

  /**
   * Description
   * @method pause
   * @return ThisExpression
   */
  Media.prototype.pause = function() {
    this.dom.pause();
    
    return this;
  };

  /**
   * Description
   * @method triggerTimeUpdate
   * @param {} loop
   * @return 
   */
  Media.prototype.triggerTimeUpdate = function(loop) {
    if(loop !== false && this.isPlaying()){
      window.requestAnimationFrame(metaScore.Function.proxy(this.triggerTimeUpdate, this));
    }

    this.el.triggerEvent('timeupdate', {'media': this});
  };

  /**
   * Description
   * @method setTime
   * @param {} time
   * @return ThisExpression
   */
  Media.prototype.setTime = function(time) {
    this.dom.currentTime = parseFloat(time) / 100;

    this.triggerTimeUpdate(false);
    
    return this;
  };

  /**
   * Description
   * @method getTime
   * @return BinaryExpression
   */
  Media.prototype.getTime = function() {
    return parseFloat(this.dom.currentTime) * 100;
  };

  /**
   * Description
   * @method getDuration
   * @return BinaryExpression
   */
  Media.prototype.getDuration = function() {
    return parseFloat(this.dom.duration) * 100;
  };

  /**
   * Description
   * @method addMediaListener
   * @param {} type
   * @param {} callback
   * @param {} useCapture
   * @return ThisExpression
   */
  Media.prototype.addMediaListener = function(type, callback, useCapture) {
    this.el.addListener(type, callback, useCapture);
    
    return this;
  };

  /**
   * Description
   * @method removeMediaListener
   * @param {} type
   * @param {} callback
   * @param {} useCapture
   * @return ThisExpression
   */
  Media.prototype.removeMediaListener = function(type, callback, useCapture) {
    this.el.removeListener(type, callback, useCapture);
    
    return this;
  };

  /**
   * Description
   * @method setDraggable
   * @param {} draggable
   * @return MemberExpression
   */
  Media.prototype.setDraggable = function(draggable){
    
    draggable = draggable !== false;
  
    if(this.getProperty('locked') && draggable){
      return false;
    }

    if(draggable && !this._draggable){    
      this._draggable = new metaScore.Draggable({
        'target': this,
        'handle': this.child('video'),
        'container': this.parents(),
        'limits': {
          'top': 0,
          'left': 0
        }
      });
    }
    else if(!draggable && this._draggable){
      this._draggable.destroy();
      delete this._draggable;
    }
    
    return this._draggable;
  
  };

  return Media;

})();
/**
* Description
* @class Page
* @namespace metaScore.player.component
* @extends metaScore.player.Component
*/

metaScore.namespace('player.component').Page = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Page(configs) {
    // call parent constructor
    Page.parent.call(this, configs);
  }

  metaScore.player.Component.extend(Page);

  Page.defaults = {
    'properties': {
      'background-color': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('player.component.Page.background-color', 'Background color')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.css('background-color', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      },
      'background-image': {
        'type': 'Image',
        'configs': {
          'label': metaScore.Locale.t('player.component.Page.background-image', 'Background image')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          var value = this.css('background-image', undefined, skipDefault);

          if(value === 'none' || !metaScore.Var.is(value, "string")){
            return null;
          }

          return value.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          value = (value !== 'none' && metaScore.Var.is(value, "string") && (value.length > 0)) ? 'url('+ value +')' : null;
          this.css('background-image', value);
        }
      },
      'start-time': {
        'type': 'Time',
        'configs': {
          'label': metaScore.Locale.t('player.component.Page.start-time', 'Start time'),
          'checkbox': false,
          'inButton': true,
          'outButton': true
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = parseFloat(this.data('start-time'));
          return isNaN(value) ? null : value;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('start-time', isNaN(value) ? null : value);
        }
      },
      'end-time': {
        'type': 'Time',
        'configs': {
          'label': metaScore.Locale.t('player.component.Page.end-time', 'End time'),
          'checkbox': false,
          'inButton': true,
          'outButton': true
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = parseFloat(this.data('end-time'));
          return isNaN(value) ? null : value;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('end-time', isNaN(value) ? null : value);
        }
      },
      'elements': {
        'editable': false,
        /**
         * Description
         * @param {} skipDefault
         * @return elements
         */
        'getter': function(skipDefault){
          var elements = [];

          this.getElements().each(function(index, element){
            elements.push(element._metaScore.getProperties(skipDefault));
          }, this);

          return elements;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          metaScore.Array.each(value, function(index, configs){
            this.addElement(configs);
          }, this);
        }
      }
    }
  };

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Page.prototype.setupDOM = function(){
    // call parent function
    Page.parent.prototype.setupDOM.call(this);

    this.addClass('page');
  };

  /**
   * Description
   * @method addElement
   * @param {} configs
   * @return element
   */
  Page.prototype.addElement = function(configs, supressEvent){
    var element;

    if(configs instanceof metaScore.player.component.Element){
      element = configs;
      element.appendTo(this);
    }
    else{
      element = new metaScore.player.component.element[configs.type](metaScore.Object.extend({}, configs, {
        'container': this
      }));
    }

    if(supressEvent !== true){
      this.triggerEvent('elementadd', {'page': this, 'element': element});
    }

    return element;
  };

  /**
   * Description
   * @method getBlock
   * @return CallExpression
   */
  Page.prototype.getBlock = function(){
    var dom = this.parents().parents().get(0),
      block;
    
    if(dom){
      block = dom._metaScore;
    }
    
    return block;
  };

  /**
   * Description
   * @method getElements
   * @return CallExpression
   */
  Page.prototype.getElements = function(){
    return this.children('.element');
  };

  /**
   * Description
   * @method onCuePointStart
   * @param {} cuepoint
   * @return 
   */
  Page.prototype.onCuePointStart = function(cuepoint){
    this.triggerEvent('cuepointstart');
  };

  /**
   * Description
   * @method onCuePointEnd
   * @param {} cuepoint
   * @return 
   */
  Page.prototype.onCuePointEnd = function(cuepoint){
    this.triggerEvent('cuepointend');
  };

  /**
   * Description
   * @method onCuePointSeekOut
   * @param {} cuepoint
   * @return 
   */
  Page.prototype.onCuePointSeekOut = Page.prototype.onCuePointEnd;

  return Page;

})();
/**
* Description
* @class Cursor
* @namespace metaScore.player.component.element
* @extends metaScore.player.component.Element
*/

metaScore.namespace('player.component.element').Cursor = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Cursor(configs) {
    // call parent constructor
    Cursor.parent.call(this, configs);
  }

  metaScore.player.component.Element.extend(Cursor);

  Cursor.defaults = {
    'properties': metaScore.Object.extend({}, metaScore.player.component.Element.defaults.properties, {
      'direction': {
        'type': 'Select',
        'configs': {
          'label': metaScore.Locale.t('player.component.element.Cursor.direction', 'Direction'),
          'options': {
            'right': metaScore.Locale.t('player.component.element.Cursor.direction.right', 'Left > Right'),
            'left': metaScore.Locale.t('player.component.element.Cursor.direction.left', 'Right > Left'),
            'bottom': metaScore.Locale.t('player.component.element.Cursor.direction.bottom', 'Top > Bottom'),
            'top': metaScore.Locale.t('player.component.element.Cursor.direction.top', 'Bottom > Top'),
          }
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.data('direction');
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('direction', value);
        }
      },
      'acceleration': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.element.Cursor.acceleration', 'Acceleration')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
          return this.data('accel');
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.data('accel', value);
        }
      },
      'cursor-width': {
        'type': 'Number',
        'configs': {
          'label': metaScore.Locale.t('player.component.element.Cursor.cursor-width', 'Cursor width')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return ConditionalExpression
         */
        'getter': function(skipDefault){
          var value = this.cursor.css('width', undefined, skipDefault);
          return value !== null ? parseInt(value, 10) : null;
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.cursor.css('width', value +'px');
        }
      },
      'cursor-color': {
        'type': 'Color',
        'configs': {
          'label': metaScore.Locale.t('player.component.element.Cursor.cursor-color', 'Cursor color')
        },
        /**
         * Description
         * @param {} skipDefault
         * @return CallExpression
         */
        'getter': function(skipDefault){
           return this.cursor.css('background-color', undefined, skipDefault);
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          var color = metaScore.Color.parse(value);
          this.cursor.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
        }
      }
    })
  };

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Cursor.prototype.setupDOM = function(){
    // call parent function
    Cursor.parent.prototype.setupDOM.call(this);

    this.data('type', 'cursor');

    this.cursor = new metaScore.Dom('<div/>', {'class': 'cursor'})
      .appendTo(this.contents);

    this
      .addListener('click', metaScore.Function.proxy(this.onClick, this))
      .addListener('dblclick', metaScore.Function.proxy(this.onClick, this));
  };

  /**
   * Description
   * @method onClick
   * @param {} evt
   * @return 
   */
  Cursor.prototype.onClick = function(evt){
    var pos, time,
      inTime, outTime,
      direction, acceleration,
      rect;

    if(metaScore.editing && evt.type !== 'dblclick'){
      return;
    }

    inTime = this.getProperty('start-time');
    outTime = this.getProperty('end-time');
    direction = this.getProperty('direction');
    acceleration = this.getProperty('acceleration');
    rect = evt.target.getBoundingClientRect();

    switch(direction){
      case 'left':
        pos = (rect.right - evt.clientX) / this.getProperty('width');
        break;

      case 'bottom':
        pos = (evt.clientY - rect.top) / this.getProperty('height');
        break;

      case 'top':
        pos = (rect.bottom - evt.clientY) / this.getProperty('height');
        break;

      default:
        pos = (evt.clientX - rect.left) / this.getProperty('width');
    }

    if(!acceleration || acceleration === 1){
      time = inTime + ((outTime - inTime) * pos);
    }
    else{
      time = inTime + ((outTime - inTime) * Math.pow(pos, 1/acceleration));
    }

    this.triggerEvent('time', {'element': this, 'value': time});
  };

  /**
   * Description
   * @method onCuePointUpdate
   * @param {} cuepoint
   * @param {} curTime
   * @return 
   */
  Cursor.prototype.onCuePointUpdate = function(cuepoint, curTime){
    var width, height,
      inTime, outTime, pos,
      direction = this.getProperty('direction'),
      acceleration = this.getProperty('acceleration');

    inTime = this.getProperty('start-time');
    outTime = this.getProperty('end-time');

    if(!acceleration || acceleration === 1){
      pos = (curTime - inTime)  / (outTime - inTime);
    }
    else{
      pos = Math.pow((curTime - inTime) / (outTime - inTime), acceleration);
    }

    switch(direction){
      case 'left':
        width = this.getProperty('width');
        pos = Math.min(width * pos, width);
        this.cursor.css('right', pos +'px');
        break;

      case 'bottom':
        height = this.getProperty('height');
        pos = Math.min(height * pos, height);
        this.cursor.css('top', pos +'px');
        break;

      case 'top':
        height = this.getProperty('height');
        pos = Math.min(height * pos, height);
        this.cursor.css('bottom', pos +'px');
        break;

      default:
        width = this.getProperty('width');
        pos = Math.min(width * pos, width);
        this.cursor.css('left', pos +'px');
    }
  };

  return Cursor;

})();
/**
* Description
* @class Image
* @namespace metaScore.player.component.element
* @extends metaScore.player.component.Element
*/

metaScore.namespace('player.component.element').Image = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Image(configs) {
    // call parent constructor
    Image.parent.call(this, configs);
  }

  metaScore.player.component.Element.extend(Image);

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Image.prototype.setupDOM = function(){
    // call parent function
    Image.parent.prototype.setupDOM.call(this);

    this.data('type', 'image');
  };

  return Image;

})();
/**
* Description
* @class Text
* @namespace metaScore.player.component.element
* @extends metaScore.player.component.Element
*/

metaScore.namespace('player.component.element').Text = (function () {

  /**
   * Description
   * @constructor
   * @param {} configs
   */
  function Text(configs) {
    // call parent constructor
    Text.parent.call(this, configs);

    this.addDelegate('a', 'click', metaScore.Function.proxy(this.onLinkClick, this));
  }

  metaScore.player.component.Element.extend(Text);

  Text.defaults = {
    'properties': metaScore.Object.extend({}, metaScore.player.component.Element.defaults.properties, {
      'text': {
        'editable':false,
        /**
         * Description
         * @return CallExpression
         */
        'getter': function(){
          return this.contents.text();
        },
        /**
         * Description
         * @param {} value
         * @return 
         */
        'setter': function(value){
          this.contents.text(value);
        }
      }
    })
  };

  /**
   * Description
   * @method setupDOM
   * @return 
   */
  Text.prototype.setupDOM = function(){
    // call parent function
    Text.parent.prototype.setupDOM.call(this);

    this.data('type', 'text');
  };

  /**
   * Description
   * @method onLinkClick
   * @param {} evt
   * @return 
   */
  Text.prototype.onLinkClick = function(evt){
    var link = evt.target,
      matches;
      
    if(!metaScore.Dom.is(link, 'a')){
      link = metaScore.Dom.closest(link, 'a');
    }
    
    if(link){
      if(matches = link.hash.match(/^#p=(\d+)/)){
        this.triggerEvent('page', {'element': this, 'value': parseInt(matches[1])-1});
        evt.preventDefault();
      }
      else if(matches = link.hash.match(/^#t=(\d*\.?\d+),(\d*\.?\d+)&r=(\d+)/)){
        this.triggerEvent('time', {'element': this, 'inTime': parseFloat(matches[1]), 'outTime': parseFloat(matches[2]) - 1, 'rIndex': parseInt(matches[3])});
      }
      else{
        window.open(link.href,'_blank');
      }

      evt.preventDefault();
    }

  };

  return Text;

})();


} (this));