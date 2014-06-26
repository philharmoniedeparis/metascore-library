/**
 * Dom
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.array.js
 * @requires metaScore.object.js
 * @requires metaScore.var.js
 */
metaScore.Dom = metaScore.Base.extend(function(){
  this.constructor = function() {
  
    var elements;
  
    this.elements = [];
    
    if(arguments.length > 0){
      elements = metaScore.Dom.elementsFromString.apply(this, arguments) || metaScore.Dom.selectElements.apply(this, arguments);
      
      if(elements){
        for(var i = 0; i < elements.length; i++ ) {
          this.elements[i] = elements[i];
        }
    
        if(arguments.length > 1){
          this.attr(arguments[1]);
        }
      }
    }
  };
  
  this.get = function(index){
    return this.elements[index];
  };
  
  this.addClass = function(className) {  
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.addClass(element, className);
    }, this);
    return this;        
  };
  
  this.removeClass = function(className) {  
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.removeClass(element, className);
    }, this);        
    return this;        
  };
  
  this.toggleClass = function(className) {  
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.toggleClass(element, className);
    }, this);        
    return this;        
  };
  
  this.addListener = function(type, callback, useCapture) {  
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.addListener(element, type, callback, useCapture);
    }, this);        
    return this;        
  };
  
  this.removeListener = function(type, callback, useCapture) {  
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.removeListener(element, type, callback, useCapture);
    }, this);        
    return this;        
  };
  
  this.triggerEvent = function(type, bubbling, cancelable){
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.triggerEvent(element, type, bubbling, cancelable);
    }, this);
  };
  
  this.text = function(value) {  
    if(value !== undefined){
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.text(element, value);
      }, this);
    }
    else{
      return metaScore.Dom.text(this.get(0));
    }
  };
  
  this.val = function(value) {
    if(value !== undefined){
      metaScore.Array.each(this.elements, function(index, element) {
        metaScore.Dom.val(element, value);
      }, this);
    }
    else{
      return metaScore.Dom.val(this.get(0));
    }
  };
  
  this.attr = function(name, value) {
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.attr(element, name, value);
    }, this);
    
    return this;
  };
  
  this.css = function(name, value) {
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.css(element, name, value);
    }, this);
    return this;
  };
  
  this.append = function(children){
    if(children instanceof metaScore.Dom){
      children = children.elements;
    }
    
    metaScore.Dom.append(this.get(0), children);
    
    return this;
  };
  
  this.appendTo = function(parent){    
    if(!(parent instanceof metaScore.Dom)){
      parent = new metaScore.Dom(parent);
    }
    
    parent = parent.get(0);
    
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.append(parent, element);
    }, this);
    
    return this;
  };
  
  this.remove = function(){
    metaScore.Array.each(this.elements, function(index, element) {
      metaScore.Dom.remove(element);
    }, this);
    return this;
  };
  
  this.setDraggable = function(draggable){    
    if(draggable){
      this.addListener('mousedown', this.startDrag);
    }
    else{
      this.removeListener('mousedown', this.startDrag);
    }  
  };
  
  this.startDrag = function(evt){
    var style = window.getComputedStyle(evt.target, null);
      
    this.dragOffset = {
      'left': parseInt(style.getPropertyValue("left"), 10) - evt.clientX,
      'top': parseInt(style.getPropertyValue("top"), 10) - evt.clientY
    };
    
    this.dragParent = new metaScore.Dom('body')
      .addListener('mouseup', this.stopDrag)
      .addListener('mousemove', this.drag);
    
    this.addClass('dragging');
  };
  
  this.drag = function(evt){  
    var left = evt.clientX + parseInt(this.dragOffset.left, 10),
      top = evt.clientY + parseInt(this.dragOffset.top, 10);
    
    this.css('left', left + 'px');
    this.css('top', top + 'px');
  };
  
  this.stopDrag = function(evt){  
    this.dragParent.removeListener('mousemove', this.drag).removeListener('mouseup', this.stopDrag);
    
    delete this.dragOffset;
    delete this.dragParent;
    
    this.removeClass('dragging');  
  };
});


/********************
****** STATICS ******
********************/

