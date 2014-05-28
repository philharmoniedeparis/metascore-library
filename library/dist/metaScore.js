/*! metaScore - v0.0.1 - 2014-05-29 - Oussama Mubarak */
;(function (global) {

  if (typeof DEBUG === 'undefined') {
    DEBUG = true;
  }
  
  // from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/create
  if (typeof Object.create != 'function') {
    (function () {
        var F = function () {};
        Object.create = function (o) {
            if (arguments.length > 1) { throw Error('Second argument not supported');}
            if (o === null) { throw Error('Cannot set a null [[Prototype]]');}
            if (typeof o != 'object') { throw TypeError('Argument must be an object');}
            F.prototype = o;
            return new F;
        };
    })();
  }
/*global global*/

/**
* Core functions
*/
(function (context) {
    
    context.metaScore = {
      version: "0.0.1"
    };
  
}(global));
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
/*global global console ActiveXObject*/

/**
* Ajax helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Ajax = metaScore.Base.extend({
    statics: {    
      /**
      * Default options
      */
      defaults: {
        'method': 'GET',
        'headers': [],
        'async': true,
        'data': {},
        'complete': null,
        'success': null,
        'error': null
      },
    
      /**
      * ActiveX XMLHttp versions
      */
      activeX: [
        "MSXML2.XMLHttp.5.0",
        "MSXML2.XMLHttp.4.0",
        "MSXML2.XMLHttp.3.0",
        "MSXML2.XMLHttp",
        "Microsoft.XMLHttp"
      ],

      /**
      * Create an XMLHttp object
      * @returns {object} the XMLHttp object
      */
      createXHR: function() {
      
        var xhr, i, l;
      
        if (typeof XMLHttpRequest !== "undefined") {
          xhr = new XMLHttpRequest();
          return xhr;
        }
        else if (window.ActiveXObject) {
          for (i = 0, l = metaScore.Ajax.activeX.length; i < l; i++) {
            try {
              xhr = new ActiveXObject(metaScore.Ajax.activeX[i]);
              return xhr;
            }
            catch (e) {}
          }
        }
        
        throw new Error("XMLHttp object could be created.");
        
      },

      /**
      * Send an XMLHttp request
      * @param {string} the url of the request
      * @param {object} options to set for the request; see the defaults variable
      * @returns {object} the XMLHttp object
      */
      send: function(url, options) {
      
        var key,
          xhr = metaScore.Ajax.createXHR(),
          data, query = [];
        
        options = metaScore.Object.extend({}, metaScore.Ajax.defaults, options);
        
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
              options.complete(xhr);
            }
            if(xhr.status >= 200 && status < 300 || status === 304){
              if(metaScore.Var.is(options.success, 'function')){
                options.success(xhr);
              }
            }
            else if(metaScore.Var.is(options.error, 'function')){
              options.error(xhr);
            }
          }
        };
        
        xhr.send(data);
        
        return xhr;
        
      },

      /**
      * Send an XMLHttp GET request
      * @param {string} the url of the request
      * @param {object} options to set for the request; see the defaults variable
      * @returns {object} the XMLHttp object
      */
      get: function(url, options) {
        
        metaScore.Object.extend(options, {'method': 'GET'});
        
        return metaScore.Ajax.send(url, options);
        
      },

      /**
      * Send an XMLHttp POST request
      * @param {string} the url of the request
      * @param {object} options to set for the request; see the defaults variable
      * @returns {object} the XMLHttp object
      */
      post: function(url, options) {
        
        metaScore.Object.extend(options, {'method': 'POST'});
        
        return metaScore.Ajax.send(url, options);
        
      }
    }

  });
  
}(global));
/*global global*/

