/*! metaScore - v0.0.1 - 2014-06-26 - Oussama Mubarak */
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

const DEBUG = true;
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
    
  };
});
/**
 * Player Block
 *
 * @requires metaScore.player.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Block = metaScore.Dom.extend(function(){
  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'block'});
    
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
});
/**
 * Player Page
 *
 * @requires metaScore.player.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Player.Page = metaScore.Dom.extend(function(){
  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'page'});
    
  };
});
/**
 * Editor
 *
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor = metaScore.Dom.extend(function(){

  this.constructor = function(selector) {
  
    this.super('<div/>', {'class': 'metaScore-editor'});
    
    if(selector !== undefined){
      this.appendTo(selector);
    }
    
    this.setupUI();
    
  };
  
  this.setupUI = function(){
  
    this.workspace = new metaScore.Dom('<div/>', {'class': 'workspace'})
      .appendTo(this);
  
    this.mainmenu = new metaScore.Editor.MainMenu()
      .appendTo(this);
  
    this.sidebar = new metaScore.Editor.Sidebar()
      .appendTo(this);
      
    this.player = new metaScore.Player()
      .appendTo(this.workspace);
  
    this.grid = new metaScore.Dom('<div/>', {'class': 'grid'})
      .appendTo(this.workspace);
    
  };
});
/**
 * Button
 *
 * @requires metaScore.editor.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.Button = metaScore.Dom.extend(function(){

  var label;
  
  /**
  * Keep track of the current state
  */
  this.disabled = false;
  
  this.defaults = {    
    /**
    * A text to add as a label
    */
    label: null
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    var btn = this;
    
    this.super('<button/>');
  
    this.initConfig(configs);
    
    if(this.configs.label){
      this.setLabel(this.configs.label);
    }
    
    this.addListener('click', function(evt){
      if(btn.disabled){
        evt.stopPropagation();
      }
    });
  };
  
  this.setLabel = function(text){
  
    if(label === undefined){
      label = new metaScore.Dom('<span/>', {'class': 'label'})
        .appendTo(this);
    }
    
    label.text(text);
    
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  this.disable = function(){
    this.disabled = true;
    
    this.addClass('disabled');
    
    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  this.enable = function(){
    this.disabled = false;
    
    this.removeClass('disabled');
    
    return this;
  };
});
/**
 * DropDownMenu
 *
 * @requires metaScore.editor.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.DropDownMenu = metaScore.Dom.extend(function(){

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super('<ul/>', {'class': 'dropdown-menu'});
  
    this.initConfig(configs);
  };
  
  this.addItem = function(text){
  
    var item = new metaScore.Dom('<li/>', {'text': text})
      .appendTo(this);    
  
    return item;
  
  };
});
/**
 * Field
 *
 * @requires metaScore.editor.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.Field = metaScore.Dom.extend(function(){
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
  };
  
  this.tag = '<input/>';
  
  this.attributes = {
    'type': 'text',
    'class': 'field'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super(this.tag, this.attributes);
  
    this.initConfig(configs);
    
    if(this.configs.value !== null){
      this.setValue(this.configs.value);
    }
    
    if(this.configs.disabled){
      this.disable();
    }
  };
  
  this.setValue = function(val){
  
    this.value = val;
    
    this.val(this.value);
  
  };

  /**
  * Disable the field
  * @returns {object} the XMLHttp object
  */
  this.disable = function(){
    this.disabled = true;
    
    this.addClass('disabled');
    this.attr('disabled', 'disabled');
    
    return this;
  };

  /**
  * Enable the field
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  this.enable = function(){
    this.disabled = false;
    
    this.removeClass('disabled');
    this.attr('disabled', null);
    
    return this;
  };
});
/**
 * TimeField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.TimeField = metaScore.Editor.Field.extend(function(){
  
  // private vars
  var hours, minutes, seconds, centiseconds;
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: 0,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    /**
    * Defines the minimum value allowed
    */
    min: 0,
    
    /**
    * Defines the maximum value allowed
    */
    max: null
  };
  
  this.tag = '<div/>';
  
  this.attributes = {
    'class': 'field timefield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'});
    minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'});
    seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'});
    centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'});
  
    this.super(configs);
    
    hours.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    minutes.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'}).appendTo(this);
    
    seconds.addListener('input', this.onInput).appendTo(this);
    
    new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'}).appendTo(this);
    
    centiseconds.addListener('input', this.onInput).appendTo(this);
    
  };
  
  this.onInput = function(evt){
  
    var centiseconds_val = parseInt(centiseconds.val(), 10),
      seconds_val = parseInt(seconds.val(), 10),
      minutes_val = parseInt(minutes.val(), 10),
      hours_val = parseInt(hours.val(), 10);
      
    evt.stopPropagation();
    
    this.setValue((centiseconds_val * 10) + (seconds_val * 1000) + (minutes_val * 60000) + (hours_val * 3600000));
  };
  
  this.setValue = function(milliseconds){
      
    var centiseconds_val, seconds_val, minutes_val, hours_val;
    
    this.value = milliseconds;
    
    if(this.configs.min !== null){
      this.value = Math.max(this.value, this.configs.min);
    }
    if(this.configs.max !== null){
      this.value = Math.min(this.value, this.configs.max);
    }
      
    centiseconds_val = parseInt((this.value / 10) % 100, 10);
    seconds_val = parseInt((this.value / 1000) % 60, 10);
    minutes_val = parseInt((this.value / 60000) % 60, 10);
    hours_val = parseInt((this.value / 3600000), 10);
    
    centiseconds.val(centiseconds_val);
    seconds.val(seconds_val);
    minutes.val(minutes_val);
    hours.val(hours_val);
    
    this.triggerEvent('change', true, false);
  
  };
  
  this.getValue = function(){
  
    return this.value;
  
  };

  /**
  * Disable the button
  * @returns {object} the XMLHttp object
  */
  this.disable = function(){
    this.disabled = true;
    
    hours.attr('disabled', 'disabled');
    minutes.attr('disabled', 'disabled');
    seconds.attr('disabled', 'disabled');
    centiseconds.attr('disabled', 'disabled');
    
    this.addClass('disabled');
    
    return this;
  };

  /**
  * Enable the button
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  this.enable = function(){
    this.disabled = false;
    
    hours.attr('disabled', null);
    minutes.attr('disabled', null);
    seconds.attr('disabled', null);
    centiseconds.attr('disabled', null);
    
    this.removeClass('disabled');
    
    return this;
  };
});
/**
 * String
 *
 * @requires ../metaScore.base.js
 */
