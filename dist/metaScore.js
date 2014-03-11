/*! metaScore - v0.0.1 - 2014-03-11 - Oussama Mubarak */
;(function (global) {

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
* Defines the Class object
*/
(function (context) {
  
  context.metaScore.Class = function(configs){
    
    for (var key in configs) {
      if(configs.hasOwnProperty(key)){
        this.createGetter(configs, key);
        this.createSetter(configs, key);
      }
    }
    
  };
  
  context.metaScore.Class.prototype.createGetter = function(object, prop){
    this['get'+ context.metaScore.String.capitaliseFirstLetter(prop)] = function(){
      return object[prop];
    };
  };
  
  context.metaScore.Class.prototype.createSetter = function(object, prop){
    this['set'+ context.metaScore.String.capitaliseFirstLetter(prop)] = function(value){
      object[prop] = value;
    };
  };
  
  context.metaScore.Class.extend = function (constructor, static_properties, prototype_properties) {
  
    var cls, key;
  
    // set the class's constructor
    if(context.metaScore.Function.isFunction(constructor)){
      cls = constructor;
    }
    else{
      cls = this.prototype.constructor;
    }
  
    cls.prototype = new context.metaScore.Class();
    cls.prototype.constructor =  cls;
    cls.superClass = this;
    
    // set the class's static properties
    for (key in static_properties) {
      if(static_properties.hasOwnProperty(key)){
        cls[key] = static_properties[key];
      }
    }
    
    // set the class's prototype properties
    for (key in prototype_properties) {
      if(prototype_properties.hasOwnProperty(key)){
        cls.prototype[key] = prototype_properties[key];
      }
    }
    
    return cls;
    
  };
    
}(global));
/*global global*/

/**
* Function helper functions
*/
(function (context) {

  context.metaScore.Function = {

    /**
    * Checks if an object is a function
    * @param {function} the object
    * @returns {boolean} true if the object is a function, false otherwise
    */
    isFunction: function(fn) {  
      return Object.prototype.toString.call(fn) === '[object Function]';
    }
    
  };
  
}(global));
/*global global*/

/**
* String helper functions
*/
(function (context) {

  context.metaScore.String = {

    /**
    * Checks if an object is a string
    * @param {string} the object
    * @returns {boolean} true if the object is a string, false otherwise
    */
    isString: function(str) {  
      return Object.prototype.toString.call(str) === '[object String]';
    },

    /**
    * Capitalize the first letter of string
    * @param {string} the original string
    * @returns {string} the string with the first lettre capitalized
    */
    capitaliseFirstLetter: function(str){
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  };
  
}(global));
/*global global*/

/**
* Array helper functions
*/
(function (context) {

  context.metaScore.Array = {

    /**
    * Checks if an object is an array
    * @param {array} the object
    * @returns {boolean} true if the object is an array, false otherwise
    */
    isArray: function(arr) {  
      return Object.prototype.toString.call(arr) === '[object Array]';
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

      var shuffled = context.metaScore.Array.copy(arr);

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
    each: function(arr, fn, scope) {
    
      if(!scope){
        scope = context;
      }

      for(var i = 0, l = arr.length; i < l; i++) {
        fn.call(scope, arr[i]);
      }

    }
  };
  
}(global));
/*global global*/

/**
* Dom helper functions
*/
(function (context) {

  context.metaScore.Dom = context.metaScore.Class.extend(
  
  
  
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

        if (context.metaScore.String.isString(selector)) {
          els = parent.querySelectorAll(selector);
        }
        else if (selector.length) { 
          els = selector;
        }
        else {
          els = [selector];
        }

        return new context.metaScore.Dom(els);
      },

      /**
      * Creates an element
      * @param {string} the tag of the element to create
      * @param {attrs} an optional object of attributes to assign
      * @returns {object} a metaScore.Dom instance
      */         
      create: function (tag, attrs) {

        var dom = new context.metaScore.Dom([document.createElement(tag)]);
        
        if (attrs) {
          if (attrs.hasOwnProperty('class')) {
            dom.addClass(attrs['class']);
            delete attrs['class'];
          }
          if (attrs.hasOwnProperty('text')) {
            dom.text(attrs['text']);
            delete attrs['text'];
          }
          for (var key in attrs) {
            if (attrs.hasOwnProperty(key)) {
              dom.attr(key, attrs[key]);
            }
          }
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
        if (!context.metaScore.Array.isArray(children)) {
          children = [children];
        }
        
        context.metaScore.Array.each(children, function(child){
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
        context.metaScore.Array.each(this.els, function(el) {
          this.constructor.addClass(el, className);
        }, this);
        return this;        
      },      
      removeClass: function(className) {  
        context.metaScore.Array.each(this.els, function(el) {
          this.constructor.removeClass(el, className);
        }, this);        
        return this;        
      },
      toggleClass: function(className) {  
        context.metaScore.Array.each(this.els, function(el) {
          this.constructor.toggleClass(el, className);
        }, this);        
        return this;        
      },
      text: function(value) {  
        context.metaScore.Array.each(this.els, function(el) {
          this.constructor.text(el, value);
        }, this);        
        return this;        
      },
      attr: function(name, value) {  
        context.metaScore.Array.each(this.els, function(el) {
          this.constructor.attr(el, name, value);
        }, this);
        return this;
      },
      css: function(name, value) {  
        context.metaScore.Array.each(this.els, function(el) {
          this.constructor.css(el, name, value);
        }, this);
        return this;
      },
      append: function(children){
        this.constructor.append(this.get(0), children);
        return this;
      },
      appendTo: function(parent){
        if(parent instanceof context.metaScore.Dom){
          parent = parent.get(0);
        }
        
        context.metaScore.Array.each(this.els, function(el) {
          this.constructor.append(parent, el);
        }, this);
        return this;
      },
      remove: function(){
        context.metaScore.Array.each(this.els, function(el) {
          this.constructor.remove(el);
        }, this);
        return this;
      }
    }
  );
  
}(global));

} (this));