/**
* Array helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Array = metaScore.Base.extend({
    statics: {
      /**
      * Checks if a value is in an array
      * @param {mixed} the value to check
      * @param {array} the array
      * @returns {number} the index of the value if found, -1 otherwise
      */
      inArray: function (value, arr) {
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
      },

      /**
      * Copies an array
      * @param {array} the original array
      * @returns {array} a copy of the array
      */
      copy: function (arr) {
        return [].concat(arr);
      },

      /**
      * Shuffles elements in an array
      * @param {array} the original array
      * @returns {array} a copy of the array with it's elements shuffled
      */
      shuffle: function(arr) {

        var shuffled = metaScore.Array.copy(arr);

        shuffled.sort(function(){
          return ((Math.random() * 3) | 0) - 1;
        });

        return shuffled;

      },

      /**
      * Return new array with duplicate values removed
      * @param {array} the original array
      * @returns {array} a copy of the array with the duplicate values removed
      */
      unique: function(arr) {

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

      },

      /**
      * Call a function on each element of an array
      * @param {array} the array
      * @param {function} the function to call
      * @returns {void}
      */
      each: function(arr, callback, scope) {
      
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

      }
    }
  });
  
}(global));
/*global global console*/

/**
* Dom helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Dom = metaScore.Base.extend({
    statics: {
      /**
      * Regular expression that matches an element's string
      */
      stringRe: /^<(.)+>$/,
      
      /**
      * Regular expression that matches dashed string for camelizing
      */
      camelRe: /-([\da-z])/gi,

      /**
      * Helper function used by the camel function
      */
      camelReplaceFn: function(all, letter) {
        return letter.toUpperCase();
      },

      /**
      * Normaliz a string to Camel Case; used for CSS properties
      * @param {string} the original string
      * @returns {string} the normalized string
      */
      camel: function(str){
        return str.replace(this.camelRe, this.camelReplaceFn);
      },

      /**
      * List of event that should generaly bubble up
      */
      bubbleEvents: {
        'click': true,
        'submit': true,
        'mousedown': true,
        'mousemove': true,
        'mouseup': true,
        'mouseover': true,
        'mouseout': true,
        'transitionend': true
      },

      /**
      * Select elements by selecor
      * @param {string} the selector
      * @param {object} an optional parent to constrain the matched elements 
      * @returns {array} an array of HTML elements
      */
      selectElements: function (selector, parent) {      
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
      },

      /**
      * Creates elements from an HTML string
      * @param {string} the HTML string
      * @returns {object} an HTML element
      */
      elementsFromString: function(str){      
        var div;
        
        if(!str.match(/^<(.)+>$/)){
          return null;
        }
        
        div = document.createElement('div');
        div.innerHTML = str;
        
        return div.childNodes;
        
      },

      /**
      * Checks if an element has a given class
      * @param {object} the dom element
      * @param {string} the class to check
      * @returns {boolean} true if the element has the given class, false otherwise
      */     
      hasClass: function(element, className){
        return element.classList.contains(className);
      },

      /**
      * Adds a given class to an element
      * @param {object} the dom element
      * @param {string} the class(es) to add; separated by a space
      * @returns {void}
      */
      addClass: function(element, className){
        var classNames = className.split(" "),
          i = 0, l = classNames.length;
        
        for(; i<l; i++){
          element.classList.add(classNames[i]);
        }
      },

      /**
      * Removes a given class from an element
      * @param {object} the dom element
      * @param {string} the class(es) to remove; separated by a space
      * @returns {void}
      */
      removeClass: function(element, className){
        var classNames = className.split(" "),
          i = 0, l = classNames.length;
        
        for(; i<l; i++){
          element.classList.remove(classNames[i]);
        }
      },

      /**
      * Toggles a given class on an element
      * @param {object} the dom element
      * @param {string} the class(es) to toggle; separated by a space
      * @returns {void}
      */
      toggleClass: function(element, className){
        var classNames = className.split(" "),
          i = 0, l = classNames.length;
        
        for(; i<l; i++){
          element.classList.toggle(classNames[i]);
        }
      },

      /**
      * Add an event listener on an element
      * @param {object} the dom element
      * @param {string} the event type to register
      * @param {function} the callback function
      * @param {boolean} specifies the event phase (capturing or bubbling) to add the event handler for
      * @returns {void}
      */
      addListener: function(element, type, callback, useCapture){
        if(useCapture === undefined){
          useCapture = metaScore.Dom.bubbleEvents.hasOwnProperty('type') ? metaScore.Dom.bubbleEvents[type] : false;
        }
      
        return element.addEventListener(type, callback, useCapture);
      },

      /**
      * Remove an event listener from an element
      * @param {object} the dom element
      * @param {string} the event type to remove
      * @param {function} the callback function
      * @param {boolean} specifies the event phase (capturing or bubbling) to add the event handler for
      * @returns {void}
      */
      removeListener: function(element, type, callback, useCapture){
        if(useCapture === undefined){
          useCapture = metaScore.Dom.bubbleEvents.hasOwnProperty('type') ? metaScore.Dom.bubbleEvents[type] : false;
        }
        
        return element.removeEventListener(type, callback, useCapture);
      },

      /**
      * Sets or gets the innerHTML of an element
      * @param {object} the dom element
      * @param {string} an optional text to set
      * @returns {string} the value of the innerHTML
      */
      text: function(element, value){
        if(value !== undefined){
          element.innerHTML = value;
        }
        
        return element.innerHTML;
      },

      /**
      * Sets or gets an attribute of an element
      * @param {object} the dom element
      * @param {string} the attribute's name
      * @param {string} an optional value to set
      * @returns {void}
      */
      attr: function(element, name, value){
        
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
              if(value !== undefined){
                element.setAttribute(name, value);
              }
              else{
                element.removeAttribute(name);
              }
              break;
          }
        }
      },

      /**
      * Sets or gets a style property of an element
      * @param {object} the dom element
      * @param {string} the property's name
      * @param {string} an optional value to set
      * @returns {string} the value of the property
      */
      css: function(element, name, value){
        name = this.camel(name);
      
        if(value !== undefined){
          element.style[name] = value;
        }
        
        return element.style[name];
      },

      /**
      * Appends children to an element
      * @param {object} the dom element
      * @param {object/array} the child(ren) to append
      * @returns {void}
      */
      append: function(element, children){
        if (!metaScore.Var.is(children, 'array')) {
          children = [children];
        }
        
        metaScore.Array.each(children, function(index, child){
          element.appendChild(child);
        }, this);
      },

      /**
      * Removes an element from the dom
      * @param {object} the dom element
      * @returns {void}
      */
      remove: function(element){
        element.parentElement.removeChild(element);
      }
    },
    init: function() {
    
      var elements;
    
      this.elements = [];
      
      if(arguments.length > 0){
        elements = metaScore.Dom.elementsFromString(arguments[0]) || metaScore.Dom.selectElements.apply(this, arguments);
        
        if(elements){
          for(var i = 0; i < elements.length; i++ ) {
            this.elements[i] = elements[i];
          }
      
          if(arguments.length > 1){
            this.attr(arguments[1]);
          }
        }
      }
    },
    get: function(index){
      return this.elements[index];
    },
    addClass: function(className) {  
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.addClass(element, className);
      }, this);
      return this;        
    },      
    removeClass: function(className) {  
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.removeClass(element, className);
      }, this);        
      return this;        
    },
    toggleClass: function(className) {  
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.toggleClass(element, className);
      }, this);        
      return this;        
    },
    addListener: function(type, callback, useCapture) {  
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.addListener(element, type, callback, useCapture);
      }, this);        
      return this;        
    },
    text: function(value) {  
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.text(element, value);
      }, this);        
      return this;        
    },
    attr: function(name, value) {
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.attr(element, name, value);
      }, this);
      
      return this;
    },
    css: function(name, value) {
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.css(element, name, value);
      }, this);
      return this;
    },
    append: function(children){
      if(children instanceof metaScore.Dom){
        children = children.elements;
      }
      
      metaScore.Dom.append(this.get(0), children);
      
      return this;
    },
    appendTo: function(parent){    
      if(!(parent instanceof metaScore.Dom)){
        parent = metaScore.Dom.create(parent);
      }
      
      parent = parent.get(0);
      
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.append(parent, element);
      }, this);
      
      return this;
    },
    remove: function(){
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.remove(element);
      }, this);
      return this;
    }
  });
  
}(global));
/*global global*/