metaScore.String = metaScore.Base.extend(function(){});

/**
* Capitalize a string
* @param {string} the original string
* @returns {string} the capitalized string
*/
metaScore.String.capitalize = function(str){
  return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

/**
* Translate a string
* @param {string} the original string
* @param {object} string replacements
* @returns {string} the translated string
*/
metaScore.String.t = function(str){
  return str;
};

/**
* Generate a random uuid (see http://www.broofa.com/2008/09/javascript-uuid-function/)
* @param {number} the desired number of characters
* @param {number} the number of allowable values for each character
* @returns {string} a random uuid
*/
metaScore.String.uuid = function (len, radix) {
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
 * MainMenu
 *
 * @requires metaScore.editor.js
 * @requires metaScore.editor.button.js
 * @requires field/metaScore.editor.field.timefield.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.string.js
 */
metaScore.Editor.MainMenu = metaScore.Dom.extend(function(){

  this.constructor = function() {
  
    this.super('<div/>', {'class': 'main-menu clearfix'});
    
    this.setupUI();
    
  };
  
  this.setupUI = function(){
  
    var left, right;
    
    this.buttons = {};
    
    left = new metaScore.Dom('<div/>', {'class': 'left'}).appendTo(this);
    right = new metaScore.Dom('<div/>', {'class': 'right'}).appendTo(this);
    
    this.buttons['new'] = new metaScore.Editor.Button()
      .attr({
        'class': 'new',
        'title': metaScore.String.t('New')
      })
      .appendTo(left);
    
    this.buttons['open'] = new metaScore.Editor.Button()
      .attr({
        'class': 'open',
        'title': metaScore.String.t('Open')
      })
      .appendTo(left);
    
    this.buttons['edit'] = new metaScore.Editor.Button()
      .attr({
        'class': 'edit',
        'title': metaScore.String.t('edit')
      })
      .disable()
      .appendTo(left);
    
    this.buttons['save'] = new metaScore.Editor.Button()
      .attr({
        'class': 'save',
        'title': metaScore.String.t('save')
      })
      .disable()
      .appendTo(left);
    
    this.buttons['download'] = new metaScore.Editor.Button()
      .attr({
        'class': 'download',
        'title': metaScore.String.t('download')
      })
      .disable()
      .appendTo(left);
    
    this.buttons['delete'] = new metaScore.Editor.Button()
      .attr({
        'class': 'delete',
        'title': metaScore.String.t('delete')
      })
      .disable()
      .appendTo(left);
    
    this.buttons['time'] = new metaScore.Editor.Field.TimeField()
      .attr({
        'class': 'time',
        'title': metaScore.String.t('time')
      })
      .appendTo(left);
    
    this.buttons['revert'] = new metaScore.Editor.Button()
      .attr({
        'class': 'revert',
        'title': metaScore.String.t('revert')
      })
      .appendTo(left);
    
    this.buttons['undo'] = new metaScore.Editor.Button()
      .attr({
        'class': 'undo',
        'title': metaScore.String.t('undo')
      })
      .appendTo(left);
    
    this.buttons['redo'] = new metaScore.Editor.Button()
      .attr({
        'class': 'redo',
        'title': metaScore.String.t('redo')
      })
      .disable()
      .appendTo(left);
      
    
    this.buttons['settings'] = new metaScore.Editor.Button()
      .attr({
        'class': 'settings',
        'title': metaScore.String.t('settings')
      })
      .appendTo(right);
    
    this.buttons['help'] = new metaScore.Editor.Button()
      .attr({
        'class': 'help',
        'title': metaScore.String.t('help')
      })
      .appendTo(right);
    
  };
});
/**
 * Overlay
 *
 * @requires metaScore.editor.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.Overlay = metaScore.Dom.extend(function(){
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    /**
    * The parent element in which the overlay will be appended
    */
    parent: '.metaScore-editor',
    
    /**
    * True to create a mask underneath that covers its parent and does not allow the user to interact with any other Components until this is dismissed
    */
    modal: true,
    
    /**
    * True to make this draggable
    */
    draggable: true
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super('<div/>', {'class': 'overlay clearfix'});
  
    this.initConfig(configs);
    
    if(this.configs.modal){
      this.mask = new metaScore.Dom('<div/>', {'class': 'overlay-mask'});
    }
    
    this.setDraggable(this.configs.draggable);
    
  };
  
  this.show = function(){
    
    if(this.configs.modal){
      this.mask.appendTo(this.configs.parent);
    }
  
    this.appendTo(this.configs.parent);
    
  };
  
  this.hide = function(){
    
    if(this.configs.modal){
      this.mask.remove();
    }
  
    this.remove();
    
  };
});
/**
 * Function
 *
 * @requires ../metaScore.base.js
 * @requires metaScore.var.js
 */
