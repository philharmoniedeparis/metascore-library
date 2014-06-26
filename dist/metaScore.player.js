/*! metaScore - v0.0.1 - 2014-06-27 - Oussama Mubarak */
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
* Core
*/
var metaScore = {
  version: "0.0.1"
};
/**
 * Base Class
 *
 * @requires metaScore.core.js
 */
(function(metaScore){  
	//Helper method for creating an super copied object clone
	function initialize(method){
		//Recursivly execute parent methods.
		if(method.parent instanceof Function){
			initialize.apply(this,[method.parent]);
      
			this.super = cloneCopy(this,
				superCopy(this,this.constructor)
			);
		}
		method.apply(this, arguments);
	}

	//Helper method which allows for super referances.
	function cloneCopy(from, to){
		for(var x in from){
			if(x !== "super" && from[x] instanceof Function){
				//Never create circular super referances.
				to[x] = from[x].super || superCopy(from, from[x]);
			}
		}
		return to;
	}

	function superCopy(scope, method){
		var scopeSuper = scope.super;
    
		return method.super = function(){
			scope.super = scopeSuper;
			return method.apply(scope, arguments);
		};
	}

	//Create Class object
	metaScore.Base = function(){};
	metaScore.Base.extend = function ext(to){
		function child(){
			//Prevent the prototype scope set executing the constructor.
			if(initialize !== arguments[0]){
				//Create inhereted object
				initialize.apply(this,[to]);
				//Setup scope for class instance method calls
				cloneCopy(this,this);
				if(this.initializer instanceof Function){
					this.initializer.apply(this);
        }
				this.constructor.apply(this,arguments);
			}
		}

		//Set prototype and constructor enabeling propper type checking.
		child.prototype = new this(initialize);
		child.prototype.constructor = child;

		//Return expected result from toString
		child.toString = function(){
			return to.toString();
		};

		//Allow the child to be extended.
		child.extend = function(target){
			//Create parent referance and inherentence path.
			target.parent = to;
			return ext.apply(child,arguments);
		};

		return child;
	};
  
	//Bootstrap Class by inheriting itself with empty constructor.
  metaScore.Base = metaScore.Base.extend(function() {
    this.constructor = function(){};
    
    this.initConfig = function(configs){
      configs = configs || {};
    
      if(this.defaults){
        this.configs = metaScore.Object.extend({}, this.defaults, configs);
      }
      else{
        this.configs = configs;
      }
    };
  });
    
})(metaScore);
/**
 * Array
 *
 * @requires ../metaScore.base.js
 */
metaScore.Array = metaScore.Base.extend(function(){});

