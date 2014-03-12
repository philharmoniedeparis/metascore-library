/*! metaScore - v0.0.1 - 2014-03-12 - Oussama Mubarak */
;(function (global) {

  if (typeof DEBUG === 'undefined') {
    DEBUG = true;
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
/*global global*/

/**
* Variable helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Var = {

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
  };
  
}(global));
/*global global*/

/**
* String helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.String = {

    /**
    * Capitalize a string
    * @param {string} the original string
    * @returns {string} the capitalized string
    */
    capitalize: function(str){
      return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    }
  };
  
}(global));
/*global global*/

/**
* Object helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Object = {

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
  };
  
}(global));
/*global global*/

/**
* Array helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Array = {

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
  };
  
}(global));
/*global global*/

/**
* Function helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Function = {

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
    }
  };
  
}(global));
/*global global console ActiveXObject*/

/**
* Ajax helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Ajax = {
  
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
        console.log(xhr.readyState);
      
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

  };
  
}(global));
/*global global*/

/**
* Defines the Class object
*/
(function (context) {

  var metaScore = context.metaScore;
  
  metaScore.Class = function(configs){
  
    var _this = this;
          
    metaScore.Object.each(configs, function(key, value){
      this.createGetter(configs, key);
      this.createSetter(configs, key);
    }, this);
    
  };
  
  metaScore.Class.prototype.createGetter = function(object, prop){
    this['get'+ metaScore.String.capitalize(prop)] = function(){
      return object[prop];
    };
  };
  
  metaScore.Class.prototype.createSetter = function(object, prop){
    this['set'+ metaScore.String.capitalize(prop)] = function(value){
      object[prop] = value;
    };
  };
  
  metaScore.Class.extend = function (constructor, static_properties, prototype_properties) {
  
    var cls, key;
  
    // set the class's constructor
    if(constructor){
      cls = constructor;
    }
    else{
      cls = this.prototype.constructor;
    }
  
    cls.prototype = new metaScore.Class();
    cls.prototype.constructor =  cls;
    cls.superClass = this;
    
    // set the class's static properties
    metaScore.Object.each(static_properties, function(key, value){
      cls[key] = value;
    });
    
    // set the class's prototype properties
    metaScore.Object.each(prototype_properties, function(key, value){
      cls.prototype[key] = value;
    });
    
    return cls;
    
  };
    
}(global));
/*global global*/