metaScore.Function = metaScore.Base.extend(function(){});

/**
* Checks if a variable is of a certain type
* @param {mixed} the variable
* @param {string} the type to check against
* @returns {boolean} true if the variable is of the specified type, false otherwise
*/
metaScore.Function.proxy = function(fn, scope) {
  
  if (!metaScore.Var.type(fn, 'function')) {
    return undefined;
  }
  
  return function () {
    return fn.apply(scope || this, arguments);
  };
};

/**
* A reusable empty function
*/
metaScore.Function.emptyFn = function(){};
/**
 * Panel
 *
 * @requires metaScore.editor.js
 * @requires ../helpers/metaScore.dom.js
 * @requires ../helpers/metaScore.object.js
 * @requires ../helpers/metaScore.string.js
 * @requires ../helpers/metaScore.function.js
 */
metaScore.Editor.Panel = metaScore.Dom.extend(function(){

  var toolbar;

  this.defaults = {
    /**
    * The panel's title
    */
    title: '',
    
    /**
    * The panel's fields
    */
    fields: {}
  };
  
  this.constructor = function(configs) {
  
    this.super('<div/>', {'class': 'panel'});
  
    this.initConfig(configs);
  
    toolbar = new metaScore.Editor.Toolbar({'title': this.configs.title})
      .appendTo(this);
      
    toolbar.getTitle()
      .addListener('click', metaScore.Function.proxy(this.toggleState, this));
    
    this.contents = new metaScore.Dom('<table/>', {'class': 'fields'})
      .appendTo(this);
      
    this.setupFields();
    
  };
  
  this.setupFields = function(){
  
    var row, field_uuid, field;
    
    this.fields = {};
  
    metaScore.Object.each(this.configs.fields, function(key, value){
      
      row = new metaScore.Dom('<tr/>', {'class': 'field-wrapper'}).appendTo(this.contents);
    
      field_uuid = 'field-'+ metaScore.String.uuid(5);
      
      this.fields[key] = field = new value.type().attr('id', field_uuid);
      
      new metaScore.Dom('<td/>').appendTo(row).append(new metaScore.Dom('<label/>', {'text': value.label, 'for': field_uuid}));
      new metaScore.Dom('<td/>').appendTo(row).append(field);
      
    }, this);
  
  };
  
  this.toggleState = function(){
    
    this.toggleClass('collapsed');
    
  };
  
  this.getToolbar = function(){
    
    return toolbar;
    
  };
});
/**
 * IntegerField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.IntegerField = metaScore.Editor.Field.extend(function(){
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: 0,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false,
    
    /**
    * Defines the minimum value allowed
    */
    min: null,
    
    /**
    * Defines the maximum value allowed
    */
    max: null
  };
  
  this.attributes = {
    'type': 'number',
    'class': 'field integerfield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    this.super(configs);
    
  };
});
/**
 * ColorField
 *
 * @requires ../metaScore.editor.field.js
 * @requires ../../helpers/metaScore.object.js
 */