/**
* Function helper functions
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Function = metaScore.Base.extend({
    statics: {
      /**
      * Checks if a variable is of a certain type
      * @param {mixed} the variable
      * @param {string} the type to check against
      * @returns {boolean} true if the variable is of the specified type, false otherwise
      */
      proxy: function(fn, scope) {
      
        var args;
        
        if (!metaScore.Var.type(fn, 'function')) {
          return undefined;
        }
        
        args = Array.prototype.slice.call(arguments, 2);
        
        return function () {
          return fn.apply(scope || this, args);
        };
      },
      /**
      * A reusable empty function
      */
      emptyFn: function(){}
    }
  });
  
}(global));
/*global global*/

/**
* Object helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Object = metaScore.Base.extend({  
    statics: {
      /**
      * Merge the contents of two or more objects together into the first object.
      * @returns {object} the target object extended with the properties of the other objects
      */
      extend: function() {
      
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

      },

      /**
      * Call a function on each element of an array
      * @param {array} the array
      * @param {function} the function to call
      * @returns {void}
      */
      each: function(obj, callback, scope) {
      
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

      }
    }
  });
  
}(global));
/*global global*/

/**
* String helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.String = metaScore.Base.extend({
    statics: {
      /**
      * Capitalize a string
      * @param {string} the original string
      * @returns {string} the capitalized string
      */
      capitalize: function(str){
        return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
      },

      /**
      * Translate a string
      * @param {string} the original string
      * @param {object} string replacements
      * @returns {string} the translated string
      */
      t: function(str){
        return str;
      }
    }
  });
  
}(global));
/*global global*/