/**
* Regular expression that matches an element's string
*/
metaScore.Dom.stringRe = /^<(.)+>$/;

/**
* Regular expression that matches dashed string for camelizing
*/
metaScore.Dom.camelRe = /-([\da-z])/gi;

/**
* Helper function used by the camel function
*/
metaScore.Dom.camelReplaceFn = function(all, letter) {
  return letter.toUpperCase();
};

/**
* Normaliz a string to Camel Case; used for CSS properties
* @param {string} the original string
* @returns {string} the normalized string
*/
metaScore.Dom.camel = function(str){
  return str.replace(this.camelRe, this.camelReplaceFn);
};

/**
* List of event that should generaly bubble up
*/
metaScore.Dom.bubbleEvents = {
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
* Select elements by selecor
* @param {string} the selector (you can exclude elements by using ":not()" such as "div.class1:not(.class2)")
* @param {object} an optional parent to constrain the matched elements 
* @returns {array} an array of HTML elements
*/
metaScore.Dom.selectElements = function (selector, parent) {      
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
};

/**
* Creates elements from an HTML string (see http://krasimirtsonev.com/blog/article/Revealing-the-magic-how-to-properly-convert-HTML-string-to-a-DOM-element)
* @param {string} the HTML string
* @returns {object} an HTML element
*/
metaScore.Dom.elementsFromString = function(html){
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
metaScore.Dom.hasClass = function(element, className){
  return element.classList.contains(className);
};

/**
* Adds a given class to an element
* @param {object} the dom element
* @param {string} the class(es) to add; separated by a space
* @returns {void}
*/
metaScore.Dom.addClass = function(element, className){
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
metaScore.Dom.removeClass = function(element, className){
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
* @returns {void}
*/
metaScore.Dom.toggleClass = function(element, className){
  var classNames = className.split(" "),
    i = 0, l = classNames.length;
  
  for(; i<l; i++){
    element.classList.toggle(classNames[i]);
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
metaScore.Dom.addListener = function(element, type, callback, useCapture){
  if(useCapture === undefined){
    useCapture = metaScore.Dom.bubbleEvents.hasOwnProperty('type') ? metaScore.Dom.bubbleEvents[type] : false;
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
metaScore.Dom.removeListener = function(element, type, callback, useCapture){
  if(useCapture === undefined){
    useCapture = metaScore.Dom.bubbleEvents.hasOwnProperty('type') ? metaScore.Dom.bubbleEvents[type] : false;
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
metaScore.Dom.triggerEvent = function(element, type, bubbling, cancelable){
  var event = document.createEvent("HTMLEvents");
  event.initEvent(type, bubbling, cancelable);
  
  return element.dispatchEvent(event);
};

/**
* Sets or gets the innerHTML of an element
* @param {object} the dom element
* @param {string} an optional text to set
* @returns {string} the value of the innerHTML
*/
metaScore.Dom.text = function(element, value){
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
metaScore.Dom.val = function(element, value){
  if(value !== undefined){
    element.value = value;
  }
  
  return element.value;
};

/**
* Sets or gets an attribute of an element
* @param {object} the dom element
* @param {string} the attribute's name
* @param {string} an optional value to set
* @returns {void}
*/
metaScore.Dom.attr = function(element, name, value){
  
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
};

/**
* Sets or gets a style property of an element
* @param {object} the dom element
* @param {string} the property's name
* @param {string} an optional value to set
* @returns {string} the value of the property
*/
metaScore.Dom.css = function(element, name, value){
  name = this.camel(name);

  if(value !== undefined){
    element.style[name] = value;
  }
  
  return element.style[name];
};

/**
* Appends children to an element
* @param {object} the dom element
* @param {object/array} the child(ren) to append
* @returns {void}
*/
metaScore.Dom.append = function(element, children){
  if (!metaScore.Var.is(children, 'array')) {
    children = [children];
  }
  
  metaScore.Array.each(children, function(index, child){
    element.appendChild(child);
  }, this);
};

/**
* Removes an element from the dom
* @param {object} the dom element
* @returns {void}
*/
metaScore.Dom.remove = function(element){
  element.parentElement.removeChild(element);
};