metaScore.Editor.Field.ColorField = metaScore.Editor.Field.extend(function(){

  // private vars
  var button, overlay,
    previous_value;
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: {
      r: 255,
      g: 255,
      b: 255,
      a: 1
    },
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };
  
  this.tag = '<div/>';
  
  this.attributes = {
    'class': 'field colorfield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    button = new metaScore.Editor.Button()
      .addListener('click', this.onClick);
    
    overlay = new metaScore.Editor.Overlay()
      .addClass('colorfield-overlay');
    
    overlay.gradient = new metaScore.Dom('<div/>', {'class': 'gradient'}).appendTo(overlay);
    overlay.gradient.canvas = new metaScore.Dom('<canvas/>', {'width': '255', 'height': '255'})
      .addListener('click', this.onGradientClick)
      .addListener('mousedown', this.onGradientMousedown)
      .addListener('mouseup', this.onGradientMouseup)
      .appendTo(overlay.gradient);
    overlay.gradient.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(overlay.gradient);
        
    overlay.alpha = new metaScore.Dom('<div/>', {'class': 'alpha'}).appendTo(overlay);
    overlay.alpha.canvas = new metaScore.Dom('<canvas/>', {'width': '20', 'height': '255'})
      .addListener('click', this.onAlphaClick)
      .addListener('mousedown', this.onAlphaMousedown)
      .addListener('mouseup', this.onAlphaMouseup)
      .appendTo(overlay.alpha);
    overlay.alpha.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(overlay.alpha);
    
    overlay.controls = new metaScore.Dom('<div/>', {'class': 'controls'}).appendTo(overlay);
    
    overlay.controls.r = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'r'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'R', 'for': 'r'}))
      .append(overlay.controls.r)
      .appendTo(overlay.controls);
      
    overlay.controls.g = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'g'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'G', 'for': 'g'}))
      .append(overlay.controls.g)
      .appendTo(overlay.controls);
      
    overlay.controls.b = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'b'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'B', 'for': 'b'}))
      .append(overlay.controls.b)
      .appendTo(overlay.controls);
      
    overlay.controls.a = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '1', 'step': '0.01', 'name': 'a'})
      .addListener('input', this.onControlInput);
    new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
      .append(new metaScore.Dom('<label/>', {'text': 'A', 'for': 'a'}))
      .append(overlay.controls.a)
      .appendTo(overlay.controls);
      
    overlay.controls.current = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper current'})
      .append(overlay.controls.current)
      .appendTo(overlay.controls);
    
    overlay.controls.previous = new metaScore.Dom('<canvas/>');
    new metaScore.Dom('<div/>', {'class': 'canvas-wrapper previous'})
      .append(overlay.controls.previous)
      .appendTo(overlay.controls);
      
    overlay.controls.cancel = new metaScore.Editor.Button({'label': 'Cancel'})
      .addClass('cancel')
      .addListener('click', this.onCancelClick)
      .appendTo(overlay.controls);
      
    overlay.controls.apply = new metaScore.Editor.Button({'label': 'Apply'})
      .addClass('apply')
      .addListener('click', this.onApplyClick)
      .appendTo(overlay.controls);
          
    overlay.mask.addListener('click', this.onOverlayMaskClick);
    
    this.super(configs);
    
    new metaScore.Dom('<div/>', {'class': 'icon'})
      .appendTo(this);
    
    button.appendTo(this);
    
    this.fillGradient();
    
  };
  
  this.setValue = function(val, refillAlpha, updatePositions, updateInputs){
  
    var hsv;
  
    if(!this.hasOwnProperty('value')){
      this.value = {};
    }
  
    if(val.hasOwnProperty('r')){
      this.value.r = parseInt(val.r, 10);
    }
    if(val.hasOwnProperty('g')){
      this.value.g = parseInt(val.g, 10);
    }
    if(val.hasOwnProperty('b')){
      this.value.b = parseInt(val.b, 10);
    }
    if(val.hasOwnProperty('a')){
      this.value.a = parseFloat(val.a);
    }
    
    if(refillAlpha !== false){
      this.fillAlpha();
    }
    
    if(updateInputs !== false){
      overlay.controls.r.val(this.value.r);
      overlay.controls.g.val(this.value.g);
      overlay.controls.b.val(this.value.b);
      overlay.controls.a.val(this.value.a);
    }
    
    if(updatePositions !== false){
      hsv = this.rgb2hsv(this.value);
      
      overlay.gradient.position.css('left', ((1 - hsv.h) * 255) +'px');
      overlay.gradient.position.css('top', (hsv.s * (255 / 2)) + ((1 - (hsv.v/255)) * (255/2)) +'px');
      
      overlay.alpha.position.css('top', ((1 - this.value.a) * 255) +'px');
    }
    
    this.fillCurrent();
    
    button.css('background-color', 'rgba('+ this.value.r +','+ this.value.g +','+ this.value.b +','+ this.value.a +')');
  
  };
  
  this.onClick = function(evt){
  
    previous_value = metaScore.Object.copy(this.value);
    
    this.fillPrevious();
  
    overlay.show();
  
  };
  
  this.onControlInput = function(evt){
  
    var rgba, hsv;
    
    this.setValue({
      'r': overlay.controls.r.val(),
      'g': overlay.controls.g.val(),
      'b': overlay.controls.b.val(),
      'a': overlay.controls.a.val()
    }, true, true, false);
  
  };
  
  this.onCancelClick = function(evt){
  
    this.setValue(previous_value);
    overlay.hide();
  
    evt.preventDefault();
  };
  
  this.onApplyClick = function(evt){
  
    overlay.hide();
  
    evt.preventDefault();
  };
  
  this.onOverlayMaskClick = function(evt){
  
    overlay.hide();
  
    evt.preventDefault();
  };
  
  this.fillPrevious = function(){
  
    var context = overlay.controls.previous.get(0).getContext('2d');
    
    context.fillStyle = "rgba("+ previous_value.r +","+ previous_value.g +","+ previous_value.b +","+ previous_value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  
  };
  
  this.fillCurrent = function(){
  
    var context = overlay.controls.current.get(0).getContext('2d');
    
    context.fillStyle = "rgba("+ this.value.r +","+ this.value.g +","+ this.value.b +","+ this.value.a +")";
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  
  };
  
  this.fillGradient = function(){
  
    var context = overlay.gradient.canvas.get(0).getContext('2d'),
      fill;
      
    // Create color gradient
    fill = context.createLinearGradient(0, 0, context.canvas.width, 0);
    fill.addColorStop(0, "rgb(255, 0, 0)");
    fill.addColorStop(0.15, "rgb(255, 0, 255)");
    fill.addColorStop(0.33, "rgb(0, 0, 255)");
    fill.addColorStop(0.49, "rgb(0, 255, 255)");
    fill.addColorStop(0.67, "rgb(0, 255, 0)");
    fill.addColorStop(0.84, "rgb(255, 255, 0)");
    fill.addColorStop(1, "rgb(255, 0, 0)");
   
    // Apply gradient to canvas
    context.fillStyle = fill;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    
    // Create semi transparent gradient (white -> trans. -> black)
    fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
    fill.addColorStop(0, "rgba(255, 255, 255, 1)");
    fill.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    fill.addColorStop(0.5, "rgba(0, 0, 0, 0)");
    fill.addColorStop(1, "rgba(0, 0, 0, 1)");
   
    // Apply gradient to canvas
    context.fillStyle = fill;
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  
  };
  
  this.fillAlpha = function(){
  
    var context = overlay.alpha.canvas.get(0).getContext('2d'),
      fill;
      
    // Create color gradient
    fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
    fill.addColorStop(0, "rgb("+ this.value.r +","+ this.value.g +","+ this.value.b +")");
    fill.addColorStop(1, "transparent");
   
    // Apply gradient to canvas
    context.fillStyle = fill;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    
  };
  
  this.onGradientMousedown = function(evt){   
    overlay.gradient.canvas.addListener('mousemove', this.onGradientMousemove);
  };
  
  this.onGradientMouseup = function(evt){
    overlay.gradient.canvas.removeListener('mousemove', this.onGradientMousemove);
  };
  
  this.onGradientClick = this.onGradientMousemove = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorX = evt.pageX - offset.left,
      colorY = evt.pageY - offset.top,
      context = overlay.gradient.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(colorX, colorY, 1, 1),
      value = this.value;
      
    overlay.gradient.position.css('left', colorX +'px');
    overlay.gradient.position.css('top', colorY +'px');
    
    value.r = imageData.data[0];
    value.g = imageData.data[1];
    value.b =  imageData.data[2];
    
    this.setValue(value, true, false);
  };
  
  this.onAlphaMousedown = function(evt){   
    overlay.alpha.canvas.addListener('mousemove', this.onAlphaMousemove);
  };
  
  this.onAlphaMouseup = function(evt){
    overlay.alpha.canvas.removeListener('mousemove', this.onAlphaMousemove);
  };
  
  this.onAlphaClick = this.onAlphaMousemove = function(evt){
    var offset = evt.target.getBoundingClientRect(),
      colorY = evt.pageY - offset.top,
      context = overlay.alpha.canvas.get(0).getContext('2d'),
      imageData = context.getImageData(0, colorY, 1, 1),
      value = this.value;
      
    overlay.alpha.position.css('top', colorY +'px');
    
    value.a = Math.round(imageData.data[3] / 255 * 100) / 100;
    
    this.setValue(value, false, false);
  };
  
  this.rgb2hsv = function (rgb){
    
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
});
/**
 * ImageField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.ImageField = metaScore.Editor.Field.extend(function(){

  // private vars
  var file;
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };
  
  this.attributes = {
    'type': 'file',
    'class': 'field imagefield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    this.super(configs);

    this.addListener('change', this.onFileSelect, false);
    
  };
  
  this.setValue = function(val, triggerChange){
  
    this.value = val;
    
    if(triggerChange !== false){
      this.triggerEvent('change', false, true);
    }
  
  };
  
  this.onFileSelect = function(evt) {
  
    var files = evt.target.files;
  
    if(files.length > 0 && files[0].type.match('image.*')){
      file = files[0];
    }
    else{
      file = null;
    }
    
    /*this.getBase64(function(result){
      this.setValue(result);
    });*/
    
  };
  
  this.getBase64 = function(callback){
  
    var reader;
  
    if(file){
      reader = new FileReader();
      reader.onload = metaScore.Function.proxy(function(evt){
        callback.call(this, evt.target.result, evt);
      }, this);
      reader.readAsDataURL(file);
    }
  
  };
});
/**
 * BooleanField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.BooleanField = metaScore.Editor.Field.extend(function(){

  this.defaults = {
    /**
    * Defines the default value
    */
    value: true,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };
  
  this.attributes = {
    'type': 'checkbox',
    'class': 'field booleanfield'
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    this.super(configs);
    
  };
});
/**
 * Block
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.integerfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.booleanfield.js
 */