/**
* Variable helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Var = metaScore.Base.extend({
    statics: {
      /**
      * Helper object used by the type function
      */
      classes2types: {
        "[object Boolean]": "boolean",
        "[object Number]": "number",
        "[object String]": "string",
        "[object Function]": "function",
        "[object Array]": "array",
        "[object Date]": "date",
        "[object RegExp]": "regexp",
        "[object Object]": "object"
      },

      /**
      * Get the type of a variable
      * @param {mixed} the variable
      * @returns {string} the type
      */
      type: function(obj) {
        return obj == null ? String(obj) : metaScore.Var.classes2types[ Object.prototype.toString.call(obj) ] || "object";
      },

      /**
      * Checks if a variable is of a certain type
      * @param {mixed} the variable
      * @param {string} the type to check against
      * @returns {boolean} true if the variable is of the specified type, false otherwise
      */
      is: function(obj, type) {
        return metaScore.Var.type(obj) === type.toLowerCase();
      }
    }
  });
  
}(global));
/*global global console*/

/**
* Button
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Form = metaScore.Form || {};

  metaScore.Form.Button = metaScore.Dom.extend({
    /**
    * Keep track of the current state
    */
    disabled: false,
    
    defaults: {    
      /**
      * The handler function to call when clicked
      */
      handler: metaScore.Function.emptyFn
    },

    /**
    * Initialize
    * @param {object} a configuration object
    * @returns {void}
    */
    init: function(configs) {
      var btn = this;
    
      this.initConfig(configs);
      
      this.callSuper('<button/>');
      
      if(this.configs.hasOwnProperty('label')){
        this.label = metaScore.Dom.create('<span/>', {'class': 'label', 'text': this.configs.label});
        this.append(this.label);
      }
      
      this.addListener('click', function(){
        if(!btn.disabled){
          btn.configs.handler.call(btn);
        }
      });
    },

    /**
    * Disable the button
    * @returns {object} the XMLHttp object
    */
    disable: function(){
      this.addClass('disabled');
      this.disabled = true;
      
      return this;
    },

    /**
    * Enable the button
    * @param {string} the url of the request
    * @param {object} options to set for the request; see the defaults variable
    * @returns {object} the XMLHttp object
    */
    enable: function(){
      this.removeClass('disabled');
      this.disabled = false;
      
      return this;
    }
  });
  
}(global));
/*global global console*/

