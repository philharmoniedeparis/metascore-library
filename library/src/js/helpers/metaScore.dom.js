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
      * Trigger an event from an element
      * @param {object} the dom element
      * @param {string} the event type to trigger
      * @param {boolean} whether the event should bubble
      * @param {boolean} whether the event is cancelable
      * @returns {boolean} false if at least one of the event handlers which handled this event called Event.preventDefault()
      */
      triggerEvent: function(element, type, bubbling, cancelable){
        var event = document.createEvent("HTMLEvents");
        event.initEvent(type, bubbling, cancelable);
        
        return element.dispatchEvent(event);
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
      * Sets or gets the value of an element
      * @param {object} the dom element
      * @param {string} an optional value to set
      * @returns {string} the value
      */
      val: function(element, value){
        if(value !== undefined){
          element.value = value;
        }
        
        return element.value;
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
    triggerEvent: function(type, bubbling, cancelable){
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.triggerEvent(element, type, bubbling, cancelable);
      }, this);
    },
    text: function(value) {  
      if(value !== undefined){
        metaScore.Array.each(this.elements, function(index, element) {
          metaScore.Dom.text(element, value);
        }, this);
      }
      else{
        return metaScore.Dom.text(this.get(0));
      }
    },
    val: function(value) {
      if(value !== undefined){
        metaScore.Array.each(this.elements, function(index, element) {
          metaScore.Dom.val(element, value);
        }, this);
      }
      else{
        return metaScore.Dom.val(this.get(0));
      }
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