metaScore.Editor.Panel.Block = metaScore.Editor.Panel.extend(function(){

  var menu;

  this.defaults = {
    /**
    * The panel's title
    */
    title: 'Block',
    
    /**
    * The panel's fields
    */
    fields: {
      'x': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'X'
      },
      'y': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Y'
      },
      'width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Width'
      },
      'height': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Height'
      },
      'bg_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': 'Background color'
      },
      'bg_image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': 'Background image'
      },
      'synched': {
        'type': metaScore.Editor.Field.BooleanField,
        'label': 'Synchronized pages ?'
      }
    }
  };
  
  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
  
    this.super(configs);
    
    menu = new metaScore.Editor.DropDownMenu();
    menu.addItem('Add a new block');
    menu.addItem('Delete the active block');
    
    this.getToolbar().addButton()
      .addClass('menu')
      .append(menu);
    
  };
  
  
});
/**
 * Page
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.timefield.js
 */
metaScore.Editor.Panel.Page = metaScore.Editor.Panel.extend(function(){

  this.defaults = {
    /**
    * The panel's title
    */
    title: 'Page',
    
    /**
    * The panel's fields
    */
    fields: {
      'bg_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': 'Background color'
      },
      'bg_image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': 'Background image'
      },
      'start_time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': 'Start time'
      },
      'end_time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': 'End time'
      }
    }
  };
  
  
});
/**
 * CornerField
 *
 * @requires ../metaScore.editor.field.js
 */