/**
* TimeField
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Form = metaScore.Form || {};

  metaScore.Form.TimeField = metaScore.Dom.extend({
    /**
    * Keep track of the current state
    */
    disabled: false,
    
    defaults: {    
      /**
      * The handler function to call when clicked
      */
      handler: metaScore.Function.emptyFn
    },

    /**
    * Initialize
    * @param {object} a configuration object
    * @returns {void}
    */
    init: function(configs) {
      var field = this;
    
      this.initConfig(configs);
      
      this.callSuper('<div/>', {'class': 'timefield'});
      
      this.hours = metaScore.Dom.create('<input/>', {'type': 'text', 'class': 'hours', 'maxlength': 2})
        .appendTo(this);
      
      this.minutes = metaScore.Dom.create('<input/>', {'type': 'text', 'class': 'minutes', 'maxlength': 2})
        .addListener('change', function(){
          var value = parseInt(this.value, 10),
            hours;
          
          if(value > 59){
            hours = field.hours.get(0);
            hours.value = parseInt(hours.value, 10) + (value % 59);
          }
          else if(value < 0){
            hours = field.hours.get(0);
            hours.value = parseInt(hours.value, 10) - (value % 59);
          }
        })
        .appendTo(this);
      
      this.seconds = metaScore.Dom.create('<input/>', {'type': 'text', 'class': 'seconds', 'maxlength': 2})
        .appendTo(this);
      
      this.milliseconds = metaScore.Dom.create('<input/>', {'type': 'text', 'class': 'milliseconds', 'maxlength': 2})
        .appendTo(this);
    },

    /**
    * Disable the button
    * @returns {object} the XMLHttp object
    */
    disable: function(){
      this.addClass('disabled');
      this.disabled = true;
      
      return this;
    },

    /**
    * Enable the button
    * @param {string} the url of the request
    * @param {object} options to set for the request; see the defaults variable
    * @returns {object} the XMLHttp object
    */
    enable: function(){
      this.removeClass('disabled');
      this.disabled = false;
      
      return this;
    }
  });
  
}(global));
/*global global console*/

/**
* Media CuePoints
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Media = metaScore.Media || {};

  metaScore.Media.CuePoint = metaScore.Base.extend({
    triggers: [],
    init: function(media){
      this.media = media;
      
      this.media.addEventListener('timeupdate', this.onMediaTimeUpdate);
    },
    onMediaTimeUpdate: function(e){
      var media, curTime;
      
      media = e.target;
      curTime = parseFloat(media.currentTime);
      
      metaScore.Object.each(this.triggers, function (index, trigger) {
        if (!trigger.timer && curTime >= trigger.inTime - 0.5 && curTime < trigger.inTime) {
          this.setupTriggerTimer(trigger, (trigger.inTime - curTime) * 1000);
        }
      });
    },
    addTrigger: function(trigger){
      return this.triggers.push(trigger) - 1;
    },
    removeTrigger: function(index){
      var trigger = this.triggers[index];
    
      this.stopTrigger(trigger, false);
      this.triggers.splice(index, 1);
    },
    setupTriggerTimer: function(trigger, delay){
      trigger.timer = setTimeout(metaScore.Function.proxy(this.launchTrigger, this, trigger), delay);
    },
    launchTrigger: function(trigger){
      if(trigger.hasOwnProperty('onStart') && metaScore.Var.is(trigger.onStart, 'function')){
        trigger.onStart(this.media);
      }    
    },
    stopTrigger: function(trigger, launchHandler){    
      if(trigger.hasOwnProperty('timer')){
        clearTimeout(trigger.timer);
        delete trigger.timer;
      }
      
      if(trigger.hasOwnProperty('interval')){
        clearInterval(trigger.interval);
        delete trigger.interval;
      }
      
      if(launchHandler !== false && trigger.hasOwnProperty('onEnd') && metaScore.Var.is(trigger.onEnd, 'function')){
        trigger.onEnd(this.media);
      }
    }
  });
  
}(global));
/*global global console*/

