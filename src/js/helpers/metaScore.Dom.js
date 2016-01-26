/**
 * @module Core
 */

metaScore.Dom = (function () {

    /**
     * Fired before an element is removed
     *
     * @event beforeremove
     */
    var EVT_BEFOREREMOVE = 'beforeremove';

    /**
     * Fired when a child element is removed
     *
     * @event childremove
     * @param {Object} child The removed child
     */
    var EVT_CHILDREMOVE = 'childremove';

    /**
     * A class for Dom manipulation
     * 
     * @class Dom
     * @extends Class
     * @constructor
     * @param {Mixed} [...args] An HTML string and an optional list of attributes to apply, or a CSS selector with an optional parent and an optional list of attributes to apply
     * 
     * @example
     *     var div = new metaScore.Dom('<div/>', {'class': 'my-class'});
     *     var body = new metaScore.Dom('body');
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
     * Regular expression that matches dashed string for camelizing
     *
     * @property camelRe
     * @private
     */
    Dom.camelRe = /-([\da-z])/gi;

    /**
     * List of common events that should generaly bubble up
     * 
     * @property bubbleEvents
     * @static
     * @private
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
     * Helper function used by the camel function
     * 
     * @method camelReplaceFn
     * @static
     * @private
     * @param {The matched substring} match
     * @param {The submatched letter} letter
     * @return {String} The uppercased letter
     */
    Dom.camelReplaceFn = function(match, letter) {
        return letter.toUpperCase();
    };

    /**
     * Normalize a string to Camel Case
     * 
     * @method camel
     * @static
     * @private
     * @param {String} str The string to normalize
     * @return {String} The normalized string
     */
    Dom.camel = function(str){
        return str.replace(Dom.camelRe, Dom.camelReplaceFn);
    };

    /**
     * Select a single element by CSS selecor and optional parent
     * 
     * @method selectElement
     * @static
     * @param {String} The CSS selector
     * @param {HTMLElement} [parent=document] The HTML Element in which to search
     * @return {HTMLElement} The found element if any
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
     * Select multiple elements by CSS selecor and optional parent
     * 
     * @method selectElements
     * @static
     * @param {String} The CSS selector
     * @param {HTMLElement} [parent=document] The HTML Element in which to search
     * @return {Mixed} An HTML NodeList or an array of found elements if any
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
     * 
     * @method elementsFromString
     * @static
     * @param {String} html The HTML string
     * @return {HTML NodeList} A NodeList of the created elements, or null on error
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
     * 
     * @method getElementWindow
     * @static
     * @param {HTMLElement} element The element
     * @return {HTML Window} The window
     */
    Dom.getElementWindow = function(element){
        var doc = element.ownerDocument;

        return doc.defaultView || doc.parentWindow;
    };

    /**
     * Check if an element has a given CSS lass
     * 
     * @method hasClass
     * @static
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     * @return {Boolean} Whether the element has the specified CSS class
     */
    Dom.hasClass = function(element, className){
        return element.classList.contains(className);
    };

    /**
     * Add a CSS class to an element
     * 
     * @method addClass
     * @static
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     */
    Dom.addClass = function(element, className){
        var classNames = className.split(" "),
            i = 0, l = classNames.length;

        for(; i<l; i++){
            element.classList.add(classNames[i]);
        }
    };

    /**
     * Remove a CSS class from an element
     * 
     * @method removeClass
     * @static
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     */
    Dom.removeClass = function(element, className){
        var classNames = className.split(" "),
            i = 0, l = classNames.length;

        for(; i<l; i++){
            element.classList.remove(classNames[i]);
        }
    };

    /**
     * Toggle a CSS class on an element
     * 
     * @method toggleClass
     * @static
     * @param {HTMLElement} element The element
     * @param {String} className The CSS class
     * @param {Boolean} [force] Whether to add or remove the class. The class is toggled if not specified
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
     * 
     * @method addListener
     * @static
     * @param {HTMLElement} element The element
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @return {HTMLElement} The element
     */
    Dom.addListener = function(element, type, callback, useCapture){
        if(useCapture === undefined){
            useCapture = ('type' in Dom.bubbleEvents) ? Dom.bubbleEvents[type] : false;
        }

        element.addEventListener(type, callback, useCapture);

        return element;
    };

    /**
     * Remove an event listener from an element
     * 
     * @method removeListener
     * @static
     * @param {HTMLElement} element The element
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @return {HTMLElement} The element
     */
    Dom.removeListener = function(element, type, callback, useCapture){
        if(useCapture === undefined){
            useCapture = ('type' in Dom.bubbleEvents) ? Dom.bubbleEvents[type] : false;
        }

        element.removeEventListener(type, callback, useCapture);

        return element;
    };

    /**
     * Trigger an event from an element
     * 
     * @method triggerEvent
     * @static
     * @param {HTMLElement} element The element
     * @param {String} type The event type
     * @param {Object} [data] Custom data to send with the event. The data is accessible through the event.detail property
     * @param {Boolean} [bubbles=true] Whether the event bubbles up through the DOM or not
     * @param {Boolean} [cancelable=true] Whether the event is cancelable
     * @return {Boolean} Whether the event was not cancelled
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
     * Set or get the innerHTML of an element
     * 
     * @method text
     * @static
     * @param {HTMLElement} element The element
     * @param {String} [html] The value to set
     * @return {String} The innerHTML of the element
     */
    Dom.text = function(element, html){
        if(html !== undefined){
            element.innerHTML = html;
        }

        return element.innerHTML;
    };

    /**
     * Set or get the value of an element
     * 
     * @method val
     * @static
     * @param {HTMLElement} element The element
     * @param {String} [value] The value to set
     * @return {String} The value of the element
     */
    Dom.val = function(element, value){
        if(value !== undefined){
            element.value = value;
        }

        return element.value;
    };

    /**
     * Set or get an attribute on an element
     * 
     * @method attr
     * @static
     * @param {HTMLElement} element The element
     * @param {Mixed} name The attribute's name, or a list of name/value pairs
     * @param {Mixed} [value] The attribute's value
     * @return {Mixed} The attribute's value, nothing is returned for 'special' attributes such as "class" or "text"
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
     * Set or get a CSS style property of an element
     * 
     * @method css
     * @static
     * @param {HTMLElement} element The element
     * @param {String} name The CSS property's name
     * @param {String} value The CSS property's value
     * @param {Boolean} [inline=false] Whether to return the inline or computed style value
     * @return {String} The CSS style value of the property
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
     * Set or get a custom data attribute of an element
     * 
     * @method data
     * @static
     * @param {HTMLElement} element The element
     * @param {String} name The name of the data attribute
     * @param {String} value The value of the data attribute
     * @return {String} The value of the data attribute
     */
    Dom.data = function(element, name, value){
        name = this.camel(name);

        if(value === null){
            if(element.dataset[name]){
                delete element.dataset[name];
            }
        }
        else if(value !== undefined){
            element.dataset[name] = value;
        }

        return element.dataset[name];
    };

    /**
     * Append children to an element
     * 
     * @method append
     * @static
     * @param {HTMLElement} element The element
     * @param {Mixed} children An array of elemets or a single element to append
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
     * Insert siblings before an element
     * 
     * @method before
     * @static
     * @param {HTMLElement} element The element
     * @param {Mixed} siblings An array of elemets or a single element to insert
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
     * Insert siblings after an element
     * @method after
     * @static
     * @param {HTMLElement} element The element
     * @param {Mixed} siblings An array of elemets or a single element to insert
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
     * Remove all element children
     * 
     * @method empty
     * @static
     * @param {HTMLElement} element The element
     */
    Dom.empty = function(element){
        while(element.firstChild){
            element.removeChild(element.firstChild);
        }
    };

    /**
     * Remove an element from the DOM
     * 
     * @method remove
     * @static
     * @param {HTMLElement} element The element
     */
    Dom.remove = function(element){
        if(element.parentElement){
            element.parentElement.removeChild(element);
        }
    };

    /**
     * Check if an element matches a CSS selector
     * 
     * @method is
     * @static
     * @param {HTMLElement} element The element
     * @param {String} selector The CSS selector
     * @return {Boolean} Whether the element matches the CSS selector
     */
    Dom.is = function(element, selector){
        var win;

        if(element instanceof Element){
            return Element.prototype.matches.call(element, selector);
        }

        win = Dom.getElementWindow(element);

        return (element instanceof win.Element) && Element.prototype.matches.call(element, selector);
    };

    /**
     * Get the closest ancestor of an element which matches a given CSS selector
     * 
     * @method closest
     * @static
     * @param {HTMLElement} element The element
     * @param {String} selector The CSS selector
     * @return {Element} The matched element
     */
    Dom.closest = function(element, selector){
        var document, win;

        if(element instanceof Element){
            return Element.prototype.closest.call(element, selector);
        }

        if(document = element.ownerDocument){
            if(win = document.defaultView || document.parentWindow){
                if(element instanceof win.Element){
                    return Element.prototype.closest.call(element, selector);
                }
            }
        }

        return null;
    };

    /**
     * Add an element to the set of elements managed by the Dom object
     * 
     * @method add
     * @private
     * @param {Mixed} elements An array of elements or a single element to add
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
     * Get the number of elements managed by the Dom object
     * 
     * @method count
     * @return {Integer} The number of elements
     */
    Dom.prototype.count = function(){
        return this.elements.length;
    };

    /**
     * Get an element by index from the set of elements managed by the Dom object
     * 
     * @method get
     * @param {Integer} index The index of the elements to retreive
     * @return {Element} The element
     */
    Dom.prototype.get = function(index){
        return this.elements[index];
    };

    /**
     * Return a new Dom object with the elements filtered by a CSS selector
     * 
     * @method filter
     * @param {String} selector The CSS selector
     * @return {Dom} The new Dom object
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
     * Get the index of the first element that matched the given CSS selector
     * 
     * @method index
     * @param {String} selector The CSS selector
     * @return {Integer} The index of the first matched element, or -1 if none
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
     * Find all descendents that match a given CSS selector
     * 
     * @method find
     * @param {String} selector The CSS selector
     * @return {Dom} A Dom object of all matched descendents
     */
    Dom.prototype.find = function(selector){
        var descendents = new Dom();

        this.each(function(index, element) {
            descendents.add(Dom.selectElements.call(this, selector, element));
        }, this);

        return descendents;
    };

    /**
     * Get all children, optionally filtered by a given CSS selector
     * 
     * @method children
     * @param {String} [selector] The CSS selector
     * @return {Dom} A Dom object of all matched children
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
     * Get the first child , optionally filtered by a given CSS selector
     * 
     * @method child
     * @param {String} [selector] The CSS selector
     * @return {Dom} A Dom object of the matched child
     */
    Dom.prototype.child = function(selector){
        return new Dom(this.children(selector).get(0));
    };

    /**
     * Get all parents, optionally filtered by a given CSS selector
     * 
     * @method parents
     * @param {String} [selector] The CSS selector
     * @return {Dom} A Dom object of all matched parents
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
     * Interate over all the elements managed by the Dom object
     * 
     * @method each
     * @param {Function} callback The function that will be executed on every element. The iteration is stopped if the callback return false
     * @param {Integer} callback.index The index of the current element being processed
     * @param {Element} callback.element The element that is currently being processed
     * @param {Mixed} scope The value to use as this when executing the callback function
     */
    Dom.prototype.each = function(callback, scope){
        scope = scope || this;

        metaScore.Array.each(this.elements, callback, scope);
    };

    /**
     * Check if an element in the set of elements managed by the Dom object has a given CSS class
     * 
     * @method hasClass
     * @param {String} className The CSS class
     * @return {Boolean} Whether a match was found
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
     * Add a CSS class to all the elements managed by the Dom object
     * 
     * @method addClass
     * @param {String} className The CSS class
     * @chainable
     */
    Dom.prototype.addClass = function(className) {
        this.each(function(index, element) {
            Dom.addClass(element, className);
        }, this);

        return this;
    };

    /**
     * Remove a CSS class from all the elements managed by the Dom object
     * 
     * @method removeClass
     * @param {String} className The CSS class
     * @chainable
     */
    Dom.prototype.removeClass = function(className) {
        this.each(function(index, element) {
            Dom.removeClass(element, className);
        }, this);

        return this;
    };

    /**
     * Toggle a CSS class for all the elements managed by the Dom object
     * 
     * @method toggleClass
     * @param {String} className The CSS class
     * @param {Boolean} [force] Whether to add or remove the class. The class is toggled if not specified
     * @chainable
     */
    Dom.prototype.toggleClass = function(className, force) {
        this.each(function(index, element) {
            Dom.toggleClass(element, className, force);
        }, this);

        return this;
    };

    /**
     * Add an event listener on all the elements managed by the Dom object
     * 
     * @method addListener
     * @static
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @chainable
     */
    Dom.prototype.addListener = function(type, callback, useCapture) {
     this.each(function(index, element) {
            Dom.addListener(element, type, callback, useCapture);
        }, this);

        return this;
    };

    /**
     * Add an event listener for descendents all the elements managed by the Dom object that match a given selector
     * 
     * @method addDelegate
     * @param {String} selector The CSS selector to filter descendents by
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The original event
     * @param {Element} callback.match The first matched descendent
     * @param {Mixed} [scope] The value to use as this when executing the callback function
     * @param {Boolean} [useCapture] Whether the event should be executed in the capturing or in the bubbling phase
     * @chainable
     */
    Dom.prototype.addDelegate = function(selector, type, callback, scope, useCapture) {
        scope = scope || this;

        this.addListener(type, function(evt){
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

        return this;
    };

    /**
     * Remove an event listener from all the elements managed by the Dom object
     * 
     * @method removeListener
     * @static
     * @param {String} type The event type
     * @param {Function} callback The callback function to call when the event is captured
     * @param {Event} callback.event The event
     * @param {Boolean} useCapture Whether the event should be executed in the capturing or in the bubbling phase
     * @chainable
     */
    Dom.prototype.removeListener = function(type, callback, useCapture) {
        this.each(function(index, element) {
            Dom.removeListener(element, type, callback, useCapture);
        }, this);

        return this;
    };

    /**
     * Trigger an event from all the elements managed by the Dom object
     * 
     * @method triggerEvent
     * @param {String} type The event type
     * @param {Object} [data] Custom data to send with the event. The data is accessible through the event.detail property
     * @param {Boolean} [bubbles=true] Whether the event bubbles up through the DOM or not
     * @param {Boolean} [cancelable=true] Whether the event is cancelable
     * @return {Boolean} Whether no event was cancelled
     */
    Dom.prototype.triggerEvent = function(type, data, bubbles, cancelable){
        var return_value = true;

        this.each(function(index, element) {
            return_value = Dom.triggerEvent(element, type, data, bubbles, cancelable) && return_value;
        }, this);

        return return_value;
    };

    /**
     * Set the innerHTML of all the elements managed by the Dom object, or get the innerHTML of the first element
     * 
     * @method text
     * @param {String} [html] The value to set
     * @return {Mixed} The Dom object if used as a setter, the innerHTML of the first element if used as a getter
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
     * Set the value of all the elements managed by the Dom object, or get the value of the first element
     * 
     * @method val
     * @param {String} [value] The value to set
     * @return {Mixed} The Dom object if used as a setter, the value of the first element if used as a getter
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
     * Set an attribute of all the elements managed by the Dom object, or get the value of an attribute of the first element
     * 
     * @method val
     * @param {HTMLElement} element The element
     * @param {String} [value] The value to set
     * @return {Mixed} The Dom object if used as a setter, the value of the first element if used as a getter
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
     * Set CSS style property of all the elements managed by the Dom object, or get the value of a CSS style property of the first element
     * 
     * @method css
     * @param {String} name The CSS property's name
     * @param {String} value The CSS property's value
     * @param {Boolean} [inline=false] Whether to return the inline or computed style value
     * @return {Mixed} The Dom object if used as a setter, the CSS style value of the property of the first element if used as a getter
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
     * Set a custom data attribute on all the elements managed by the Dom object, or get the value of a custom data attribute of the first element
     * 
     * @method data
     * @param {String} name The name of the data attribute
     * @param {String} value The value of the data attribute
     * @return {Mixed} The Dom object if used as a setter, the value of the data attribute of the first element if used as a getter
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
     * Append children to the first element managed by the Dom object
     * 
     * @method append
     * @param {Mixed} children An array of elemets or a single element to append
     * @chainable
     */
    Dom.prototype.append = function(children){
        if(children instanceof Dom){
            children = children.elements;
        }

        Dom.append(this.get(0), children);

        return this;
    };

    /**
     * Append each of the elements managed by the Dom object into a given element
     * 
     * @method appendTo
     * @param {Mixed} parent A Dom object or an Element to append the elements to
     * @chainable
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
     * Append each of the elements managed by the Dom object into a given element at a given position
     * 
     * @method insertAt
     * @param {Mixed} parent A Dom object or an Element to append the elements to
     * @param {Integer} index The index position to append at
     * @chainable
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
     * Remove all children of each element managed by the Dom object 
     * 
     * @method empty
     * @chainable
     */
    Dom.prototype.empty = function(){
        this.each(function(index, element) {
            Dom.empty(element);
        }, this);

        return this;
    };

    /**
     * Make all the elements managed by the Dom object visible
     * 
     * @method show
     * @chainable
     */
    Dom.prototype.show = function(){
        this.css('display', '');

        return this;
    };

    /**
     * Make all the elements managed by the Dom object invisible
     * 
     * @method hide
     * @chainable
     */
    Dom.prototype.hide = function(){
        this.css('display', 'none');

        return this;
    };

    /**
     * Set focus on the first element managed by the Dom object
     * 
     * @method focus
     * @chainable
     */
    Dom.prototype.focus = function(){
        this.get(0).focus();

        return this;
    };

    /**
     * Remove focus from the first element managed by the Dom object
     * 
     * @method blur
     * @chainable
     */
    Dom.prototype.blur = function(){
        this.get(0).blur();

        return this;
    };

    /**
     * Remove all the elements managed by the Dom object from the DOM
     * 
     * @method remove
     * @chainable
     */
    Dom.prototype.remove = function(){
        if(this.triggerEvent(EVT_BEFOREREMOVE) !== false){
            this.each(function(index, element) {
                var parent = element.parentElement;
                Dom.remove(element);
                Dom.triggerEvent(parent, EVT_CHILDREMOVE, {'child': element});
            }, this);
        }

        return this;
    };

    /**
     * Check if an element from the elements managed by the Dom object matches a CSS selector
     * 
     * @method is
     * @param {String} selector The CSS selector
     * @return {Boolean} Whether an element matches the CSS selector
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
     * Get the first closest ancestor of the elements managed by the Dom object which matches a given CSS selector
     * 
     * @method closest
     * @param {String} selector The CSS selector
     * @return {Element} The matched element
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