metaScore.Editor.Field.CornerField = metaScore.Editor.Field.extend(function(){
  
  this.defaults = {
    /**
    * Defines the default value
    */
    value: null,
    
    /**
    * Defines whether the field is disabled by default
    */
    disabled: false
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {
    
    this.super(configs);
    
  };
});
/**
 * Element
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.integerfield.js
 * @requires ../field/metaScore.editor.field.colorfield.js
 * @requires ../field/metaScore.editor.field.imagefield.js
 * @requires ../field/metaScore.editor.field.cornerfield.js
 * @requires ../field/metaScore.editor.field.timefield.js
 */
metaScore.Editor.Panel.Element = metaScore.Editor.Panel.extend(function(){

  this.defaults = {
    /**
    * The panel's title
    */
    title: 'Element',
    
    /**
    * The panel's fields
    */
    fields: {
      'x': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'X'
      },
      'y': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Y'
      },
      'width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Width'
      },
      'height': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Height'
      },
      'r_index': {
        'type': metaScore.Editor.Field.IntegerField,
        'configs': {
          'min': 0
        },
        'label': 'Reading index'
      },
      'z_index': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Display index'
      },
      'bg_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': 'Background color'
      },
      'bg_image': {
        'type': metaScore.Editor.Field.ImageField,
        'label': 'Background image'
      },
      'border_width': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Border width'
      },
      'border_color': {
        'type': metaScore.Editor.Field.ColorField,
        'label': 'Border color'
      },
      'rounded_conrners': {
        'type': metaScore.Editor.Field.CornerField,
        'label': 'Rounded conrners'
      },
      'start_time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': 'Start time'
      },
      'end_time': {
        'type': metaScore.Editor.Field.TimeField,
        'label': 'End time'
      }
    }
  };
  
  
});
/**
 * Text
 *
 * @requires ../metaScore.editor.panel.js
 * @requires ../field/metaScore.editor.field.integerfield.js
 * @requires ../field/metaScore.editor.field.timefield.js
 */