/**
* Media Element
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Media = metaScore.Media || {};

  metaScore.Media.Element = metaScore.Base.extend({
  });
  
}(global));
/*global global console*/

/**
* Editor
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Editor = metaScore.Dom.extend({
    init: function(selector) {
    
      this.callSuper('<div/>', {'class': 'metaScore-editor'});    
      this.appendTo(selector);
      
      this.setupUI();
      
    },
    setupUI: function(){
    
      this.mainmenu = metaScore.Editor.MainMenu.create();
      this.append(this.mainmenu);
      
    }
  });
  
}(global));
/*global global console*/

/**
* Editor main menu
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Editor = metaScore.Editor || {};

  metaScore.Editor.MainMenu = metaScore.Dom.extend({
    init: function() {
    
      var left, right;
    
      this.callSuper('<div/>', {'class': 'main-menu clearfix'});
      
      this.buttons = {};
      
      left = metaScore.Dom.create('<div/>', {'class': 'left'}).appendTo(this);
      right = metaScore.Dom.create('<div/>', {'class': 'right'}).appendTo(this);
      
      this.buttons['new'] = metaScore.Form.Button.create({
          handler: function(){
          }
        })
        .attr({
          'class': 'new',
          'title': metaScore.String.t('New')
        })
        .appendTo(left);
      
      this.buttons['open'] = metaScore.Form.Button.create({
          handler: function(){
          }
        })
        .attr({
          'class': 'open',
          'title': metaScore.String.t('Open')
        })
        .appendTo(left);
      
      this.buttons['save'] = metaScore.Form.Button.create({
          handler: function(){
          }
        })
        .attr({
          'class': 'save',
          'title': metaScore.String.t('save')
        })
        .appendTo(left);
      
      this.buttons['download'] = metaScore.Form.Button.create({
          handler: function(){
          }
        })
        .attr({
          'class': 'download',
          'title': metaScore.String.t('download')
        })
        .appendTo(left);
      
      this.buttons['delete'] = metaScore.Form.Button.create({
          handler: function(){
          }
        })
        .attr({
          'class': 'delete',
          'title': metaScore.String.t('delete')
        })
        .appendTo(left);
      
      this.buttons['time'] = metaScore.Form.TimeField.create()
        .attr({
          'class': 'time',
          'title': metaScore.String.t('time')
        })
        .appendTo(left);
      
      this.buttons['revert'] = metaScore.Form.Button.create({
          handler: function(){
          }
        })
        .attr({
          'class': 'revert',
          'title': metaScore.String.t('revert')
        })
        .appendTo(left);
      
      this.buttons['undo'] = metaScore.Form.Button.create({
          handler: function(){
          }
        })
        .attr({
          'class': 'undo',
          'title': metaScore.String.t('undo')
        })
        .appendTo(left);
      
      this.buttons['redo'] = metaScore.Form.Button.create({
          handler: function(){
          }
        })
        .attr({
          'class': 'redo',
          'title': metaScore.String.t('redo')
        })
        .disable()
        .appendTo(left);
      
    }
  });
  
}(global));

} (this));