/**
* Dom helper functions
*/
(function (context) {

  var metaScore = context.metaScore;

  metaScore.Dom = metaScore.Class.extend(  
  
    // constructor
    function(els) {
      this.els = [];

      for(var i = 0; i < els.length; i++ ) {
        this.els[i] = els[i];
      }
    },    
    
    // static properties
    {
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
      * Select elements by selecor
      * @param {string} the selector
      * @param {object} an optional parent to constrain the matched elements 
      * @returns {object} a metaScore.Dom instance
      */
      select: function (selector, parent) {    
        var els;
        
        if(!parent){
          parent = document;
        }

        if (metaScore.Var.is(selector, 'string')) {
          els = parent.querySelectorAll(selector);
        }
        else if (selector.length) { 
          els = selector;
        }
        else {
          els = [selector];
        }

        return new metaScore.Dom(els);
      },

      /**
      * Creates an element
      * @param {string} the tag of the element to create
      * @param {attrs} an optional object of attributes to assign
      * @returns {object} a metaScore.Dom instance
      */         
      create: function (tag, attrs) {

        var dom = new metaScore.Dom([document.createElement(tag)]);
        
        if (attrs) {
          if (attrs.hasOwnProperty('class')) {
            dom.addClass(attrs['class']);
            delete attrs['class'];
          }
          
          if (attrs.hasOwnProperty('text')) {
            dom.text(attrs['text']);
            delete attrs['text'];
          }
          
          metaScore.Object.each(attrs, function(key, value){
            dom.attr(key, value);
          });
        }

        return dom;

      },

      /**
      * Checks if an element has a given class
      * @param {object} the dom element
      * @param {string} the class to check
      * @returns {boolean} true if the element has the given class, false otherwise
      */     
      hasClass: function(el, className){
        return el.classList.contains(className);
      },

      /**
      * Adds a given class to an element
      * @param {object} the dom element
      * @param {string} the class(es) to add; separated by a space
      * @returns {void}
      */
      addClass: function(el, className){
        var classNames = className.split(" "),
          i = 0, l = classNames.length;
        
        for(; i<l; i++){
          el.classList.add(classNames[i]);
        }
      },

      /**
      * Removes a given class from an element
      * @param {object} the dom element
      * @param {string} the class(es) to remove; separated by a space
      * @returns {void}
      */
      removeClass: function(el, className){
        var classNames = className.split(" "),
          i = 0, l = classNames.length;
        
        for(; i<l; i++){
          el.classList.remove(classNames[i]);
        }
      },

      /**
      * Toggles a given class on an element
      * @param {object} the dom element
      * @param {string} the class(es) to toggle; separated by a space
      * @returns {void}
      */
      toggleClass: function(el, className){
        var classNames = className.split(" "),
          i = 0, l = classNames.length;
        
        for(; i<l; i++){
          el.classList.toggle(classNames[i]);
        }
      },

      /**
      * Sets or gets the innerHTML of an element
      * @param {object} the dom element
      * @param {string} an optional text to set
      * @returns {string} the value of the innerHTML
      */
      text: function(el, value){
        if(value !== undefined){
          el.innerHTML = value;
        }
        
        return el.innerHTML;
      },

      /**
      * Sets or gets an attribute of an element
      * @param {object} the dom element
      * @param {string} the attribute's name
      * @param {string} an optional value to set
      * @returns {string} the value of the attribute
      */
      attr: function(el, name, value){
        if(value !== undefined){
          el.setAttribute(name, value);
        }
        
        return el.getAttribute(name);
      },

      /**
      * Sets or gets a style property of an element
      * @param {object} the dom element
      * @param {string} the property's name
      * @param {string} an optional value to set
      * @returns {string} the value of the property
      */
      css: function(el, name, value){
        name = this.camel(name);
      
        if(value !== undefined){
          el.style[name] = value;
        }
        
        return el.style[name];
      },

      /**
      * Appends children to an element
      * @param {object} the dom element
      * @param {object/array} the child(ren) to append
      * @returns {void}
      */
      append: function(el, children){
        if (!metaScore.Var.is(children, 'array')) {
          children = [children];
        }
        
        metaScore.Array.each(children, function(child){
          el.appendChild(child);
        }, this);
      },

      /**
      * Removes an element from the dom
      * @param {object} the dom element
      * @returns {void}
      */
      remove: function(el){
        el.parentElement.removeChild(el);
      }
    },
    
    // prototype properties
    {
      get: function(index){
        return this.els[index];
      },
      addClass: function(className) {  
        metaScore.Array.each(this.els, function(el) {
          this.constructor.addClass(el, className);
        }, this);
        return this;        
      },      
      removeClass: function(className) {  
        metaScore.Array.each(this.els, function(el) {
          this.constructor.removeClass(el, className);
        }, this);        
        return this;        
      },
      toggleClass: function(className) {  
        metaScore.Array.each(this.els, function(el) {
          this.constructor.toggleClass(el, className);
        }, this);        
        return this;        
      },
      text: function(value) {  
        metaScore.Array.each(this.els, function(el) {
          this.constructor.text(el, value);
        }, this);        
        return this;        
      },
      attr: function(name, value) {  
        metaScore.Array.each(this.els, function(el) {
          this.constructor.attr(el, name, value);
        }, this);
        return this;
      },
      css: function(name, value) {  
        metaScore.Array.each(this.els, function(el) {
          this.constructor.css(el, name, value);
        }, this);
        return this;
      },
      append: function(children){
        this.constructor.append(this.get(0), children);
        return this;
      },
      appendTo: function(parent){
        if(parent instanceof metaScore.Dom){
          parent = parent.get(0);
        }
        
        metaScore.Array.each(this.els, function(el) {
          this.constructor.append(parent, el);
        }, this);
        return this;
      },
      remove: function(){
        metaScore.Array.each(this.els, function(el) {
          this.constructor.remove(el);
        }, this);
        return this;
      }
    }
  );
  
}(global));

} (this));