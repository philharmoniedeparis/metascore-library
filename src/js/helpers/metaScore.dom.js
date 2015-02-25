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
    if(element.parentElement){
      element.parentElement.removeChild(element);
    }
  };

  /**
  * Checks if an element matches a selector
  * @param {object} the dom element
  * @param {string} the selector
  * @returns {boolean} true if the element matches the selector, false otherwise
  */
  Dom.is = function(el, selector){
    var document, win;
    
    if(el instanceof Element){
      return Element.prototype.matches.call(el, selector);
    }
      
    if(document = el.ownerDocument){
      if(win = document.defaultView || document.parentWindow){
        return (el instanceof win.Element) && Element.prototype.matches.call(el, selector);
      }
    }
    
    return false;
  };
  
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
    
    return false;
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

    this.each(function(index, element) {
      if(Dom.is(element, selector)){
        filtered.push(element);
      }
    }, this);

    this.elements = filtered;

    return this;
  };

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

  Dom.prototype.child = function(selector){
    var children = new Dom(),
     child;

    this.each(function(index, element) {
      if(child = Dom.selectElement.call(this, selector, element)){
        children.add(child);
        return false;
      }
    }, this);

    return children;
  };

  Dom.prototype.children = function(selector){
    var children = new Dom();

    this.each(function(index, element) {
      children.add(Dom.selectElements.call(this, selector, element));
    }, this);

    return children;
  };

  Dom.prototype.parents = function(selector){
    var parents = new Dom();

    this.each(function(index, element) {
      parents.add(element.parentElement);
    }, this);

    if(selector){
      parents.filter(selector);
    }

    return parents;
  };

  Dom.prototype.each = function(callback, scope){
    scope = scope || this;

    metaScore.Array.each(this.elements, callback, scope);
  };

  Dom.prototype.hasClass = function(className) {
    var found;

    this.each(function(index, element) {
      found = Dom.hasClass(element, className);
      return !found;
    }, this);

    return found;
  };

  Dom.prototype.addClass = function(className) {
    this.each(function(index, element) {
      Dom.addClass(element, className);
    }, this);

    return this;
  };

  Dom.prototype.removeClass = function(className) {
    this.each(function(index, element) {
      Dom.removeClass(element, className);
    }, this);

    return this;
  };

  Dom.prototype.toggleClass = function(className, force) {
    this.each(function(index, element) {
      Dom.toggleClass(element, className, force);
    }, this);

    return this;
  };

  Dom.prototype.addListener = function(type, callback, useCapture) {
   this.each(function(index, element) {
      Dom.addListener(element, type, callback, useCapture);
    }, this);

    return this;
  };

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

        element = element.parentNode;
      }

      if(match){
        callback.call(scope, evt, match);
      }
    }, useCapture);
  };

  Dom.prototype.removeListener = function(type, callback, useCapture) {
    this.each(function(index, element) {
      Dom.removeListener(element, type, callback, useCapture);
    }, this);

    return this;
  };

  Dom.prototype.triggerEvent = function(type, data, bubbles, cancelable){
    var return_value = true;

    this.each(function(index, element) {
      return_value = Dom.triggerEvent(element, type, data, bubbles, cancelable) && return_value;
    }, this);

    return return_value;
  };

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

    this.each(function(index, element) {
      Dom.append(parent, element);
    }, this);

    return this;
  };

  Dom.prototype.empty = function(){
    this.each(function(index, element) {
      Dom.empty(element);
    }, this);

    return this;
  };

  Dom.prototype.show = function(){
    this.css('display', '');

    return this;
  };

  Dom.prototype.hide = function(){
    this.css('display', 'none');

    return this;
  };

  Dom.prototype.focus = function(){
    this.get(0).focus();

    return this;
  };

  Dom.prototype.blur = function(){
    this.get(0).blur();

    return this;
  };

  Dom.prototype.remove = function(){
    if(this.triggerEvent('beforeremove') !== false){
      this.each(function(index, element) {
        var parent = element.parentElement;
        Dom.remove(element);
        Dom.triggerEvent(parent, 'childremoved', {'child': element});
      }, this);
    }

    return this;
  };

  Dom.prototype.is = function(selector){
    var found;

    this.each(function(index, element) {
      found = Dom.is(element, selector);
      return found;
    }, this);

    return found;
  };

  Dom.prototype.closest = function(selector){
    var found;

    this.each(function(index, element) {
      found = Dom.closest(element, selector);
      return found;
    }, this);

    return found;
  };

  return Dom;

})();