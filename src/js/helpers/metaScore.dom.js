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