/**
* Checks if a value is in an array
* @param {mixed} the value to check
* @param {array} the array
* @returns {number} the index of the value if found, -1 otherwise
*/
metaScore.Array.inArray = function (value, arr) {
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
metaScore.Array.copy = function (arr) {
  return [].concat(arr);
};

/**
* Shuffles elements in an array
* @param {array} the original array
* @returns {array} a copy of the array with it's elements shuffled
*/
metaScore.Array.shuffle = function(arr) {

  var shuffled = metaScore.Array.copy(arr);

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
metaScore.Array.unique = function(arr) {

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
* @returns {void}
*/
metaScore.Array.each = function(arr, callback, scope) {

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
 * Object
 *
 * @requires ../metaScore.base.js
 */
metaScore.Object = metaScore.Base.extend(function(){});

/**
* Merge the contents of two or more objects together into the first object.
* @returns {object} the target object extended with the properties of the other objects
*/
metaScore.Object.extend = function() {

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
metaScore.Object.copy = function(obj) {
    
  return metaScore.Object.extend({}, obj);

};

/**
* Call a function on each property of an object
* @param {object} the object
* @param {function} the function to call
* @param {object} the scope of the function
* @returns {void}
*/
metaScore.Object.each = function(obj, callback, scope) {

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
/**
 * Variable
 *
 * @requires ../metaScore.base.js
 */
metaScore.Var = metaScore.Base.extend(function(){});

/**
* Helper object used by the type function
*/
metaScore.Var.classes2types = {
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
* Get the type of a variable
* @param {mixed} the variable
* @returns {string} the type
*/
metaScore.Var.type = function(obj) {
  return obj == null ? String(obj) : metaScore.Var.classes2types[ Object.prototype.toString.call(obj) ] || "object";
};

/**
* Checks if a variable is of a certain type
* @param {mixed} the variable
* @param {string} the type to check against
* @returns {boolean} true if the variable is of the specified type, false otherwise
*/
metaScore.Var.is = function(obj, type) {
  return metaScore.Var.type(obj) === type.toLowerCase();
};
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
* Sets an attribute on an element
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
metaScore.Dom.css = function(element, name, value){
  name = this.camel(name);

  if(value !== undefined){
    element.style[name] = value;
  }
  
  return element.style.hasOwnProperty(name) ? element.style[name] : null;
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
/**
 * Player
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player = metaScore.Dom.extend(function(){
  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'metaScore-player'});
    
    if(selector !== undefined){
      this.appendTo(selector);
    }
    
    if(DEBUG){
      metaScore.Player.instance = this;
    }
    
  };
});
/**
 * Player Page
 *
 * @requires metaScore.player.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Pager = metaScore.Dom.extend(function(){

  var count, buttons;

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'pager'});
    
    count = new metaScore.Dom('<div/>', {'class': 'count'})
      .appendTo(this);
    
    buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);
      
    buttons.first = new metaScore.Dom('<div/>', {'class': 'first'})
      .appendTo(buttons);
      
    buttons.previous = new metaScore.Dom('<div/>', {'class': 'previous'})
      .appendTo(buttons);
      
    buttons.next = new metaScore.Dom('<div/>', {'class': 'next'})
      .appendTo(buttons);
    
  };
  
});
/**
 * Player Element
 *
 * @requires metaScore.player.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Element = metaScore.Dom.extend(function(){

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'element'});
    
  };
  
  this.setProperty = function(name, value){
  
    switch(name){
      case 'x':
        this.css('left', value +'px');
        break;
        
      case 'y':
        this.css('top', value +'px');
        break;
        
      case 'width':
        this.css('width', value +'px');
        break;
        
      case 'height':
        this.css('height', value +'px');
        break;
        
      case 'reading-index':
        this.attr('data-r-index', value);
        break;
        
      case 'z-index':
        this.css('z-index', value);
        break;
        
      case 'bg-color':
        this.css('background-color', value);
        break;
        
      case 'bg-image':
        this.css('background-image', 'url('+ value +')');
        break;
        
      case 'border-width':
        this.css('border-width', value +'px');
        break;
        
      case 'border-color':
        this.css('border-color', value);
        break;
        
      case 'start':
        this.attr('data-start', value);
        break;
        
      case 'end':
        this.attr('data-end', value);
        break;
    }
  
  };
});
/**
 * Player Page
 *
 * @requires metaScore.player.js
 * @requires metaScore.player.element.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Page = metaScore.Dom.extend(function(){
  
  var elements = [];

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'page'});
    
  };
  
  this.addElement = function(configs){
  
    var element = new metaScore.Player.Element(configs)
      .appendTo(this);
  
    elements.push(element);
    
    return element;
  
  };
  
  this.setProperty = function(name, value){
  
    switch(name){        
      case 'bg-color':
        this.css('background-color', value);
        break;
        
      case 'bg-image':
        this.css('background-image', 'url('+ value +')');
        break;
        
      case 'start':
        this.attr('data-start', value);
        break;
        
      case 'end':
        this.attr('data-end', value);
        break;
    }
  
  };
});
/**
 * Player Block
 *
 * @requires metaScore.player.js
 * @requires metaScore.player.pager.js
 * @requires metaScore.player.page.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Block = metaScore.Dom.extend(function(){
  
  var pager,
    pages = [];

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'block'});
    
    pager = new metaScore.Player.Pager()
      .appendTo(this);
    
  };
  
  this.addPage = function(configs){
  
    var page = new metaScore.Player.Page(configs)
      .appendTo(this);
  
    pages.push(page);
    
    return page;
  
  };
  
  this.setProperty = function(name, value){
  
    switch(name){
      case 'x':
        this.css('left', value +'px');
        break;
        
      case 'y':
        this.css('top', value +'px');
        break;
        
      case 'width':
        this.css('width', value +'px');
        break;
        
      case 'height':
        this.css('height', value +'px');
        break;
        
      case 'bg-color':
        this.css('background-color', value);
        break;
        
      case 'bg-image':
        this.css('background-image', 'url('+ value +')');
        break;
        
      case 'synched':
        this.attr('data-synched', value);
        break;
    }
  
  };
});

  global.metaScore = metaScore;

} (this));