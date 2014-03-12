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