metaScore.Editor.Panel.Text = metaScore.Editor.Panel.extend(function(){

  this.defaults = {
    /**
    * The panel's title
    */
    title: 'Text',
    
    /**
    * The panel's fields
    */
    fields: {
      'x': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'X'
      },
      'y': {
        'type': metaScore.Editor.Field.IntegerField,
        'label': 'Y'
      },
      'endtime': {
        'type': metaScore.Editor.Field.TimeField,
        'label': 'End time'
      }
    }
  };
  
  
});
/**
 * Sidebar
 *
 * @requires metaScore.editor.js
 * @requires panel/metaScore.editor.panel.block.js
 * @requires panel/metaScore.editor.panel.page.js
 * @requires panel/metaScore.editor.panel.element.js
 * @requires panel/metaScore.editor.panel.text.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.Sidebar = metaScore.Dom.extend(function(){

  this.constructor = function() {
  
    this.super('<div/>', {'class': 'sidebar'});
   
    this.addPanels();
   
  };
  
  this.addPanels = function(){
  
    new metaScore.Editor.Panel.Block()
      .appendTo(this);
  
    new metaScore.Editor.Panel.Page()
      .appendTo(this);
  
    new metaScore.Editor.Panel.Element()
      .appendTo(this);
  
    new metaScore.Editor.Panel.Text()
      .appendTo(this);
  
  };
});
/**
 * Toolbar
 *
 * @requires metaScore.editor.js
 * @requires ../helpers/metaScore.dom.js
 */
metaScore.Editor.Toolbar = metaScore.Dom.extend(function(){

  var title, buttons;
  
  this.defaults = {    
    /**
    * A text to add as a title
    */
    title: null
  };

  /**
  * Initialize
  * @param {object} a configuration object
  * @returns {void}
  */
  this.constructor = function(configs) {    
    this.super('<div/>', {'class': 'toolbar clearfix'});
  
    this.initConfig(configs);
    
    title = new metaScore.Dom('<div/>', {'class': 'title'})
      .appendTo(this);
    
    buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
      .appendTo(this);
      
    if(this.configs.title){
      title.text(this.configs.title);
    }
  };
  
  this.getTitle = function(){
  
    return title;
    
  };
  
  this.addButton = function(configs){
  
    return new metaScore.Editor.Button(configs)
      .appendTo(buttons);
  
  };
});

  global.metaScore = metaScore;

} (this));