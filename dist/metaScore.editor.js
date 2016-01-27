/*! metaScore - v0.0.2 - 2016-01-27 - Oussama Mubarak */
;(function (global) {
"use strict";


/**
 * Polyfills
 */

// Element.matches
if(Element && !Element.prototype.matches){
    Element.prototype.matches = Element.prototype.matchesSelector =
        Element.prototype.matchesSelector ||
        Element.prototype.webkitMatchesSelector ||
        Element.prototype.mozMatchesSelector ||
        Element.prototype.msMatchesSelector ||
        Element.prototype.oMatchesSelector ||
        function (selector) {
            var element = this,
                matches = (element.document || element.ownerDocument).querySelectorAll(selector),
                i = 0;

            while (matches[i] && matches[i] !== element) {
                i++;
            }

            return matches[i] ? true : false;
        };
}

// Element.closest
if(Element && !Element.prototype.closest){
    /**
     * Description
     *
     * @method closest
     * @param {} selector
     * @return Literal
     */
    Element.prototype.closest = function closest(selector) {
        var node = this;

        while(node){
            if(node.matches(selector)){
                return node;
            }
            else{
                node = node.parentElement;
            }
        }

        return null;
    };
}

// CustomEvent constructor
// https://github.com/krambuhl/custom-event-polyfill/blob/master/custom-event-polyfill.js
if (!window.CustomEvent || typeof window.CustomEvent !== 'function') {
    /**
     * Description
     *
     * @method CustomEvent
     * @param {} event
     * @param {} params
     * @return evt
     */
    window.CustomEvent = function(event, params) {
        var evt;

        params = params || {
            bubbles: false,
            cancelable: false,
            detail: undefined
        };

        evt = document.createEvent("CustomEvent");
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);

        return evt;
    };

    window.CustomEvent.prototype = window.Event.prototype;
}


// requestAnimationFrame
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
// requestAnimationFrame polyfill by Erik Möller. fixes from Paul Irish and Tino Zijdel
// MIT license
(function() {
    var lastTime = 0,
        vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame){
        /**
         * Description
         *
         * @method requestAnimationFrame
         * @param {} callback
         * @param {} element
         * @return id
         */
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }

    if (!window.cancelAnimationFrame){
        /**
         * Description
         *
         * @method cancelAnimationFrame
         * @param {} id
         * @return
         */
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());
/**
 * The Core module defines shared classes used in other modules
 *
 * @module Core
 * @main
 */
 
 /**
 * The core global object to which all internal classes are attached<br/>
 *
 * @class metaScore
 * @static
 */
var metaScore = {

    /**
     * Returns the current version identifier
     *
     * @method getVersion
     * @static
     * @return {String} The version identifier
     */
    getVersion: function(){
        return "0.0.2";
    },

    /**
     * Returns the current revision identifier
     *
     * @method getRevision
     * @static
     * @return {String} The revision identifier
     */
    getRevision: function(){
        return "372fbc";
    },

    /**
     * Returns a sub-namespace, creating it if it doesn't already exist
     *
     * @method namespace
     * @static
     * @param {String} The sub-namespace to create
     * @return {Object} The sub-namespace
     */
    namespace: function(str){
        var parent = this,
            parts = str.split('.'),
            part;

        for(var i = 0, length = parts.length; i < length; i++) {
            part = parts[i];
            parent[part] = parent[part] || {};
            parent = parent[part];
        }

        return parent;
    }

};
/**
 * @module Core
 */

metaScore.Class = (function(){

    /**
     * The base class <br/>
     * Implements a class extension mechanism and defines shared methods
     *
     * @class Class
     * @constructor
     */
    function Class(){
    }

    /**
     * Default config values
     *
     * @property defaults
     * @type Object
     * @default {}
     */
    Class.defaults = {};

    /**
     * Extends a class using the current one
     *
     * @method extend
     * @param {Class} child The child class to extend
     */
    Class.extend = function(child){
        child.prototype = Object.create(this.prototype, {
            constructor: {
                value: child
            }
        });

        child.parent = this;
        child.extend = this.extend;

        if(!('defaults' in child)){
            child.defaults = {};
        }

        for(var prop in this.defaults){
            if(!(prop in child.defaults)){
                child.defaults[prop] = this.defaults[prop];
            }
        }
    };

    /**
     * Returns a configs object by overriding the defaults with custom ones
     *
     * @method getConfigs
     * @param {Object} configs The custom configs
     * @return {Object} The extended configs
     */
    Class.prototype.getConfigs = function(configs){
        configs = configs || {};

        for(var prop in this.constructor.defaults){
            if(!(prop in configs)){
                configs[prop] = this.constructor.defaults[prop];
            }
        }

        return configs;
    };

    return Class;

})();
/**
 * @module Core
 */

metaScore.Evented = (function(){

    /**
     * A base class for event handling
     *
     * @class Evented
     * @extends Class
     * @constructor
     */
    function Evented() {
        // call parent constructor
        Evented.parent.call(this);

        this.listeners = {};
    }

    metaScore.Class.extend(Evented);

    /**
     * Add an event listener
     *
     * @method addListener
     * @param {String} type The event type to listen to
     * @param {Function} listener The callback function to associate to this listener
     * @chainable
     */
    Evented.prototype.addListener = function(type, listener){
        if (typeof this.listeners[type] === "undefined"){
            this.listeners[type] = [];
        }

        this.listeners[type].push(listener);

        return this;
    };

    /**
     * Remove an event listener
     *
     * @method removeListener
     * @param {String} type The event type to stop listen to
     * @param {Function} listener The callback function associated to this listener
     * @chainable
     */
    Evented.prototype.removeListener = function(type, listener){
        if(this.listeners[type] instanceof Array){
            var listeners = this.listeners[type];
            for (var i=0, len=listeners.length; i < len; i++){
                if (listeners[i] === listener){
                    listeners.splice(i, 1);
                    break;
                }
            }
        }

        return this;
    };

    /**
     * Check if a listener is attached to a given event type
     *
     * @method hasListener
     * @param {String} type The event type
     * @return {Boolean} Whether a listener is attached
     */
    Evented.prototype.hasListener = function(type){
        if(this.listeners[type] instanceof Array){
            return this.listeners[type].length > 0;
        }

        return false;
    };

    /**
     * Trigger an event
     *
     * @method triggerEvent
     * @param {String} type The event type
     * @param {Mixed} data Data to attach to the event via the detail propoerty
     * @param {Boolean} bubbling Whether the event bubbles up through the DOM or not
     * @param {Boolean} cancelable Whether the event is cancelable or not
     * @chainable
     */
    Evented.prototype.triggerEvent = function(type, data, bubbling, cancelable){
        var listeners, event;

        if (this.listeners[type] instanceof Array){
            listeners = this.listeners[type];

            event = {
                'target': this,
                'type': type,
                'detail': data,
                'bubbles': bubbling !== false,
                'cancelable': cancelable !== false
            };

            metaScore.Object.each(listeners, function(index, listener){
                listener.call(this, event);
            }, this);
        }

        return this;
    };

    return Evented;

})();
/** 
 * @module Core
 */

metaScore.Ajax = (function () {

    /**
     * A class to handle AJAX requests
     *
     * @class Ajax
     * @constructor
     */
    function Ajax() {
    }

    /**
     * Send an XMLHttp request
     *
     * @method send
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request
     * @param {String} [options.method='GET'] The method used for the request (GET, POST, or PUT)
     * @param {Object} [options.headers={}] An object of additional header key/value pairs to send along with requests
     * @param {Boolean} [options.async=true] Whether the request is asynchronous or not
     * @param {Object} [options.data={}] Data to be send along with the request
     * @param {String} [options.dataType='json'] The type of data expected back from the server
     * @param {Funtion} [options.complete] A function to be called when the request finishes
     * @param {Funtion} [options.success] A function to be called if the request succeeds
     * @param {Funtion} [options.error] A function to be called if the request fails
     * @param {Object} [options.scope=this] The object to which the scope of the above functions should be set
     * @return {XMLHttpRequest} The XHR request
     */
    Ajax.send = function(url, options) {

        var key,
            xhr = new XMLHttpRequest(),
            defaults = {
                'method': 'GET',
                'headers': {},
                'async': true,
                'data': {},
                'dataType': 'json', // xml, json, script, text or html
                'complete': null,
                'success': null,
                'error': null,
                'scope': this
            };

        options = metaScore.Object.extend({}, defaults, options);

        xhr.open(options.method, url, options.async);

        metaScore.Object.each(options.headers, function(key, value){
            xhr.setRequestHeader(key, value);
        });

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if(metaScore.Var.is(options.complete, 'function')){
                    options.complete.call(options.scope, xhr);
                }
                if((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304){
                    if(metaScore.Var.is(options.success, 'function')){
                        options.success.call(options.scope, xhr);
                    }
                }
                else if(metaScore.Var.is(options.error, 'function')){
                    options.error.call(options.scope, xhr);
                }
            }
        };

        xhr.send(options.data);

        return xhr;

    };

    /**
     * Send an XMLHttp GET request
     * 
     * @method get
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request. See {{#crossLink "Ajax/send:method"}}send{{/crossLink}} for available options
     * @return {XMLHttpRequest} The XHR request
     */
    Ajax.get = function(url, options) {

        metaScore.Object.extend(options, {'method': 'GET'});

        return Ajax.send(url, options);

    };

    /**
     * Send an XMLHttp POST request
     * 
     * @method post
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request. See {{#crossLink "Ajax/send:method"}}send{{/crossLink}} for available options
     * @return {XMLHttpRequest} The XHR request
     */
    Ajax.post = function(url, options) {

        metaScore.Object.extend(options, {'method': 'POST'});

        return Ajax.send(url, options);

    };

    /**
     * Send an XMLHttp PUT request
     * 
     * @method put
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request. See {{#crossLink "Ajax/send:method"}}send{{/crossLink}} for available options
     * @return {XMLHttpRequest} The XHR request
     */
    Ajax.put = function(url, options) {

        metaScore.Object.extend(options, {'method': 'PUT'});

        return Ajax.send(url, options);

    };

    return Ajax;

})();
/**
 * @module Core
 */

metaScore.Array = (function () {

    /**
     * A class for array helper functions
     * 
     * @class Array
     * @constructor
     */
    function Array() {
    }

    /**
     * Check if a value is in an array
     * 
     * @method inArray
     * @static
     * @param {Mixed} needle The value to search
     * @param {Array} haystack The array
     * @return {Integer} The index of the first match, -1 if none
     */
    Array.inArray = function (needle, haystack) {
        var len, i = 0;

        if(haystack) {
            if(haystack.indexOf){
                return haystack.indexOf(needle);
            }

            len = haystack.length;

            for ( ; i < len; i++ ) {
                // Skip accessing in sparse arrays
                if ( i in haystack && haystack[i] === needle ) {
                    return i;
                }
            }
        }

        return -1;
    };

    /**
     * Copy an array
     * 
     * @method copy
     * @static
     * @param {Array} arr The original array
     * @return {Array} The copy
     */
    Array.copy = function (arr) {
        return [].concat(arr);
    };

    /**
     * Shuffle array elements
     * 
     * @method shuffle
     * @static
     * @param {Array} arr The array to shuffle
     * @return {Array} The shuffled copy of the array
     */
    Array.shuffle = function(arr) {

        var shuffled = Array.copy(arr);

        shuffled.sort(function(){
            return ((Math.random() * 3) | 0) - 1;
        });

        return shuffled;

    };

    /**
     * Remove duplicate values from an array
     * 
     * @method unique
     * @static
     * @param {Array} arr The array to remove duplicates from
     * @return {Array} A copy of the array with no duplicates
     */
    Array.unique = function(arr) {

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
     * Iterate over an array with a callback function
     * 
     * @method each
     * @static
     * @param {Array} arr The array to iterate over
     * @param {Function} callback The function that will be executed on every element. The iteration is stopped if the callback return false
     * @param {Integer} callback.index The index of the current element being processed in the array
     * @param {Array} callback.value The element that is currently being processed in the array
     * @param {Mixed} scope The value to use as this when executing the callback
     * @return {Array} The array
     */
    Array.each = function(arr, callback, scope) {

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
     * Remove a elements from an array by value
     * 
     * @method remove
     * @static
     * @param {Array} arr The array to remove the elements from
     * @param {Mixed} value The value to search for
     * @return {Array} The array
     */
    Array.remove = function(arr, value){
        var index = Array.inArray(value, arr);

        while(index > -1){
            arr.splice(index, 1);
            index = Array.inArray(value, arr);
        }

        return arr;
    };

    /**
     * A natural sort function generator
     * 
     * @method naturalSort
     * @author Jim Palmer (http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm-with-unicode-support/) - version 0.7
     * @static
     * @param {Boolean} [insensitive=false] Whether the sort should not be case-sensitive
     * @return {Function} The sorting function
     * 
     * @example
     *     var arr = ["c", "A2", "a1", "d", "b"];
     *     arr.sort(metaScore.Array.naturalSort(true));
     *     // ["a1", "A2", "b", "c", "d"]
     * 
     * @example
     *     var arr = ["c", "A2", "a1", "d", "b"];
     *     arr.sort(metaScore.Array.naturalSort(false));
     *     // ["A2", "a1", "b", "c", "d"]
     */
    Array.naturalSort = function(insensitive){
        return function(a, b){
            var re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi,
                sre = /(^[ ]*|[ ]*$)/g,
                dre = /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[\/\-]\d{1,4}[\/\-]\d{1,4}|^\w+, \w+ \d+, \d{4})/,
                hre = /^0x[0-9a-f]+$/i,
                ore = /^0/,
                i = function(s) { return insensitive && (''+s).toLowerCase() || ''+s },
                // convert all to strings strip whitespace
                x = i(a).replace(sre, '') || '',
                y = i(b).replace(sre, '') || '',
                // chunk/tokenize
                xN = x.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
                yN = y.replace(re, '\0$1\0').replace(/\0$/,'').replace(/^\0/,'').split('\0'),
                // numeric, hex or date detection
                xD = parseInt(x.match(hre)) || (xN.length !== 1 && x.match(dre) && Date.parse(x)),
                yD = parseInt(y.match(hre)) || xD && y.match(dre) && Date.parse(y) || null,
                oFxNcL, oFyNcL;
            // first try and sort Hex codes or Dates
            if (yD) {
                if ( xD < yD ) { return -1; }
                else if ( xD > yD ) { return 1; }
            }
            // natural sorting through split numeric strings and default strings
            for(var cLoc=0, numS=Math.max(xN.length, yN.length); cLoc < numS; cLoc++) {
                    // find floats not starting with '0', string or 0 if not defined (Clint Priest)
                    oFxNcL = !(xN[cLoc] || '').match(ore) && parseFloat(xN[cLoc]) || xN[cLoc] || 0;
                    oFyNcL = !(yN[cLoc] || '').match(ore) && parseFloat(yN[cLoc]) || yN[cLoc] || 0;
                    // handle numeric vs string comparison - number < string - (Kyle Adams)
                    if (isNaN(oFxNcL) !== isNaN(oFyNcL)) { return (isNaN(oFxNcL)) ? 1 : -1; }
                    // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
                    else if (typeof oFxNcL !== typeof oFyNcL) {
                            oFxNcL += '';
                            oFyNcL += '';
                    }
                    if (oFxNcL < oFyNcL) { return -1; }
                    if (oFxNcL > oFyNcL) { return 1; }
            }
            return 0;
        };
    };

    /**
     * A natural case-insentive sorting function to use with Array.sort
     * 
     * @method naturalSortInsensitive
     * @static
     * @param {String} a The first string to compare
     * @param {String} b The second string to compare
     * @return {Integer} See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     */
    Array.naturalSortInsensitive = Array.naturalSort(true);
    

    /**
     * A natural case-sentive sorting function to use with Array.sort
     * 
     * @method naturalSortInsensitive
     * @static
     * @param {String} a The first string to compare
     * @param {String} b The second string to compare
     * @return {Integer} See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
     */
    Array.naturalSortSensitive = Array.naturalSort(false);

    return Array;

})();
/**
 * @module Core
 */

metaScore.Color = (function () {

    /**
     * A class for color helper functions
     * 
     * @class Color
     * @constructor
     */
    function Color() {
    }

    /**
     * Convert an RGB value to HSV
     * 
     * @method rgb2hsv
     * @static
     * @param {Object} rgb The rgb value as an object with 'r', 'g', and 'b' keys
     * @return {Object} The hsv value as an object with 'h', 's', and 'v' keys
     */
    Color.rgb2hsv = function (rgb){
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

    /**
     * Parse a CSS color value into an object with 'r', 'g', 'b', and 'a' keys
     * 
     * @method parse
     * @static
     * @param {Mixed} color The CSS value to parse
     * @return {Object} The color object with 'r', 'g', 'b', and 'a' keys
     */
    Color.parse = function(color){
        var rgba, matches;

        rgba = {
            r: 0,
            g: 0,
            b: 0,
            a: 0,
        };

        if(metaScore.Var.is(color, 'object')){
            rgba.r = 'r' in color ? color.r : 0;
            rgba.g = 'g' in color ? color.g : 0;
            rgba.b = 'b' in color ? color.b : 0;
            rgba.a = 'a' in color ? color.a : 1;
        }
        else if(metaScore.Var.is(color, 'string')){
            color = color.replace(/\s\s*/g,''); // Remove all spaces

            // Checks for 6 digit hex and converts string to integer
            if (matches = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color)){
                rgba.r = parseInt(matches[1], 16);
                rgba.g = parseInt(matches[2], 16);
                rgba.b = parseInt(matches[3], 16);
                rgba.a = 1;
            }

            // Checks for 3 digit hex and converts string to integer
            else if (matches = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color)){
                rgba.r = parseInt(matches[1], 16) * 17;
                rgba.g = parseInt(matches[2], 16) * 17;
                rgba.b = parseInt(matches[3], 16) * 17;
                rgba.a = 1;
            }

            // Checks for rgba and converts string to
            // integer/float using unary + operator to save bytes
            else if (matches = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color)){
                rgba.r = +matches[1];
                rgba.g = +matches[2];
                rgba.b = +matches[3];
                rgba.a = +matches[4];
            }

            // Checks for rgb and converts string to
            // integer/float using unary + operator to save bytes
            else if (matches = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color)){
                rgba.r = +matches[1];
                rgba.g = +matches[2];
                rgba.b = +matches[3];
                rgba.a = 1;
            }
        }

        return rgba;
    };

    return Color;

})();
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
/**
 * @module Core
 */

metaScore.Draggable = (function () {

    /**
     * Fired when the dragging started
     *
     * @event dragstart
     */
    var EVT_DRAGSTART = 'dragstart';

    /**
     * Fired when a drag occured
     *
     * @event drag
     */
    var EVT_DRAG = 'drag';

    /**
     * Fired when the dragging ended
     *
     * @event dragend
     */
    var EVT_DRAGEND = 'dragend';

    /**
     * A class for adding draggable behaviors
     * 
     * @class Draggable
     * @extends Class
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Dom} configs.target The Dom object to add the behavior to
     * @param {Dom} configs.handle The Dom object to use as a dragging handle
     * @param {Object} [configs.limits={'top': null, 'left': null}] The limits of the dragging
     */
    function Draggable(configs) {
        this.configs = this.getConfigs(configs);

        this.doc = new metaScore.Dom(this.configs.target.get(0).ownerDocument);

        // fix event handlers scope
        this.onMouseDown = metaScore.Function.proxy(this.onMouseDown, this);
        this.onMouseMove = metaScore.Function.proxy(this.onMouseMove, this);
        this.onMouseUp = metaScore.Function.proxy(this.onMouseUp, this);

        this.configs.handle.addListener('mousedown', this.onMouseDown);

        this.enable();
    }

    Draggable.defaults = {
        'target': null,
        'handle': null,
        'limits': {
            'top': null,
            'left': null
        }
    };

    metaScore.Class.extend(Draggable);

    /**
     * The mousedown event handler
     * 
     * @method onMouseDown
     * @private
     * @param {Event} evt The event object
     */
    Draggable.prototype.onMouseDown = function(evt){
        if(!this.enabled){
            return;
        }

        this.start_state = {
            'left': parseInt(this.configs.target.css('left'), 10) - evt.clientX,
            'top': parseInt(this.configs.target.css('top'), 10) - evt.clientY
        };

        this.doc
            .addListener('mouseup', this.onMouseUp)
            .addListener('mousemove', this.onMouseMove);

        this.configs.target
            .addClass('dragging')
            .triggerEvent(EVT_DRAGSTART, null, false, true);

        evt.stopPropagation();
    };

    /**
     * The mousemove event handler
     * 
     * @method onMouseMove
     * @private
     * @param {Event} evt The event object
     */
    Draggable.prototype.onMouseMove = function(evt){
        var left = evt.clientX + this.start_state.left,
            top = evt.clientY + this.start_state.top;

        if(!isNaN(this.configs.limits.top)){
            top = Math.max(top, this.configs.limits.top);
        }

        if(!isNaN(this.configs.limits.left)){
            left = Math.max(left, this.configs.limits.left);
        }

        this.configs.target
            .css('left', left + 'px')
            .css('top', top + 'px')
            .triggerEvent(EVT_DRAG, null, false, true);

        evt.stopPropagation();
    };

    /**
     * The mouseup event handler
     * 
     * @method onMouseUp
     * @private
     * @param {Event} evt The event object
     */
    Draggable.prototype.onMouseUp = function(evt){
        this.doc
            .removeListener('mousemove', this.onMouseMove)
            .removeListener('mouseup', this.onMouseUp);

        this.configs.target
            .removeClass('dragging')
            .triggerEvent(EVT_DRAGEND, null, false, true);

        evt.stopPropagation();
    };

    /**
     * Enable the behavior
     * 
     * @method enable
     * @chainable
     */
    Draggable.prototype.enable = function(){
        this.configs.target.addClass('draggable');

        this.configs.handle.addClass('drag-handle');

        this.enabled = true;

        return this;
    };

    /**
     * Disable the behavior
     * 
     * @method disable
     * @chainable
     */
    Draggable.prototype.disable = function(){
        this.configs.target.removeClass('draggable');

        this.configs.handle.removeClass('drag-handle');

        this.enabled = false;

        return this;
    };

    /**
     * Destroy the behavior
     * 
     * @method destroy
     * @chainable
     */
    Draggable.prototype.destroy = function(){
        this.disable();

        this.configs.handle.removeListener('mousedown', this.onMouseDown);

        return this;
    };

    return Draggable;

})();
/**
 * @module Core
 */

metaScore.Function = (function () {

    /**
     * A class for function helper functions
     * 
     * @class Function
     * @constructor
     */
    function Function() {
    }

    /**
     * Create a proxy of a function
     * 
     * @method proxy
     * @static
     * @param {Function} fn The function to proxy
     * @param {Mixed} scope The value to use as this when executing the proxy function
     * @param {Array} args Extra arguments to preppend to the passed arguments when the proxy function is called
     * @return {Function} The proxy function
     */
    Function.proxy = function(fn, scope, args){
        if (!metaScore.Var.type(fn, 'function')){
            return undefined;
        }

        return function () {
            var args_array;

            if(args){
                args_array = Array.prototype.slice.call(args); // transform args to a true array
                args_array = args_array.concat(Array.prototype.slice.call(arguments)); // concat passed arguments to the args_array
            }
            else{
                args_array = arguments;
            }

            return fn.apply(scope || this, args_array);
        };
    };

    return Function;

})();
/**
 * @module Core
 */

metaScore.Locale = (function(){

    /**
     * The i18n handling class
     *
     * @class Locale
     * @constructor
     */
    function Locale() {
    }

    /**
     * Translate a string
     *
     * @method t
     * @static
     * @param {String} key The string identifier
     * @param {String} str The default string to use if no translation is found
     * @param {Object} args An object of replacements to make after translation
     * @return {String} The translated string
     */
    Locale.t = function(key, str, args){
        if(typeof(metaScoreLocale) !== "undefined" && metaScoreLocale.hasOwnProperty(key)){
            str = metaScoreLocale[key];
        }

        return Locale.formatString(str, args);
    };

    /**
     * Replace placeholders with sanitized values in a string
     *
     * @method formatString
     * @static
     * @param {String} str The string to process
     * @param {Object} args An object of replacements with placeholders as keys
     * @return {String} The translated string
     */
    Locale.formatString = function(str, args) {
        metaScore.Object.each(args, function(key, value){
            str = str.replace(key, args[key]);
        }, this);

        return str;
    };

    return Locale;

})();
/**
 * @module Core
 */

metaScore.Object = (function () {

    /**
     * A class for object helper functions
     * 
     * @class Object
     * @constructor
     */
    function Object() {
    }

    /**
     * Merge the contents of two or more objects together into the first object
     * 
     * @method extend
     * @static
     * @param {Object} [first] The object to which other objects are merged
     * @param {Object} [...others] The objects to merge with the first one
     * @return {Object} The first object
     */
    Object.extend = function() {
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
     * 
     * @method copy
     * @static
     * @param {Object} obj The original object
     * @return {Object} The object copy
     */
    Object.copy = function(obj) {
        return Object.extend({}, obj);
    };

    /**
     * Iterate over an object
     * 
     * @method each
     * @static
     * @param {Object} obj The object to iterate over
     * @param {Function} callback The function that will be executed on every element. The iteration is stopped if the callback return false
     * @param {String} callback.key The key of the current element being processed in the object
     * @param {Mixed} callback.value The element that is currently being processed in the object
     * @param {Mixed} scope The value to use as this when executing the callback
     * @return {Object} The object
     */
    Object.each = function(obj, callback, scope) {
        var key, value,
            scope_provided = scope !== undefined;

        for (key in obj) {
            value = callback.call(scope_provided ? scope : obj[key], key, obj[key]);

            if (value === false) {
                break;
            }
        }

        return obj;
    };

    return Object;

})();
/**
 * @module Core
 */

metaScore.Resizable = (function () {

    /**
     * Fired when a resize started
     *
     * @event resizestart
     */
    var EVT_RESIZESTART = 'resizestart';

    /**
     * Fired when a resize occured
     *
     * @event resize
     */
    var EVT_RESIZE = 'resize';

    /**
     * Fired when a resize ended
     *
     * @event resizeend
     */
    var EVT_RESIZEEND = 'resizeend';

    /**
     * A class for adding resizable behaviors
     * 
     * @class Resizable
     * @extends Class
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Dom} configs.target The Dom object to add the behavior to
     * @param {Object} [configs.directions={'top', 'right', 'bottom', 'left', 'top-left', 'top-right', 'bottom-left', 'bottom-right'}] The directions at which a resize is allowed 
     */
    function Resizable(configs) {
        this.configs = this.getConfigs(configs);

        this.doc = new metaScore.Dom(this.configs.target.get(0).ownerDocument);

        this.handles = {};

        // fix event handlers scope
        this.onMouseDown = metaScore.Function.proxy(this.onMouseDown, this);
        this.onMouseMove = metaScore.Function.proxy(this.onMouseMove, this);
        this.onMouseUp = metaScore.Function.proxy(this.onMouseUp, this);

        metaScore.Array.each(this.configs.directions, function(index, direction){
            this.handles[direction] = new metaScore.Dom('<div/>', {'class': 'resize-handle'})
                .data('direction', direction)
                .addListener('mousedown', this.onMouseDown)
                .appendTo(this.configs.target);
        }, this);

        this.enable();
    }

    Resizable.defaults = {
        'target': null,
        'directions': [
            'top',
            'right',
            'bottom',
            'left',
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right'
        ]
    };

    metaScore.Class.extend(Resizable);

    /**
     * The mousedown event handler
     * 
     * @method onMouseDown
     * @private
     * @param {Event} evt The event object
     */
    Resizable.prototype.onMouseDown = function(evt){
        if(!this.enabled){
            return;
        }

        this.start_state = {
            'handle': evt.target,
            'x': evt.clientX,
            'y': evt.clientY,
            'left': parseInt(this.configs.target.css('left'), 10),
            'top': parseInt(this.configs.target.css('top'), 10),
            'w': parseInt(this.configs.target.css('width'), 10),
            'h': parseInt(this.configs.target.css('height'), 10)
        };

        this.doc
            .addListener('mousemove', this.onMouseMove, this)
            .addListener('mouseup', this.onMouseUp, this);

        this.configs.target
            .addClass('resizing')
            .triggerEvent(EVT_RESIZESTART, null, false, true);

        evt.stopPropagation();
    };

    /**
     * The mousemove event handler
     * 
     * @method onMouseMove
     * @private
     * @param {Event} evt The event object
     */
    Resizable.prototype.onMouseMove = function(evt){
        var handle = new metaScore.Dom(this.start_state.handle),
            w, h, top, left;

        switch(handle.data('direction')){
            case 'top':
                h = this.start_state.h - evt.clientY + this.start_state.y;
                top = this.start_state.top + evt.clientY    - this.start_state.y;
                break;
            case 'right':
                w = this.start_state.w + evt.clientX - this.start_state.x;
                break;
            case 'bottom':
                h = this.start_state.h + evt.clientY - this.start_state.y;
                break;
            case 'left':
                w = this.start_state.w - evt.clientX + this.start_state.x;
                left = this.start_state.left + evt.clientX - this.start_state.x;
                break;
            case 'top-left':
                w = this.start_state.w - evt.clientX + this.start_state.x;
                h = this.start_state.h - evt.clientY + this.start_state.y;
                top = this.start_state.top + evt.clientY    - this.start_state.y;
                left = this.start_state.left + evt.clientX - this.start_state.x;
                break;
            case 'top-right':
                w = this.start_state.w + evt.clientX - this.start_state.x;
                h = this.start_state.h - evt.clientY + this.start_state.y;
                top = this.start_state.top + evt.clientY - this.start_state.y;
                break;
            case 'bottom-left':
                w = this.start_state.w - evt.clientX + this.start_state.x;
                h = this.start_state.h + evt.clientY - this.start_state.y;
                left = this.start_state.left + evt.clientX - this.start_state.x;
                break;
            case 'bottom-right':
                w = this.start_state.w + evt.clientX - this.start_state.x;
                h = this.start_state.h + evt.clientY - this.start_state.y;
                break;
        }

        if(top !== undefined){
            this.configs.target.css('top', top +'px');
        }
        if(left !== undefined){
            this.configs.target.css('left', left +'px');
        }

        this.configs.target
            .css('width', w +'px')
            .css('height', h +'px')
            .triggerEvent(EVT_RESIZE, null, false, true);

        evt.stopPropagation();
    };

    /**
     * The mouseup event handler
     * 
     * @method onMouseUp
     * @private
     * @param {Event} evt The event object
     */
    Resizable.prototype.onMouseUp = function(evt){
        this.doc
            .removeListener('mousemove', this.onMouseMove, this)
            .removeListener('mouseup', this.onMouseUp, this);

        this.configs.target
            .removeClass('resizing')
            .triggerEvent(EVT_RESIZEEND, null, false, true);

        evt.stopPropagation();
    };

    /**
     * Get a handle
     * @method getHandle
     * @param {String} direction The direction of the handle to get
     * @return {Dom} The handle
     */
    Resizable.prototype.getHandle = function(direction){
        return this.handles[direction];
    };

    /**
     * Enable the behavior
     * 
     * @method enable
     * @chainable
     */
    Resizable.prototype.enable = function(){
        this.configs.target.addClass('resizable');

        this.enabled = true;

        return this;
    };

    /**
     * Disable the behavior
     * 
     * @method disable
     * @chainable
     */
    Resizable.prototype.disable = function(){
        this.configs.target.removeClass('resizable');

        this.enabled = false;

        return this;
    };

    /**
     * Destroy the behavior
     * 
     * @method destroy
     * @chainable
     */
    Resizable.prototype.destroy = function(){
        this.disable();

        metaScore.Object.each(this.handles, function(index, handle){
            handle.remove();
        }, this);

        return this;
    };

    return Resizable;

})();
/**
 * @module Core
 */

metaScore.String = (function () {

    /**
     * A class for string helper functions
     * 
     * @class String
     * @constructor
     */
    function String() {
    }

    /**
     * Capitalize a string
     * 
     * @method capitalize
     * @param {String} str The string to capitalize
     * @return {String} The capitalized string
     */
    String.capitalize = function(str){
        return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
    };

    /**
     * Generate a random uuid
     * 
     * @method uuid
     * @author Broofa <robert@broofa.com> (http://www.broofa.com/2008/09/javascript-uuid-function/)
     * @param {Integer} [len] The desired number of characters
     * @param {Integer} [radix] The number of allowable values for each character
     * @return {String} The generated uuid
     *
     * @exqmple
     *    var id = metaScore.String.uuid();
     *    // "66209871-857D-4A12-AC7E-E9EEBC2A6AC3"
     *
     * @exqmple
     *    var id = metaScore.String.uuid(5);
     *    // "kryIh"
     *
     * @exqmple
     *    var id = metaScore.String.uuid(5, 2);
     *    // "10100"
     */
    String.uuid = function(len, radix) {
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

            // Fill in random data.    At i==19 set the high bits of clock sequence as per rfc4122, sec. 4.1.5
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
     * Pad a string with another string
     * 
     * @method pad
     * @param {String} str The string to pad
     * @param {Integer} len The desired final string length
     * @param {String} [pad=" "] The string to pad with
     * @param {String} [dir="right"] The padding direction ("right", "left" or "both")
     * @return {String} The padded string
     *
     * @exqmple
     *    var str = "a";
     *    var padded = metaScore.String.pad(str, 3, "b");
     *    // "abb"
     *
     * @exqmple
     *    var str = "a";
     *    var padded = metaScore.String.pad(str, 3, "b", "left");
     *    // "bba"
     *
     * @exqmple
     *    var str = "a";
     *    var padded = metaScore.String.pad(str, 3, "b", "both");
     *    // "bab"
     */
    String.pad = function(str, len, pad, dir) {
        var right, left,
            padlen;

        if (typeof(len) === "undefined") { len = 0; }
        if (typeof(pad) === "undefined") { pad = ' '; }
        if (typeof(dir) === "undefined") { dir = 'right'; }

        str = str +'';

        if (len + 1 >= str.length) {
            switch (dir){
                case 'left':
                    str = Array(len + 1 - str.length).join(pad) + str;
                    break;

                case 'both':
                    padlen = len - str.length;
                    right = Math.ceil(padlen / 2);
                    left = padlen - right;
                    str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
                    break;

                default:
                    str = str + Array(len + 1 - str.length).join(pad);
                    break;
            }
        }
        return str;
    };

    return String;

})();
/**
 * @module Core
 */

metaScore.StyleSheet = (function () {

    /**
     * A class for CSS style sheet manipulation
     * 
     * @class StyleSheet
     * @extends Dom
     * @constructor
     */
    function StyleSheet() {
        // call the super constructor.
        metaScore.Dom.call(this, '<style/>', {'type': 'text/css'});

        this.el = this.get(0);

        // WebKit hack
        this.setInternalValue("");
    }

    metaScore.Dom.extend(StyleSheet);

    /**
     * Add a CSS rule to the style sheet
     * 
     * @method addRule
     * @param {String} selector The CSS selector for the rule
     * @param {String} rule The style definitions for the rule
     * @param {Integer} [index] The index position of the rule
     * @chainable
     */
    StyleSheet.prototype.addRule = function(selector, rule, index) {
        var sheet = this.el.sheet;

        if(index === undefined){
            index = sheet.cssRules.length;
        }

        if("insertRule" in sheet) {
            sheet.insertRule(selector + "{" + rule + "}", index);
        }
        else if("addRule" in sheet) {
            sheet.addRule(selector, rule, index);
        }

        return this;
    };

    /**
     * Remove a CSS rule from the style sheet
     * 
     * @method removeRule
     * @param {Integer} The index position of the rule to remove
     * @chainable
     */
    StyleSheet.prototype.removeRule = function(index) {
        var sheet = this.el.sheet;

        if("deleteRule" in sheet) {
            sheet.deleteRule(index);
        }
        else if("removeRule" in sheet) {
            sheet.removeRule(index);
        }

        return this;
    };

    /**
     * Remove the first CSS rule that matches a selector
     * 
     * @method removeRulesBySelector
     * @param {String} selector The CSS selector of the rule to remove
     * @chainable
     */
    StyleSheet.prototype.removeRulesBySelector = function(selector) {
        var sheet = this.el.sheet,
            rules = sheet.cssRules || sheet.rules;

        selector = selector.toLowerCase();

        for (var i=0; i<rules.length; i++){
            if(rules[i].selectorText.toLowerCase() === selector){
                this.removeRule(i);
                break;
            }
        }

        return this;
    };

    /**
     * Remove all CSS rule from the style sheet
     * 
     * @method removeRules
     * @chainable
     */
    StyleSheet.prototype.removeRules = function() {
        var sheet = this.el.sheet,
            rules = sheet.cssRules || sheet.rules;

        while(rules.length > 0){
            this.removeRule(0);
        }

        return this;
    };

    /**
     * Set the internal text value of the style sheet
     * 
     * @method setInternalValue
     * @param {String} value The CSS rules
     * @chainable
     */
    StyleSheet.prototype.setInternalValue = function(value) {
        if(this.el.styleSheet){
            this.el.styleSheet.cssText = value;
        }
        else{
            this.text(value);
        }

        return this;
    };

    return StyleSheet;

})();
/**
 * @module Core
 */

metaScore.Var = (function () {

    /**
     * A class for variable helper functions
     * 
     * @class Var
     * @constructor
     */
    function Var() {
    }

    /**
     * A list of variable type correspondances
     *
     * @property classes2types
     * @type {Object}
     * @static
     * @private
     */
    Var.classes2types = {
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
     * 
     * @method type
     * @static
     * @param {Mixed} obj The variable
     * @return {String} The type of the variable
     */
    Var.type = function(obj) {
        return obj == null ? String(obj) : Var.classes2types[ Object.prototype.toString.call(obj) ] || "object";
    };

    /**
     * Check if a variable is of a certain type
     * 
     * @method is
     * @static
     * @param {Mixed} obj The variable
     * @param {String} type The type to check for
     * @return {Boolean} Whether the variable is of the specified type
     */
    Var.is = function(obj, type) {
        return Var.type(obj) === type.toLowerCase();
    };

    /**
     * Check if a variable is empty
     * 
     * @method isEmpty
     * @static
     * @param {Mixed} obj The variable
     * @return {Boolean} Whether the variable is empty
     */
    Var.isEmpty = function(obj) {
        if(obj === undefined || obj == null){
            return true;
        }

        if(obj.hasOwnProperty('length')){
            return obj.length <= 0;
        }

        if(metaScore.Var.is(obj, 'object')){
            return Object.keys(obj).length <= 0;
        }

        return false;
    };

    return Var;

})();
/**
 * The Editor module defines classes used in editor
 *
 * @module Editor
 * @main
 */
 
metaScore.Editor = (function(){

    /**
     * Provides the main Editor class
     *
     * @class Editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Mixed} [configs.container='body'] The HTMLElement, Dom instance, or CSS selector to which the editor should be appended
     * @param {String} [configs.player_url=''] The base URL of players
     * @param {String} [configs.api_url=''] The base URL of the RESTful API
     * @param {Object} [configs.ajax={}] Custom options to send with each AJAX request. See {{#crossLink "Ajax/send:method"}}Ajax.send{{/crossLink}} for available options
     */
    function Editor(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Editor.parent.call(this, '<div/>', {'class': 'metaScore-editor'});

        if(this.configs.container){
            this.appendTo(this.configs.container);
        }

        // add components

        this.h_ruler = new metaScore.Dom('<div/>', {'class': 'ruler horizontal'}).appendTo(this);
        this.v_ruler = new metaScore.Dom('<div/>', {'class': 'ruler vertical'}).appendTo(this);

        this.workspace = new metaScore.Dom('<div/>', {'class': 'workspace'}).appendTo(this);

        this.mainmenu = new metaScore.editor.MainMenu().appendTo(this)
            .addDelegate('button[data-action]:not(.disabled)', 'click', metaScore.Function.proxy(this.onMainmenuClick, this))
            .addDelegate('.time', 'valuechange', metaScore.Function.proxy(this.onMainmenuTimeFieldChange, this))
            .addDelegate('.r-index', 'valuechange', metaScore.Function.proxy(this.onMainmenuRindexFieldChange, this));

        this.sidebar_wrapper = new metaScore.Dom('<div/>', {'class': 'sidebar-wrapper'}).appendTo(this)
            .addListener('resizestart', metaScore.Function.proxy(this.onSidebarResizeStart, this))
            .addListener('resize', metaScore.Function.proxy(this.onSidebarResize, this))
            .addListener('resizeend', metaScore.Function.proxy(this.onSidebarResizeEnd, this));

        this.sidebar_resizer = new metaScore.Resizable({target: this.sidebar_wrapper, directions: ['left']});

        this.sidebar_resizer.getHandle('left')
            .addListener('dblclick', metaScore.Function.proxy(this.onSidebarResizeDblclick, this));

        this.sidebar =    new metaScore.Dom('<div/>', {'class': 'sidebar'}).appendTo(this.sidebar_wrapper);

        this.panels = {};

        this.panels.block = new metaScore.editor.panel.Block().appendTo(this.sidebar)
            .addListener('componentbeforeset', metaScore.Function.proxy(this.onBlockBeforeSet, this))
            .addListener('componentset', metaScore.Function.proxy(this.onBlockSet, this))
            .addListener('componentunset', metaScore.Function.proxy(this.onBlockUnset, this))
            .addListener('valueschange', metaScore.Function.proxy(this.onBlockPanelValueChange, this));

        this.panels.block.getToolbar()
            .addDelegate('.selector', 'valuechange', metaScore.Function.proxy(this.onBlockPanelSelectorChange, this))
            .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onBlockPanelToolbarClick, this));

        this.panels.page = new metaScore.editor.panel.Page().appendTo(this.sidebar)
            .addListener('componentbeforeset', metaScore.Function.proxy(this.onPageBeforeSet, this))
            .addListener('componentset', metaScore.Function.proxy(this.onPageSet, this))
            .addListener('componentunset', metaScore.Function.proxy(this.onPageUnset, this))
            .addListener('valueschange', metaScore.Function.proxy(this.onPagePanelValueChange, this));

        this.panels.page.getToolbar()
            .addDelegate('.selector', 'valuechange', metaScore.Function.proxy(this.onPagePanelSelectorChange, this))
            .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onPagePanelToolbarClick, this));

        this.panels.element = new metaScore.editor.panel.Element().appendTo(this.sidebar)
            .addListener('componentbeforeset', metaScore.Function.proxy(this.onElementBeforeSet, this))
            .addListener('componentset', metaScore.Function.proxy(this.onElementSet, this))
            .addListener('componentunset', metaScore.Function.proxy(this.onElementUnset, this))
            .addListener('valueschange', metaScore.Function.proxy(this.onElementPanelValueChange, this));

        this.panels.element.getToolbar()
            .addDelegate('.selector', 'valuechange', metaScore.Function.proxy(this.onElementPanelSelectorChange, this))
            .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onElementPanelToolbarClick, this));

        this.panels.text = new metaScore.editor.panel.Text().appendTo(this.sidebar);

        this.grid = new metaScore.Dom('<div/>', {'class': 'grid'}).appendTo(this.workspace);
        this.version = new metaScore.Dom('<div/>', {'class': 'version', 'text': 'metaScore v.'+ metaScore.getVersion() +' r.'+ metaScore.getRevision()}).appendTo(this.workspace);

        this.player_frame = new metaScore.Dom('<iframe/>', {'src': 'about:blank', 'class': 'player-frame'}).appendTo(this.workspace)
            .addListener('load', metaScore.Function.proxy(this.onPlayerFrameLoadSuccess, this))
            .addListener('error', metaScore.Function.proxy(this.onPlayerFrameLoadError, this));

        this.history = new metaScore.editor.History()
            .addListener('add', metaScore.Function.proxy(this.onHistoryAdd, this))
            .addListener('undo', metaScore.Function.proxy(this.onHistoryUndo, this))
            .addListener('redo', metaScore.Function.proxy(this.onHistoryRedo, this));

        this.detailsOverlay = new metaScore.editor.overlay.GuideDetails({
                'submit_text': metaScore.Locale.t('editor.detailsOverlay.submit_text', 'Apply')
            })
            .addListener('show', metaScore.Function.proxy(this.onDetailsOverlayShow, this))
            .addListener('submit', metaScore.Function.proxy(this.onDetailsOverlaySubmit, this, ['update']));

        this.detailsOverlay.getField('type').readonly(true);

        new metaScore.Dom('body')
            .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
            .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));

        metaScore.Dom.addListener(window, 'hashchange', metaScore.Function.proxy(this.onWindowHashChange, this));
        metaScore.Dom.addListener(window, 'beforeunload', metaScore.Function.proxy(this.onWindowBeforeUnload, this));

        this
            .addDelegate('.timefield', 'valuein', metaScore.Function.proxy(this.onTimeFieldIn, this))
            .addDelegate('.timefield', 'valueout', metaScore.Function.proxy(this.onTimeFieldOut, this))
            .updateMainmenu()
            .setEditing(false)
            .loadPlayerFromHash();
    }

    metaScore.Dom.extend(Editor);
    
    Editor.defaults = {
        'container': 'body',
        'player_url': '',
        'api_url': '',
        'ajax': {}
    };

    /**
     * Guide creation success callback
     *
     * @method onGuideCreateSuccess
     * @private
     * @param {GuideDetails} overlay The GuideDetails overlay that was used to create the guide
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Editor.prototype.onGuideCreateSuccess = function(overlay, xhr){
        var json = JSON.parse(xhr.response);

        this.loadmask.hide();
        delete this.loadmask;

        overlay.hide();

        this.loadPlayer(json.id, json.vid);
    };

    /**
     * Guide creation error callback
     *
     * @method onGuideCreateError
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Editor.prototype.onGuideCreateError = function(xhr){
        this.loadmask.hide();
        delete this.loadmask;

        new metaScore.editor.overlay.Alert({
            'text': metaScore.Locale.t('editor.onGuideCreateError.msg', 'The following error occured:<br/><strong><em>@error (@code)</em></strong><br/>Please try again.', {'@error': xhr.statusText, '@code': xhr.status}),
            'buttons': {
                'ok': metaScore.Locale.t('editor.onGuideCreateError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Guide saving success callback
     *
     * @method onGuideSaveSuccess
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Editor.prototype.onGuideSaveSuccess = function(xhr){
        var player = this.getPlayer(),
            json = JSON.parse(xhr.response);

        this.loadmask.hide();
        delete this.loadmask;

        if(json.id !== player.getId()){
            this.loadPlayer(json.id, json.vid);
        }
        else{
            this.detailsOverlay
                .clearValues(true)
                .setValues(json, true);

            player.setRevision(json.vid);
        }
    };

    /**
     * Guide saving error callback
     *
     * @method onGuideSaveError
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Editor.prototype.onGuideSaveError = function(xhr){
        this.loadmask.hide();
        delete this.loadmask;

        new metaScore.editor.overlay.Alert({
            'text': metaScore.Locale.t('editor.onGuideSaveError.msg', 'The following error occured:<br/><strong><em>@error (@code)</em></strong><br/>Please try again.', {'@error': xhr.statusText, '@code': xhr.status}),
            'buttons': {
                'ok': metaScore.Locale.t('editor.onGuideSaveError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Guide deletion confirm callback
     *
     * @method onGuideDeleteConfirm
     * @private
     */
    Editor.prototype.onGuideDeleteConfirm = function(){
        var id = this.getPlayer().getId(),
            component,    options;

        options = metaScore.Object.extend({}, {
            'dataType': 'json',
            'method': 'DELETE',
            'success': metaScore.Function.proxy(this.onGuideDeleteSuccess, this),
            'error': metaScore.Function.proxy(this.onGuideDeleteError, this)
        }, this.configs.ajax);

        this.loadmask = new metaScore.editor.overlay.LoadMask({
            'autoShow': true
        });

        metaScore.Ajax.send(this.configs.api_url +'guide/'+ id +'.json', options);
    };

    /**
     * Guide deletion success callback
     *
     * @method onGuideDeleteSuccess
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Editor.prototype.onGuideDeleteSuccess = function(xhr){
        this.removePlayer();

        this.loadmask.hide();
        delete this.loadmask;
    };

    /**
     * Guide deletion error callback
     *
     * @method onGuideDeleteError
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Editor.prototype.onGuideDeleteError = function(xhr){
        this.loadmask.hide();
        delete this.loadmask;

        new metaScore.editor.overlay.Alert({
            'text': metaScore.Locale.t('editor.onGuideDeleteError.msg', 'The following error occured:<br/><strong><em>@error (@code)</em></strong><br/>Please try again.', {'@error': xhr.statusText, '@code': xhr.status}),
            'buttons': {
                'ok': metaScore.Locale.t('editor.onGuideDeleteError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Guide revert confirm callback
     *
     * @method onGuideRevertConfirm
     * @private
     */
    Editor.prototype.onGuideRevertConfirm = function(){
        var player = this.getPlayer();

        this.loadPlayer(player.getId(), player.getRevision());
    };

    /**
     * GuideSelector submit callback
     *
     * @method onGuideSelectorSubmit
     * @param {CustomEvent} evt The event object. See {{#crossLink "GuideSelector/submit:event"}}GuideSelector.submit{{/crossLink}}
     */
    Editor.prototype.onGuideSelectorSubmit = function(evt){
        this.loadPlayer(evt.detail.guide.id, evt.detail.vid);
    };

    /**
     * Keydown event callback
     *
     * @method onKeydown
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    Editor.prototype.onKeydown = function(evt){
        var player;

        switch(evt.keyCode){
            case 18: //alt
                if(!evt.repeat){
                    this.setEditing(!this.persistentEditing, false);
                    evt.preventDefault();
                }
                break;

            case 72: //h
                if(evt.ctrlKey){ // Ctrl+h
                    player = this.getPlayer();
                    if(player){
                        player.addClass('show-contents');
                    }
                    evt.preventDefault();
                }
                break;

            case 90: //z
                if(evt.ctrlKey){ // Ctrl+z
                    this.history.undo();
                    evt.preventDefault();
                }
                break;

            case 89: //y
                if(evt.ctrlKey){ // Ctrl+y
                    this.history.redo();
                    evt.preventDefault();
                }
                break;
        }
    };

    /**
     * Keyup event callback
     *
     * @method onKeyup
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    Editor.prototype.onKeyup = function(evt){
        var player;

        switch(evt.keyCode){
            case 18: //alt
                this.setEditing(this.persistentEditing, false);
                evt.preventDefault();
                break;

            case 72: //h
                if(evt.ctrlKey){ // Ctrl+h
                    player = this.getPlayer();
                    if(player){
                        player.removeClass('show-contents');
                    }
                    evt.preventDefault();
                }
                break;
        }
    };

    /**
     * Mainmenu click event callback
     *
     * @method onMainmenuClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onMainmenuClick = function(evt){
        var callback;

        switch(metaScore.Dom.data(evt.target, 'action')){
            case 'new':
                callback = metaScore.Function.proxy(function(){
                    new metaScore.editor.overlay.GuideDetails({
                            'autoShow': true
                        })
                        .addListener('show', metaScore.Function.proxy(this.onDetailsOverlayShow, this))
                        .addListener('submit', metaScore.Function.proxy(this.onDetailsOverlaySubmit, this, ['create']));
                }, this);

                if(this.hasOwnProperty('player')){
                    new metaScore.editor.overlay.Alert({
                            'text': metaScore.Locale.t('editor.onMainmenuClick.open.msg', 'Are you sure you want to open another guide ?<br/><strong>Any unsaved data will be lost.</strong>'),
                            'buttons': {
                                'confirm': metaScore.Locale.t('editor.onMainmenuClick.open.yes', 'Yes'),
                                'cancel': metaScore.Locale.t('editor.onMainmenuClick.open.no', 'No')
                            },
                            'autoShow': true
                        })
                        .addListener('buttonclick', function(evt){
                            if(evt.detail.action === 'confirm'){
                                callback();
                            }
                        });
                }
                else{
                    callback();
                }
                break;

            case 'open':
                callback = metaScore.Function.proxy(this.openGuideSelector, this);

                if(this.hasOwnProperty('player')){
                    new metaScore.editor.overlay.Alert({
                            'text': metaScore.Locale.t('editor.onMainmenuClick.open.msg', 'Are you sure you want to open another guide ?<br/><strong>Any unsaved data will be lost.</strong>'),
                            'buttons': {
                                'confirm': metaScore.Locale.t('editor.onMainmenuClick.open.yes', 'Yes'),
                                'cancel': metaScore.Locale.t('editor.onMainmenuClick.open.no', 'No')
                            },
                            'autoShow': true
                        })
                        .addListener('buttonclick', function(evt){
                            if(evt.detail.action === 'confirm'){
                                callback();
                            }
                        });
                }
                else{
                    callback();
                }
                break;

            case 'edit':
                this.detailsOverlay.show();
                break;

            case 'save-draft':
                this.saveGuide('update');
                break;

            case 'save-copy':
                this.saveGuide('duplicate');
                break;

            case 'publish':
                callback = metaScore.Function.proxy(function(){
                    this.saveGuide('update', true);
                }, this);

                new metaScore.editor.overlay.Alert({
                        'text': metaScore.Locale.t('editor.onMainmenuClick.publish.msg', 'This action will make this version the public version.<br/>Are you sure you want to continue?'),
                        'buttons': {
                            'confirm': metaScore.Locale.t('editor.onMainmenuClick.publish.yes', 'Yes'),
                            'cancel': metaScore.Locale.t('editor.onMainmenuClick.publish.no', 'No')
                        },
                        'autoShow': true
                    })
                    .addListener('buttonclick', function(evt){
                        if(evt.detail.action === 'confirm'){
                            callback();
                        }
                    });
                break;

            case 'download':
                break;

            case 'delete':
                new metaScore.editor.overlay.Alert({
                        'text': metaScore.Locale.t('editor.onMainmenuClick.delete.msg', 'Are you sure you want to delete this guide ?'),
                        'buttons': {
                            'confirm': metaScore.Locale.t('editor.onMainmenuClick.delete.yes', 'Yes'),
                            'cancel': metaScore.Locale.t('editor.onMainmenuClick.delete.no', 'No')
                        },
                        'autoShow': true
                    })
                    .addListener('buttonclick', metaScore.Function.proxy(function(evt){
                        if(evt.detail.action === 'confirm'){
                            this.onGuideDeleteConfirm();
                        }
                    }, this));
                break;

            case 'revert':
                new metaScore.editor.overlay.Alert({
                        'text': metaScore.Locale.t('editor.onMainmenuClick.revert.msg', 'Are you sure you want to revert back to the last saved version ?<br/><strong>Any unsaved data will be lost.</strong>'),
                        'buttons': {
                            'confirm': metaScore.Locale.t('editor.onMainmenuClick.revert.yes', 'Yes'),
                            'cancel': metaScore.Locale.t('editor.onMainmenuClick.revert.no', 'No')
                        },
                        'autoShow': true
                    })
                    .addListener('buttonclick', metaScore.Function.proxy(function(evt){
                        if(evt.detail.action === 'confirm'){
                            this.onGuideRevertConfirm();
                        }
                    }, this));
                break;

            case 'undo':
                this.history.undo();
                break;

            case 'redo':
                this.history.redo();
                break;

            case 'edit-toggle':
                this.setEditing(!metaScore.editing);
                break;

            case 'settings':
                break;
        }
    };

    /**
     * Mainmenu time field valuechange event callback
     *
     * @method onMainmenuTimeFieldChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Time/valuechange:event"}}Time.valuechange{{/crossLink}}
     */
    Editor.prototype.onMainmenuTimeFieldChange = function(evt){
        var field = evt.target._metaScore,
            time = field.getValue();

        this.getPlayer().media.setTime(time);
    };

    /**
     * Mainmenu reading index field valuechange event callback
     *
     * @method onMainmenuRindexFieldChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Number/valuechange:event"}}Number.valuechange{{/crossLink}}
     */
    Editor.prototype.onMainmenuRindexFieldChange = function(evt){
        var field = evt.target._metaScore,
            value = field.getValue();

        this.getPlayer().setReadingIndex(value, true);
    };

    /**
     * Time field valuein event callback
     *
     * @method onTimeFieldIn
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Time/valuein:event"}}Time.valuein{{/crossLink}}
     */
    Editor.prototype.onTimeFieldIn = function(evt){
        var field = evt.target._metaScore,
            time = this.getPlayer().media.getTime();

        field.setValue(time);
    };

    /**
     * Time field valueout event callback
     *
     * @method onTimeFieldOut
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Time/valueout:event"}}Time.valueout{{/crossLink}}
     */
    Editor.prototype.onTimeFieldOut = function(evt){
        var field = evt.target._metaScore,
            time = field.getValue();

        this.getPlayer().media.setTime(time);
    };

    /**
     * Sidebar resizestart event callback
     *
     * @method onSidebarResizeStart
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Resizable/resizestart:event"}}Resizable.resizestart{{/crossLink}}
     */
    Editor.prototype.onSidebarResizeStart = function(evt){
        this.addClass('sidebar-resizing');
    };

    /**
     * Sidebar resize event callback
     *
     * @method onSidebarResize
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Resizable/resize:event"}}Resizable.resize{{/crossLink}}
     */
    Editor.prototype.onSidebarResize = function(evt){
        var width = parseInt(this.sidebar_wrapper.css('width'), 10);

        this.workspace.css('right', width +'px');
    };

    /**
     * Sidebar resizeend event callback
     *
     * @method onSidebarResizeEnd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Resizable/resizeend:event"}}Resizable.resizeend{{/crossLink}}
     */
    Editor.prototype.onSidebarResizeEnd = function(evt){
        this.removeClass('sidebar-resizing');
    };

    /**
     * Sidebar resize handle dblclick event callback
     *
     * @method onSidebarResizeDblclick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onSidebarResizeDblclick = function(evt){
        this.toggleClass('sidebar-hidden');

        this.toggleSidebarResizer();
    };

    /**
     * Block panel componentbeforeset event callback
     *
     * @method onBlockBeforeSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentbeforeset:event"}}Panel.componentbeforeset{{/crossLink}}
     */
    Editor.prototype.onBlockBeforeSet = function(evt){
        var block = evt.detail.component;

        this.panels.element.unsetComponent();
        this.panels.page.unsetComponent();
    };

    /**
     * Block panel componentset event callback
     *
     * @method onBlockSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentset:event"}}Panel.componentset{{/crossLink}}
     */
    Editor.prototype.onBlockSet = function(evt){
        var block = evt.detail.component;

        if(block.instanceOf('Block')){
            this.panels.page.getToolbar()
                .toggleMenuItem('new', true);

            this.panels.page.setComponent(block.getActivePage());

            this.panels.element.getToolbar()
                .toggleMenuItem('Cursor', true)
                .toggleMenuItem('Image', true)
                .toggleMenuItem('Text', true);
        }

        this.updatePageSelector();

        evt.stopPropagation();
    };

    /**
     * Block panel componentunset event callback
     *
     * @method onBlockUnset
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentunset:event"}}Panel.componentunset{{/crossLink}}
     */
    Editor.prototype.onBlockUnset = function(evt){
        this.panels.page.unsetComponent();
        this.panels.page.getToolbar().toggleMenuItem('new', false);
    };

    /**
     * Block panel valuechange event callback
     *
     * @method onBlockPanelValueChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/valueschange:event"}}Panel.valueschange{{/crossLink}}
     */
    Editor.prototype.onBlockPanelValueChange = function(evt){
        var panel = this.panels.block,
            block = evt.detail.component,
            old_values = evt.detail.old_values,
            new_values = evt.detail.new_values;

        this.history.add({
            'undo': function(){
                panel.updateProperties(block, old_values);
            },
            'redo': function(){
                panel.updateProperties(block, new_values);
            }
        });
    };

    /**
     * Block panel toolbar click event callback
     *
     * @method onBlockPanelToolbarClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onBlockPanelToolbarClick = function(evt){
        var player, panel, block, page_configs,
            action = metaScore.Dom.data(evt.target, 'action');

        switch(action){
            case 'synched':
            case 'non-synched':
                player = this.getPlayer();
                panel = this.panels.block;
                block = player.addBlock({
                    'name':    metaScore.Locale.t('editor.onBlockPanelToolbarClick.defaultBlockName', 'untitled'),
                    'synched': action === 'synched'
                });

                page_configs = {};

                if(action === 'synched'){
                    page_configs['start-time'] = 0;
                    page_configs['end-time'] = this.getPlayer().getMedia().getDuration();
                }

                block.addPage(page_configs);

                panel.setComponent(block);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponent();
                        block.remove();
                    },
                    'redo': function(){
                        player.addBlock(block);
                        panel.setComponent(block);
                    }
                });
                break;

            case 'delete':
                player = this.getPlayer();
                panel = this.panels.block;
                block = this.panels.block.getComponent();

                if(block){
                    panel.unsetComponent();
                    block.remove();

                    this.history.add({
                        'undo': function(){
                            player.addBlock(block);
                            panel.setComponent(block);
                        },
                        'redo': function(){
                            panel.unsetComponent();
                            block.remove();
                        }
                    });
                }
                break;
        }

        evt.stopPropagation();
    };

    /**
     * Block panel toolbar selector valuechange event callback
     *
     * @method onBlockPanelSelectorChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Select/valueschange:event"}}Select.valueschange{{/crossLink}}
     */
    Editor.prototype.onBlockPanelSelectorChange = function(evt){
        var id = evt.detail.value,
            dom;

        if(!id){
            this.panels.block.unsetComponent();
        }
        else{
            dom = this.getPlayer().getComponent('.media#'+ id +', .controller#'+ id +', .block#'+ id);

            if(dom && dom._metaScore){
                this.panels.block.setComponent(dom._metaScore);
            }
        }
    };

    /**
     * Page panel componentbeforeset event callback
     *
     * @method onPageBeforeSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentbeforeset:event"}}Panel.componentbeforeset{{/crossLink}}
     */
    Editor.prototype.onPageBeforeSet = function(evt){
        var page = evt.detail.component,
            block = page.getBlock();

        this.panels.element.unsetComponent();
        this.panels.block.setComponent(block);
    };

    /**
     * Page panel componentset event callback
     *
     * @method onPageSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentset:event"}}Panel.componentset{{/crossLink}}
     */
    Editor.prototype.onPageSet = function(evt){
        var page = evt.detail.component,
            block = this.panels.block.getComponent(),
            index, previous_page, next_page,
            start_time_field = this.panels.page.getField('start-time'),
            end_time_field = this.panels.page.getField('end-time');

        this.panels.page.getToolbar().toggleMenuItem('new', true);

        this.panels.element
            .unsetComponent()
            .getToolbar()
                .toggleMenuItem('Cursor', true)
                .toggleMenuItem('Image', true)
                .toggleMenuItem('Text', true);

        if(block.getProperty('synched')){
            index = block.getActivePageIndex();
            previous_page = block.getPage(index-1);
            next_page = block.getPage(index+1);

            if(previous_page){
                start_time_field.readonly(false).enable().setMin(previous_page.getProperty('start-time'));
            }
            else{
                start_time_field.readonly(true).enable();
            }

            if(next_page){
                end_time_field.readonly(false).enable().setMax(next_page.getProperty('end-time'));
            }
            else{
                end_time_field.readonly(true).enable();
            }
        }
        else{
            start_time_field.disable();
            end_time_field.disable();
        }

        this.updateElementSelector();

        evt.stopPropagation();
    };

    /**
     * Page panel componentunset event callback
     *
     * @method onPageUnset
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentunset:event"}}Panel.componentunset{{/crossLink}}
     */
    Editor.prototype.onPageUnset = function(evt){
        this.panels.element
            .unsetComponent()
            .getToolbar()
                .toggleMenuItem('Cursor', false)
                .toggleMenuItem('Image', false)
                .toggleMenuItem('Text', false);
    };

    /**
     * Page panel valuechange event callback
     *
     * @method onPagePanelValueChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/valueschange:event"}}Panel.valueschange{{/crossLink}}
     */
    Editor.prototype.onPagePanelValueChange = function(evt){
        var editor = this,
            panel = this.panels.page,
            page = evt.detail.component,
            old_values = evt.detail.old_values,
            new_values = evt.detail.new_values,
            block, index, previous_page, next_page;

        if(('start-time' in new_values) || ('end-time' in new_values)){
            if((block = page.getBlock()) && block.getProperty('synched')){
                index = block.getActivePageIndex();
                previous_page = block.getPage(index-1);
                next_page = block.getPage(index+1);

                if(('start-time' in new_values) && previous_page){
                    previous_page.setProperty('end-time', new_values['start-time']);
                }

                if(('end-time' in new_values) && next_page){
                    next_page.setProperty('start-time', new_values['end-time']);
                }
            }

            editor.updateElementSelector();
        }

        this.history.add({
            'undo': function(){
                panel.updateProperties(page, old_values);

                if(('start-time' in new_values) || ('end-time' in new_values)){
                    if(('start-time' in new_values) && previous_page){
                        previous_page.setProperty('end-time', old_values['start-time']);
                    }

                    if(('end-time' in new_values) && next_page){
                        next_page.setProperty('start-time', old_values['end-time']);
                    }

                    editor.updateElementSelector();
                }
            },
            'redo': function(){
                panel.updateProperties(page, new_values);

                if(('start-time' in new_values) || ('end-time' in new_values)){
                    if(('start-time' in new_values) && previous_page){
                        previous_page.setProperty('end-time', new_values['start-time']);
                    }

                    if(('end-time' in new_values) && next_page){
                        next_page.setProperty('start-time', new_values['end-time']);
                    }

                    editor.updateElementSelector();
                }
            }
        });
    };

    /**
     * Page panel toolbar click event callback
     *
     * @method onPagePanelToolbarClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onPagePanelToolbarClick = function(evt){
        var panel, block, page,
            start_time, end_time, configs,
            previous_page, auto_page, index,
            action = metaScore.Dom.data(evt.target, 'action');

        switch(action){
            case 'new':
                panel = this.panels.page;
                block = this.panels.block.getComponent();
                configs = {};

                if(block.getProperty('synched')){
                    index = block.getActivePageIndex();
                    previous_page = block.getPage(index);

                    start_time = this.getPlayer().media.getTime();
                    end_time = previous_page.getProperty('end-time');

                    configs['start-time'] = start_time;
                    configs['end-time'] = end_time;

                    previous_page.setProperty('end-time', start_time);
                }

                page = block.addPage(configs, index+1);
                panel.setComponent(page);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponent();
                        block.removePage(page);

                        if(block.getProperty('synched')){
                            previous_page.setProperty('end-time', end_time);
                        }

                        block.setActivePage(index);
                    },
                    'redo': function(){
                        if(block.getProperty('synched')){
                            previous_page.setProperty('end-time', start_time);
                        }

                        block.addPage(page, index+1);
                        panel.setComponent(page);
                    }
                });
                break;

            case 'delete':
                panel = this.panels.page;
                block = this.panels.block.getComponent();
                page = panel.getComponent();
                index = block.getActivePageIndex();

                if(page){
                    panel.unsetComponent();
                    block.removePage(page);
                    index--;

                    if(block.getPageCount() < 1){
                        configs = {};

                        if(block.getProperty('synched')){
                            configs['start-time'] = 0;
                            configs['end-time'] = this.getPlayer().getMedia().getDuration();
                        }

                        auto_page = block.addPage(configs);
                        panel.setComponent(auto_page);
                    }

                    block.setActivePage(Math.max(0, index));

                    this.history.add({
                        'undo': function(){
                            if(auto_page){
                                block.removePage(auto_page, true);
                            }

                            block.addPage(page);
                            panel.setComponent(page);
                        },
                        'redo': function(){
                            panel.unsetComponent();
                            block.removePage(page, true);

                            if(auto_page){
                                block.addPage(auto_page);
                                panel.setComponent(auto_page);
                            }

                            block.setActivePage(index);
                        }
                    });
                }
                break;
        }

        evt.stopPropagation();
    };

    /**
     * Page panel toolbar selector valuechange event callback
     *
     * @method onPagePanelSelectorChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Select/valueschange:event"}}Select.valueschange{{/crossLink}}
     */
    Editor.prototype.onPagePanelSelectorChange = function(evt){
        var block = this.panels.block.getComponent(),
            id, dom;

        if(block){
            id = evt.detail.value;
            dom = this.getPlayer().getComponent('.page#'+ id);

            if(dom && dom._metaScore){
                block.setActivePage(dom._metaScore);
            }
        }
    };

    /**
     * Element panel componentbeforeset event callback
     *
     * @method onElementBeforeSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentbeforeset:event"}}Panel.componentbeforeset{{/crossLink}}
     */
    Editor.prototype.onElementBeforeSet = function(evt){
        var element = evt.detail.component,
            page = element.parents().get(0)._metaScore;

        this.panels.page.setComponent(page);
    };

    /**
     * Element panel componentset event callback
     *
     * @method onElementSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentset:event"}}Panel.componentset{{/crossLink}}
     */
    Editor.prototype.onElementSet = function(evt){
        var element = evt.detail.component,
            player = this.getPlayer();

        if(element.getProperty('type') === 'Text'){
            this.panels.text.setComponent(element);
        }
        else{
            this.panels.text.unsetComponent();
        }

        player.setReadingIndex(element.getProperty('r-index') || 0);

        evt.stopPropagation();
    };

    /**
     * Element panel componentunset event callback
     *
     * @method onElementUnset
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/componentunset:event"}}Panel.componentunset{{/crossLink}}
     */
    Editor.prototype.onElementUnset = function(evt){
        this.panels.text.unsetComponent();

        evt.stopPropagation();
    };

    /**
     * Element panel valuechange event callback
     *
     * @method onElementPanelValueChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Panel/valueschange:event"}}Panel.valueschange{{/crossLink}}
     */
    Editor.prototype.onElementPanelValueChange = function(evt){
        var editor = this,
            panel = this.panels.element,
            element = evt.detail.component,
            old_values = evt.detail.old_values,
            new_values = evt.detail.new_values;

        if(('start-time' in new_values) || ('end-time' in new_values)){
            editor.updateElementSelector();
        }

        this.history.add({
            'undo': function(){
                panel.updateProperties(element, old_values);

                if(('start-time' in new_values) || ('end-time' in new_values)){
                    editor.updateElementSelector();
                }
            },
            'redo': function(){
                panel.updateProperties(element, new_values);

                if(('start-time' in new_values) || ('end-time' in new_values)){
                    editor.updateElementSelector();
                }
            }
        });
    };

    /**
     * Element panel toolbar click event callback
     *
     * @method onElementPanelToolbarClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onElementPanelToolbarClick = function(evt){
        var panel, page, element,
            action = metaScore.Dom.data(evt.target, 'action');

        switch(action){
            case 'Cursor':
            case 'Image':
            case 'Text':
                panel = this.panels.element;
                page = this.panels.page.getComponent();
                element = page.addElement({'type': action, 'name':    metaScore.Locale.t('editor.onElementPanelToolbarClick.defaultElementName', 'untitled')});

                panel.setComponent(element);

                this.history.add({
                    'undo': function(){
                        panel.unsetComponent();
                        element.remove();
                    },
                    'redo': function(){
                        page.addElement(element);
                        panel.setComponent(element);
                    }
                });
                break;

            case 'delete':
                panel = this.panels.element;
                page = this.panels.page.getComponent();
                element = this.panels.element.getComponent();

                if(element){
                    panel.unsetComponent();
                    element.remove();

                    this.history.add({
                        'undo': function(){
                            page.addElement(element);
                            panel.setComponent(element);
                        },
                        'redo': function(){
                            panel.unsetComponent();
                            element.remove();
                        }
                    });
                }
                break;
        }
    };

    /**
     * Element panel toolbar selector valuechange event callback
     *
     * @method onPagePanelSelectorChange
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Select/valueschange:event"}}Select.valueschange{{/crossLink}}
     */
    Editor.prototype.onElementPanelSelectorChange = function(evt){
        var id = evt.detail.value,
            dom;

        if(!id){
            this.panels.element.unsetComponent();
        }
        else{
            dom = this.getPlayer().getComponent('.element#'+ id);

            if(dom && dom._metaScore){
                this.panels.element.setComponent(dom._metaScore);
            }
        }
    };

    /**
     * Player idset event callback
     *
     * @method onPlayerIdSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/idset:event"}}Player.idset{{/crossLink}}
     */
    Editor.prototype.onPlayerIdSet = function(evt){
        var player = evt.detail.player;

        window.history.replaceState(null, null, '#guide='+ player.getId() +':'+ player.getRevision());
    };

    /**
     * Player revisionset event callback
     *
     * @method onPlayerRevisionSet
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/revisionset:event"}}Player.revisionset{{/crossLink}}
     */
    Editor.prototype.onPlayerRevisionSet = function(evt){
        var player = evt.detail.player;

        window.history.replaceState(null, null, '#guide='+ player.getId() +':'+ player.getRevision());
    };

    /**
     * Media timeupdate event callback
     *
     * @method onPlayerTimeUpdate
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Media/timeupdate:event"}}Media.timeupdate{{/crossLink}}
     */
    Editor.prototype.onPlayerTimeUpdate = function(evt){
        var time = evt.detail.media.getTime();

        this.mainmenu.timefield.setValue(time, true);
    };

    /**
     * Player rindex event callback
     *
     * @method onPlayerReadingIndex
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/rindex:event"}}Player.rindex{{/crossLink}}
     */
    Editor.prototype.onPlayerReadingIndex = function(evt){
        var rindex = evt.detail.value;

        this.mainmenu.rindexfield.setValue(rindex, true);
    };

    /**
     * Player blockadd event callback
     *
     * @method onPlayerBlockAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/blockadd:event"}}Player.blockadd{{/crossLink}}
     */
    Editor.prototype.onPlayerBlockAdd = function(evt){
        this.updateBlockSelector();
    };

    /**
     * Player childremove event callback
     *
     * @method onPlayerChildRemove
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Dom/childremove:event"}}Dom.childremove{{/crossLink}}
     */
    Editor.prototype.onPlayerChildRemove = function(evt){
        var child = evt.detail.child,
            component = child._metaScore;

        if(component){
            if(component.instanceOf('Block')){
                this.updateBlockSelector();
            }
            else if(component.instanceOf('Page')){
                this.updatePageSelector();
            }
            else if(component.instanceOf('Element')){
                this.updateElementSelector();
            }
        }
    };

    /**
     * Player frame load event callback
     *
     * @method onPlayerFrameLoadSuccess
     * @private
     * @param {UIEvent} evt The event object
     */
    Editor.prototype.onPlayerFrameLoadSuccess = function(evt){
        this.player_frame.get(0).contentWindow.player
            .addListener('load', metaScore.Function.proxy(this.onPlayerLoadSuccess, this))
            .addListener('error', metaScore.Function.proxy(this.onPlayerLoadError, this))
            .addListener('idset', metaScore.Function.proxy(this.onPlayerIdSet, this))
            .addListener('revisionset', metaScore.Function.proxy(this.onPlayerRevisionSet, this));
    };

    /**
     * Player frame error event callback
     *
     * @method onPlayerFrameLoadError
     * @private
     * @param {UIEvent} evt The event object
     */
    Editor.prototype.onPlayerFrameLoadError = function(evt){
        this.loadmask.hide();
        delete this.loadmask;

        new metaScore.editor.overlay.Alert({
            'text': metaScore.Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': metaScore.Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Player load event callback
     *
     * @method onPlayerLoadSuccess
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/load:event"}}Player.load{{/crossLink}}
     */
    Editor.prototype.onPlayerLoadSuccess = function(evt){
        this.player = evt.detail.player
            .addClass('in-editor')
            .addDelegate('.metaScore-component', 'click', metaScore.Function.proxy(this.onComponentClick, this))
            .addDelegate('.metaScore-component.block', 'pageadd', metaScore.Function.proxy(this.onBlockPageAdd, this))
            .addDelegate('.metaScore-component.block', 'pageactivate', metaScore.Function.proxy(this.onBlockPageActivate, this))
            .addDelegate('.metaScore-component.page', 'elementadd', metaScore.Function.proxy(this.onPageElementAdd, this))
            .addListener('blockadd', metaScore.Function.proxy(this.onPlayerBlockAdd, this))
            .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
            .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this))
            .addListener('click', metaScore.Function.proxy(this.onPlayerClick, this))
            .addListener('timeupdate', metaScore.Function.proxy(this.onPlayerTimeUpdate, this))
            .addListener('rindex', metaScore.Function.proxy(this.onPlayerReadingIndex, this))
            .addListener('childremove', metaScore.Function.proxy(this.onPlayerChildRemove, this));

        new metaScore.Dom(this.player_frame.get(0).contentWindow.document.body)
            .addListener('keydown', metaScore.Function.proxy(this.onKeydown, this))
            .addListener('keyup', metaScore.Function.proxy(this.onKeyup, this));

        this
            .setEditing(true)
            .updateMainmenu()
            .updateBlockSelector();

        this.mainmenu
            .rindexfield.setValue(0, true);

        this.detailsOverlay
            .clearValues(true)
            .setValues(this.player.getData(), true);

        this.loadmask.hide();
        delete this.loadmask;
    };

    /**
     * Player error event callback
     *
     * @method onPlayerLoadError
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Player/error:event"}}Player.error{{/crossLink}}
     */
    Editor.prototype.onPlayerLoadError = function(evt){
        this.loadmask.hide();
        delete this.loadmask;

        new metaScore.editor.overlay.Alert({
            'text': metaScore.Locale.t('editor.onPlayerLoadError.msg', 'An error occured while trying to load the guide. Please try again.'),
            'buttons': {
                'ok': metaScore.Locale.t('editor.onPlayerLoadError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Player click event callback
     *
     * @method onPlayerClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onPlayerClick = function(evt){

        if(metaScore.editing !== true){
            return;
        }

        this.panels.block.unsetComponent();

        evt.stopPropagation();
    };

    /**
     * Component click event callback
     *
     * @method onComponentClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Editor.prototype.onComponentClick = function(evt, dom){
        var component;

        if(metaScore.editing !== true){
            return;
        }

        component = dom._metaScore;

        if(component.instanceOf('Element')){
            this.panels.element.setComponent(component);
        }
        else if(component.instanceOf('Page')){
            this.panels.page.setComponent(component);
        }
        else{
            this.panels.block.setComponent(component);
        }

        evt.stopImmediatePropagation();
    };

    /**
     * Block pageadd event callback
     *
     * @method onBlockPageAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Block/pageadd:event"}}Block.pageadd{{/crossLink}}
     */
    Editor.prototype.onBlockPageAdd = function(evt){
        var block = evt.detail.block;

        if(block === this.panels.block.getComponent()){
            this.updatePageSelector();
        }

        evt.stopPropagation();
    };

    /**
     * Block pageactivate event callback
     *
     * @method onBlockPageActivate
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Block/pageactivate:event"}}Block.pageactivate{{/crossLink}}
     */
    Editor.prototype.onBlockPageActivate = function(evt){
        var page, basis;

        if(metaScore.editing !== true){
            return;
        }

        page = evt.detail.page;
        basis = evt.detail.basis;

        if((basis !== 'pagecuepoint') || (page.getBlock() === this.panels.block.getComponent())){
            this.panels.page.setComponent(page);
        }
    };

    /**
     * Page elementadd event callback
     *
     * @method onPageElementAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Page/elementadd:event"}}Page.elementadd{{/crossLink}}
     */
    Editor.prototype.onPageElementAdd = function(evt){
        var page = evt.detail.page;

        if(page === this.panels.page.getComponent()){
            this.updateElementSelector();
        }

        evt.stopPropagation();
    };

    /**
     * History add event callback
     *
     * @method onHistoryAdd
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "History/add:event"}}History.add{{/crossLink}}
     */
    Editor.prototype.onHistoryAdd = function(evt){
        this.updateMainmenu();
    };

    /**
     * History undo event callback
     *
     * @method onHistoryUndo
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "History/undo:event"}}History.undo{{/crossLink}}
     */
    Editor.prototype.onHistoryUndo = function(evt){
        this.updateMainmenu();
    };

    /**
     * History redo event callback
     *
     * @method onHistoryRedo
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "History/redo:event"}}History.redo{{/crossLink}}
     */
    Editor.prototype.onHistoryRedo = function(evt){
        this.updateMainmenu();
    };

    /**
     * GuideDetails show event callback
     *
     * @method onDetailsOverlayShow
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "Overlay/show:event"}}Overlay.show{{/crossLink}}
     */
    Editor.prototype.onDetailsOverlayShow = function(evt){
        var player = this.getPlayer();

        if(player){
            player.getMedia().pause();
        }
    };

    /**
     * GuideDetails submit event callback
     *
     * @method onDetailsOverlaySubmit
     * @private
     * @param {CustomEvent} evt The event object. See {{#crossLink "GuideDetails/submit:event"}}GuideDetails.submit{{/crossLink}}
     */
    Editor.prototype.onDetailsOverlaySubmit = function(op, evt){
        var overlay = evt.detail.overlay,
            data = evt.detail.values,
            player, callback;

        switch(op){
            case 'create':
                this.createGuide(data, overlay);
                break;

            case 'update':
                player = this.getPlayer();

                callback = metaScore.Function.proxy(function(){
                    player.updateData(data);
                    overlay.setValues(metaScore.Object.extend({}, player.getData(), data), true).hide();
                }, this);

                if('media' in data){
                    this.getMediaFileDuration(data['media'].url, metaScore.Function.proxy(function(new_duration){
                        var old_duration = player.getMedia().getDuration(),
                            blocks = [], block, page;

                        if(new_duration !== old_duration){
                            if(new_duration < old_duration){
                                player.getComponents('.block').each(function(index, block_dom){
                                    if(block_dom._metaScore){
                                        block = block_dom._metaScore;

                                        if(block.getProperty('synched')){
                                            metaScore.Array.each(block.getPages(), function(index, page){
                                                if(page.getProperty('start-time') < new_duration){
                                                    blocks.push(block.getProperty('name'));
                                                    return false;
                                                }
                                            });
                                        }
                                    }
                                });
                            }

                            if(blocks.length > 0){
                                new metaScore.editor.overlay.Alert({
                                    'text': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.shorter.msg', 'The duration of selected media file (!new_duration centiseconds) is less than the current one (!old_duration centiseconds).<br/><strong>This will cause some pages of the following blocks to become out of reach: !blocks</strong><br/>Please modify the start time of those pages and try again.', {'!new_duration': new_duration, '!old_duration': old_duration, '!blocks': blocks.join(', ')}),
                                    'buttons': {
                                        'ok': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.shorter.ok', 'OK'),
                                    },
                                    'autoShow': true
                                });
                            }
                            else{
                                new metaScore.editor.overlay.Alert({
                                    'text': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.diffferent.msg', 'The duration of selected media file (!new_duration centiseconds) differs from the current one (!old_duration centiseconds).<br/><strong>This can cause pages and elements to become desynchronized.</strong><br/>Are you sure you want to use the new media file?', {'!new_duration': new_duration, '!old_duration': old_duration}),
                                    'buttons': {
                                        'confirm': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.diffferent.yes', 'Yes'),
                                        'cancel': metaScore.Locale.t('editor.onDetailsOverlaySubmit.update.diffferent.no', 'No')
                                    },
                                    'autoShow': true
                                })
                                .addListener('buttonclick', function(evt){
                                    if(evt.detail.action === 'confirm'){
                                        callback();
                                    }
                                });
                            }
                        }
                        else{
                            callback();
                        }
                    }, this));
                }
                else{
                    callback();
                }
                break;
        }
    };

    /**
     * Window hashchange event callback
     *
     * @method onWindowHashChange
     * @private
     * @param {HashChangeEvent} evt The event object
     */
    Editor.prototype.onWindowHashChange = function(evt){
        var callback = metaScore.Function.proxy(this.loadPlayerFromHash, this),
            oldURL = evt.oldURL;

        if(this.getPlayer()){
            new metaScore.editor.overlay.Alert({
                    'text': metaScore.Locale.t('editor.onWindowHashChange.alert.msg', 'Are you sure you want to open another guide ?<br/><strong>Any unsaved data will be lost.</strong>'),
                    'buttons': {
                        'confirm': metaScore.Locale.t('editor.onWindowHashChange.alert.yes', 'Yes'),
                        'cancel': metaScore.Locale.t('editor.onWindowHashChange.alert.no', 'No')
                    },
                    'autoShow': true
                })
                .addListener('buttonclick', function(evt){
                    if(evt.detail.action === 'confirm'){
                        callback();
                    }
                    else{
                        window.history.replaceState(null, null, oldURL);
                    }
                });
        }
        else{
            callback();
        }

        evt.preventDefault();
    };

    /**
     * Window beforeunload event callback
     *
     * @method onWindowBeforeUnload
     * @private
     * @param {Event} evt The event object
     */
    Editor.prototype.onWindowBeforeUnload = function(evt){
        if(this.hasOwnProperty('player')){
            evt.returnValue = metaScore.Locale.t('editor.onWindowBeforeUnload.msg', 'Any unsaved data will be lost.');
        }
    };

    /**
     * Updates the editing state
     *
     * @method setEditing
     * @param {Boolean} editing The new state
     * @param {Boolean} sticky Whether the new state is persistent or temporary
     * @chainable
     */
    Editor.prototype.setEditing = function(editing, sticky){
        var player = this.getPlayer();

        metaScore.editing = editing !== false;

        if(sticky !== false){
            this.persistentEditing = metaScore.editing;
        }

        metaScore.Object.each(this.panels, function(key, panel){
            if(metaScore.editing){
                panel.enable();
            }
            else{
                panel.disable();
            }
        });

        this.toggleClass('editing', metaScore.editing);

        if(player){
            player.toggleClass('editing', metaScore.editing);
        }

        this.toggleSidebarResizer();

        return this;

    };

    /**
     * Toggles the activation of the sidebar resizer
     *
     * @method toggleSidebarResizer
     * @private
     * @chainable
     */
    Editor.prototype.toggleSidebarResizer = function(){
        if(!this.hasClass('editing') || this.hasClass('sidebar-hidden')){
            this.sidebar_resizer.disable();
        }
        else{
            this.sidebar_resizer.enable();
        }

        return this;
    };

    /**
     * Loads a player from the location hash
     *
     * @method loadPlayerFromHash
     * @private
     * @chainable
     */
    Editor.prototype.loadPlayerFromHash = function(){
        var hash, match;

        hash = window.location.hash;

        if(match = hash.match(/(#|&)guide=(\w+)(:(\d+))?/)){
            this.loadPlayer(match[2], match[4]);
        }

        return this;
    };

    /**
     * Updates the states of the mainmenu buttons
     *
     * @method updateMainmenu
     * @private
     * @chainable
     */
    Editor.prototype.updateMainmenu = function(){
        var hasPlayer = this.hasOwnProperty('player');

        this.mainmenu.toggleButton('edit', hasPlayer);
        this.mainmenu.toggleButton('save-draft', hasPlayer);
        this.mainmenu.toggleButton('save-copy', hasPlayer);
        this.mainmenu.toggleButton('publish', hasPlayer);
        this.mainmenu.toggleButton('delete', hasPlayer);
        //this.mainmenu.toggleButton('download', hasPlayer);

        this.mainmenu.toggleButton('undo', this.history.hasUndo());
        this.mainmenu.toggleButton('redo', this.history.hasRedo());
        this.mainmenu.toggleButton('revert', hasPlayer);

        return this;
    };

    /**
     * Updates the selector of the block panel
     *
     * @method updateBlockSelector
     * @private
     * @chainable
     */
    Editor.prototype.updateBlockSelector = function(){
        var toolbar = this.panels.block.getToolbar(),
            selector = toolbar.getSelector(),
            block, label;

        selector
            .clear()
            .addOption(null, '');

        this.getPlayer().getComponents('.media.video, .controller, .block').each(function(index, dom){
            if(dom._metaScore){
                block = dom._metaScore;

                if(block.instanceOf('Block')){
                    if(block.getProperty('synched')){
                        label = metaScore.Locale.t('editor.blockSelectorOptionLabelSynched', '!name (synched)', {'!name': block.getName()});
                    }
                    else{
                        label = metaScore.Locale.t('editor.blockSelectorOptionLabelNotSynched', '!name (not synched)', {'!name': block.getName()});
                    }
                }
                else{
                    label = block.getName();
                }

                selector.addOption(block.getId(), label);
            }
        }, this);

        block = this.panels.block.getComponent();
        selector.setValue(block ? block.getId() : null, true);

        return this;
    };

    /**
     * Updates the selector of the page panel
     *
     * @method updatePageSelector
     * @private
     * @chainable
     */
    Editor.prototype.updatePageSelector = function(){
        var block = this.panels.block.getComponent(),
            page = this.panels.page.getComponent(),
            toolbar = this.panels.page.getToolbar(),
            selector = toolbar.getSelector();

        selector.clear();

        if(block.instanceOf('Block')){
            metaScore.Array.each(block.getPages(), function(index, page){
                selector.addOption(page.getId(), index+1);
            });
        }

        selector.setValue(page ? page.getId() : null, true);

        return this;
    };

    /**
     * Updates the selector of the element panel
     *
     * @method updateElementSelector
     * @private
     * @chainable
     */
    Editor.prototype.updateElementSelector = function(){
        var block = this.panels.block.getComponent(),
            page = this.panels.page.getComponent(),
            toolbar = this.panels.element.getToolbar(),
            selector = toolbar.getSelector(),
            synched = block.getProperty('synched'),
            element, out_of_range,
            page_start_time, page_end_time,
            element_start_time, element_end_time,
            rindex, optgroups = {};

        // clear the selector
        selector.clear();

        // fill the list of optgroups
        if(page.instanceOf('Page')){
            if(synched){
                page_start_time = page.getProperty('start-time');
                page_end_time = page.getProperty('end-time');
            }

            metaScore.Array.each(page.getElements(), function(index, element){
                out_of_range = false;

                if(synched){
                    element_start_time = element.getProperty('start-time');
                    element_end_time = element.getProperty('end-time');

                    out_of_range = ((element_start_time !== null) && (element_start_time < page_start_time)) || ((element_end_time !== null) && (element_end_time > page_end_time));
                }

                rindex = element.getProperty('r-index') || 0;

                if(!(rindex in optgroups)){
                    optgroups[rindex] = [];
                }

                optgroups[rindex].push({
                    'element': element,
                    'out_of_range': out_of_range
                });
            }, this);
        }

        // create the optgroups and their options
        metaScore.Array.each(Object.keys(optgroups).sort(metaScore.Array.naturalSortInsensitive), function(index, rindex){
            var options = optgroups[rindex],
                optgroup;

            // sort options by element names
            options.sort(function(a, b){
                return metaScore.Array.naturalSortInsensitive(a.element.getName(), b.element.getName());
            });

            // create the optgroup
            optgroup = selector.addGroup(metaScore.Locale.t('editor.elementSelectorGroupLabel', 'Reading index !rindex', {'!rindex': rindex})).attr('data-rindex', rindex);

            // create the options
            metaScore.Array.each(options, function(index, option){
                var element = option.element,
                    out_of_range = option.out_of_range;

                selector
                    .addOption(element.getId(), (out_of_range ? '*' : '') + element.getName(), optgroup)
                    .toggleClass('out-of-range', out_of_range);
            }, this);
        }, this);

        element = this.panels.element.getComponent();

        selector.setValue(element ? element.getId() : null, true);

        return this;
    };

    /**
     * Get the player instance if any
     *
     * @method getPlayer
     * @return {Player} The player instance
     */
    Editor.prototype.getPlayer = function(){
        return this.player;
    };

    /**
     * Loads a player by guide id and vid
     *
     * @method loadPlayer
     * @param {String} id The guide's id
     * @param {Integer} vid The guide's revision id
     * @chainable
     */
    Editor.prototype.loadPlayer = function(id, vid){
        var url = this.configs.player_url + id;

        if(vid){
            url += "?vid="+ vid;
        }

        this.loadmask = new metaScore.editor.overlay.LoadMask({
            'autoShow': true
        });

        this.player_frame.get(0).contentWindow.location.replace(url);

        return this;
    };

    /**
     * Removes the player
     *
     * @method removePlayer
     * @chainable
     */
    Editor.prototype.removePlayer = function(){
        delete this.player;

        this.player_frame.get(0).contentWindow.location.replace('about:blank');
        this.panels.block.unsetComponent();
        this.updateMainmenu();

        return this;
    };

    /**
     * Opens the guide selector
     *
     * @method openGuideSelector
     * @chainable
     */
    Editor.prototype.openGuideSelector = function(){
        new metaScore.editor.overlay.GuideSelector({
                'url': this.configs.api_url +'guide.json',
                'autoShow': true
            })
            .addListener('submit', metaScore.Function.proxy(this.onGuideSelectorSubmit, this));

        return this;
    };

    /**
     * Creates a new guide
     *
     * @method createGuide
     * @private
     * @param {Object} details The guide's data
     * @param {GuideDetails} overlay The overlay instance used to create the guide
     * @chainable
     */
    Editor.prototype.createGuide = function(details, overlay){
        var data = new FormData(),
            options;

        // append values from the details overlay
        metaScore.Object.each(details, function(key, value){
            if(key === 'thumbnail' || key === 'media'){
                data.append('files['+ key +']', value.object);
            }
            else{
                data.append(key, value);
            }
        });

        // prepare the Ajax options object
        options = metaScore.Object.extend({
            'data': data,
            'dataType': 'json',
            'success': metaScore.Function.proxy(this.onGuideCreateSuccess, this, [overlay]),
            'error': metaScore.Function.proxy(this.onGuideCreateError, this)
        }, this.configs.ajax);

        // add a loading mask
        this.loadmask = new metaScore.editor.overlay.LoadMask({
            'text': metaScore.Locale.t('editor.createGuide.LoadMask.text', 'Saving...'),
            'autoShow': true
        });

        metaScore.Ajax.post(this.configs.api_url +'guide.json', options);

        return this;
    };

    /**
     * Saves the loaded guide
     *
     * @method saveGuide
     * @param {String} action The action to perform when saving ('update' or 'duplicate')
     * @param {Boolean} publish Whether to published the new revision
     * @chainable
     */
    Editor.prototype.saveGuide = function(action, publish){
        var player = this.getPlayer(),
            id = player.getId(),
            vid = player.getRevision(),
            components = player.getComponents('.media, .controller, .block'),
            data = new FormData(),
            details = this.detailsOverlay.getValues(),
            blocks = [],
            component, options;

        // append the publish flag if true
        if(publish === true){
            data.append('publish', true);
        }

        // append values from the details overlay
        metaScore.Object.each(details, function(key, value){
            if(key === 'thumbnail' || key === 'media'){
                data.append('files['+ key +']', value.object);
            }
            else{
                data.append(key, value);
            }
        });

        // append blocks data
        components.each(function(index, dom){
            component = dom._metaScore;

            if(component.instanceOf('Media')){
                data.append('blocks[]', JSON.stringify(metaScore.Object.extend({'type': 'media'}, component.getProperties())));
            }
            else if(component.instanceOf('Controller')){
                data.append('blocks[]', JSON.stringify(metaScore.Object.extend({'type': 'controller'}, component.getProperties())));
            }
            else if(component.instanceOf('Block')){
                data.append('blocks[]', JSON.stringify(component.getProperties()));
            }
        }, this);

        // prepare the Ajax options object
        options = metaScore.Object.extend({
            'data': data,
            'dataType': 'json',
            'success': metaScore.Function.proxy(this.onGuideSaveSuccess, this),
            'error': metaScore.Function.proxy(this.onGuideSaveError, this)
        }, this.configs.ajax);

        // add a loading mask
        this.loadmask = new metaScore.editor.overlay.LoadMask({
            'text': metaScore.Locale.t('editor.saveGuide.LoadMask.text', 'Saving...'),
            'autoShow': true
        });

        metaScore.Ajax.post(this.configs.api_url +'guide/'+ id +'/'+ action +'.json?vid='+ vid, options);

        return this;
    };

    /**
     * Get a media file's duration in centiseconds
     *
     * @method getMediaFileDuration
     * @private
     * @param {String} url The file's url
     * @param {Function} callback A callback function to call with the duration
     */
    Editor.prototype.getMediaFileDuration = function(url, callback){
        var media = new metaScore.Dom('<audio/>', {'src': url})
            .addListener('loadedmetadata', function(evt){
                var duration = parseFloat(media.get(0).duration) * 100;

                callback(duration);
            });
    };

    return Editor;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor').Button = (function () {

    /**
     * A simple button based on an HTML button element
     *
     * @class Button
     * @namespace editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.label=null] A text to add as a label
     */
    function Button(configs) {
        this.configs = this.getConfigs(configs);

        // call the super constructor.
        metaScore.Dom.call(this, '<button/>');

        this.disabled = false;

        if(this.configs.label){
            this.setLabel(this.configs.label);
        }

        this.addListener('click', metaScore.Function.proxy(this.onClick, this));
    }

    Button.defaults = {
        'label': null
    };

    metaScore.Dom.extend(Button);

    /**
     * The click event handler
     *
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    Button.prototype.onClick = function(evt){
        if(this.disabled){
            evt.stopPropagation();
        }
    };

    /**
     * Set the button's text
     *
     * @method setLabel
     * @param {String} text The text to use as the label
     * @chainable
     */
    Button.prototype.setLabel = function(text){
        if(this.label === undefined){
            this.label = new metaScore.Dom('<span/>', {'class': 'label'})
                .appendTo(this);
        }

        this.label.text(text);

        return this;
    };

    /**
     * Disable the button
     *
     * @method disable
     * @chainable
     */
    Button.prototype.disable = function(){
        this.disabled = true;

        this.addClass('disabled');

        return this;
    };

    /**
     * Enable the button
     *
     * @method enable
     * @chainable
     */
    Button.prototype.enable = function(){
        this.disabled = false;

        this.removeClass('disabled');

        return this;
    };

    return Button;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor').DropDownMenu = (function () {

    /**
     * A dropdown menu based on an HTML ul element
     *
     * @class DropDownMenu
     * @namespace editor
     * @extends Dom
     * @constructor
     */
    function DropDownMenu() {
        // call the super constructor.
        metaScore.Dom.call(this, '<ul/>', {'class': 'dropdown-menu'});
    }

    metaScore.Dom.extend(DropDownMenu);

    /**
     * Add an item
     *
     * @method addItem
     * @param {String} action The action associated with the item
     * @param {String} label The text to display
     * @return {Dom} item The added item
     */
    DropDownMenu.prototype.addItem = function(action, label){
        var item = new metaScore.Dom('<li/>', {'data-action': action, 'text': label})
            .appendTo(this);

        return item;
    };

    /**
     * Toggle an item's enabled state
     *
     * @method toggleItem
     * @param {String} action The action associated with the item
     * @param {Boolean} [state] The state to set the item to, the current state is toggled if not provided
     * @chainable
     */
    DropDownMenu.prototype.toggleItem = function(action, state){
        this.child('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

        return this;
    };

    return DropDownMenu;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor').Field = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A generic field based on an HTML input element
     *
     * @class Field
     * @namespace editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Mixed} [configs.value=null] The default value
     * @param {Boolean} [configs.required=false] Whether the field is required
     * @param {Boolean} [configs.disabled=false] Whether the field is disabled by default
     * @param {Boolean} [configs.readonly=false] Whether the field is readonly by default
     * @param {String} [configs.description=''] A description to add to the field
     */
    function Field(configs) {
        this.configs = this.getConfigs(configs);

        // call the super constructor.
        metaScore.Dom.call(this, '<div/>', {'class': 'field'});

        this.setupUI();

        // keep a reference to this class instance in the DOM node
        this.get(0)._metaScore = this;

        if(this.configs.value !== null){
            this.setValue(this.configs.value);
        }

        if(this.input){
            if(this.configs.name){
                this.input.attr('name', this.configs.name);
            }

            if(this.configs.required){
                this.addClass('required');
                this.input.attr('required', '');
            }
        }

        if(this.configs.disabled){
            this.disable();
        }
        else{
            this.enable();
        }

        if(this.configs.description){
            this.setDescription(this.configs.description);
        }

        this.readonly(this.configs.readonly);
    }

    Field.defaults = {
        'value': null,
        'required': false,
        'disabled': false,
        'readonly': false,
        'description': null
    };

    metaScore.Dom.extend(Field);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    Field.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<input/>', {'id': uid})
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

    /**
     * Set the description text
     *
     * @method setDescription
     * @param {String} description The description text
     * @chainable
     */
    Field.prototype.setDescription = function(description){
        if(!('description' in this)){
            this.description = new metaScore.Dom('<div/>', {'class': 'description'})
                .appendTo(this.input_wrapper);
        }

        this.description.text(description);
        
        return this;
    };

    /**
     * The change event handler
     *
     * @method onChange
     * @param {Event} evt The event object
     * @private
     */
    Field.prototype.onChange = function(evt){
        this.value = this.input.val();

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * Set the field's value
     *
     * @method setValue
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Field.prototype.setValue = function(value, supressEvent){
        this.input.val(value);
        this.value = value;

        if(supressEvent !== true){
            this.input.triggerEvent('change');
        }
        
        return this;
    };

    /**
     * Get the field's current value
     *
     * @method getValue
     * @return {Mixed} The value
     */
    Field.prototype.getValue = function(){
        return this.value;
    };

    /**
     * Disable the field
     *
     * @method disable
     * @chainable
     */
    Field.prototype.disable = function(){
        this.disabled = true;

        this.addClass('disabled');

        if(this.input){
            this.input.attr('disabled', 'disabled');
        }

        return this;
    };

    /**
     * Enable the field
     *
     * @method enable
     * @chainable
     */
    Field.prototype.enable = function(){
        this.disabled = false;

        this.removeClass('disabled');

        if(this.input){
            this.input.attr('disabled', null);
        }

        return this;
    };

    /**
     * Toggle the field's readonly state
     *
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    Field.prototype.readonly = function(readonly){
        this.is_readonly = readonly === true;

        this.toggleClass('readonly', this.is_readonly);

        if(this.input){
            this.input.attr('readonly', this.is_readonly ? "readonly" : null);
        }

        return this;
    };

    return Field;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor').History = (function(){

    /**
     * Fired when a command is added
     *
     * @event add
     * @param {Object} command The added command
     */
    var EVT_ADD = 'add';

    /**
     * Fired when a command is undone
     *
     * @event undo
     * @param {Object} command The added command
     */
    var EVT_UNDO = 'undo';

    /**
     * Fired when a command is redone
     *
     * @event redo
     * @param {Object} command The added command
     */
    var EVT_REDO = 'redo';

    /**
     * Fired when the command history is cleared
     *
     * @event clear
     */
    var EVT_CLEAR = 'clear';

    /**
     * An undo/redo manager
     *
     * @class History
     * @namespace editor
     * @extends Evented
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Integer} [configs.max_commands=30] The max number of commands to store
     */
    function History(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        History.parent.call(this);

        this.commands = [];
        this.index = -1;
        this.executing = false;
    }

    History.defaults = {
        'max_commands': 30
    };

    metaScore.Evented.extend(History);

    /**
     * Execute a command's action
     *
     * @method execute
     * @private
     * @param {Object} command The command object
     * @param {String} action The action ('undo' or 'redo') to execute
     * @chainable
     */
    History.prototype.execute = function(command, action) {
        if (command && (action in command)) {
            this.executing = true;
            command[action](command);
            this.executing = false;
        }

        return this;
    };

    /**
     * Add a command
     *
     * @method add
     * @param {Object} command The command object. It should contain an 'undo' and a 'redo' function
     * @chainable
     */
    History.prototype.add = function (command){
        if (this.executing) {
            return this;
        }

        // invalidate items higher on the stack
        this.commands.splice(this.index + 1, this.commands.length - this.index);

        // insert the new command
        this.commands.push(command);

        // remove old commands
        if(this.commands.length > this.configs.max_commands){
            this.commands = this.commands.slice(this.configs.max_commands * -1);
        }

        // update the index
        this.index = this.commands.length - 1;

        this.triggerEvent(EVT_ADD, {'command': command});

        return this;
    };

    /**
     * Execute the undo action of the current command
     *
     * @method undo
     * @chainable
     */
    History.prototype.undo = function() {
        var command = this.commands[this.index];

        if (!command) {
            return this;
        }

        // execute the command's undo
         this.execute(command, 'undo');

        // update the index
        this.index -= 1;

        this.triggerEvent(EVT_UNDO, {'command': command});

        return this;
    };

    /**
     * Execute the redo action of the previous command
     *
     * @method redo
     * @chainable
     */
    History.prototype.redo = function() {
        var command = this.commands[this.index + 1];

        if (!command) {
            return this;
        }

        // execute the command's redo
        this.execute(command, 'redo');

        // update the index
        this.index += 1;

        this.triggerEvent(EVT_REDO, {'command': command});

        return this;
    };

    /**
     * Remove all commands
     *
     * @method clear
     * @chainable
     */
    History.prototype.clear = function () {
        var length = this.commands.length;

        this.commands = [];
        this.index = -1;

        if(length > 0) {
            this.triggerEvent(EVT_CLEAR);
        }
        
        return this;

    };

    /**
     * Check if an undo action is available
     *
     * @method hasUndo
     * @return {Boolean} Whether an undo action is available
     */
    History.prototype.hasUndo = function(){
        return this.index !== -1;
    };

    /**
     * Check if a redo action is available
     *
     * @method hasRedo
     * @return {Boolean} Whether a redo action is available
     */
    History.prototype.hasRedo = function(){
        return this.index < (this.commands.length - 1);
    };

    return History;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor').MainMenu = (function(){

    /**
     * The editor's main menu
     *
     * @class MainMenu
     * @namespace editor
     * @extends Dom
     * @constructor
     */
    function MainMenu() {
        // call parent constructor
        MainMenu.parent.call(this, '<div/>', {'class': 'main-menu clearfix'});

        this.setupUI();
    }

    metaScore.Dom.extend(MainMenu);

    /**
     * Setup the menu's UI
     *
     * @method setupUI
     * @private
     */
    MainMenu.prototype.setupUI = function(){
        var btn_group, sub_menu;

        new metaScore.Dom('<div/>', {'class': 'logo-philharmonie'})
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.new', 'New')
            })
            .data('action', 'new')
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.open', 'Open')
            })
            .data('action', 'open')
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.edit', 'Edit')
            })
            .data('action', 'edit')
            .appendTo(this);

        btn_group = new metaScore.Dom('<div/>', {'class': 'button-group'}).appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.saveDraft', 'Save as draft')
            })
            .data('action', 'save-draft')
            .appendTo(btn_group);

        sub_menu = new metaScore.Dom('<div/>', {'class': 'sub-menu'}).appendTo(btn_group);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.saveCopy', 'Save as copy')
            })
            .data('action', 'save-copy')
            .appendTo(sub_menu);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.Publish', 'Save & Publish')
            })
            .data('action', 'publish')
            .appendTo(sub_menu);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.delete', 'Delete')
            })
            .data('action', 'delete')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.download', 'Download')
            })
            .data('action', 'download')
            .disable()
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this.timefield = new metaScore.editor.field.Time()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.time', 'Time')
            })
            .addClass('time')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        this.rindexfield = new metaScore.editor.field.Number({
                'min': 0,
                'max': 999
            })
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.r-index', 'Reading index')
            })
            .addClass('r-index')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.edit-toggle', 'Toggle edit mode')
            })
            .data('action', 'edit-toggle')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.revert', 'Revert')
            })
            .data('action', 'revert')
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.undo', 'Undo')
            })
            .data('action', 'undo')
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.redo', 'Redo')
            })
            .data('action', 'redo')
            .appendTo(this);

        new metaScore.Dom('<div/>', {'class': 'separator'})
            .css('flex', '20')
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.settings', 'Settings')
            })
            .data('action', 'settings')
            .disable()
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.help', 'Help')
            })
            .data('action', 'help')
            .disable()
            .appendTo(this);

        new metaScore.editor.Button()
            .attr({
                'title': metaScore.Locale.t('editor.MainMenu.logout', 'Logout')
            })
            .data('action', 'logout')
            .appendTo(this);

    };

    /**
     * Toogle a button's enabled state
     *
     * @method toggleButton
     * @param {String} action The button's associated action
     * @param {Boolean} state The state to set the button to, the current state is toggled if not provided
     * @chainable
     */
    MainMenu.prototype.toggleButton = function(action, state){
        this.find('[data-action="'+ action +'"]').toggleClass('disabled', state === false);

        return this;
    };

    return MainMenu;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor').Overlay = (function(){

    /**
     * Fired when the overlay is shown
     *
     * @event show
     * @param {Object} overlay The overlay instance
     */
    var EVT_SHOW = 'show';

    /**
     * Fired when the overlay is hidden
     *
     * @event hide
     * @param {Object} overlay The overlay instance
     */
    var EVT_HIDE = 'hide';

    /**
     * A generic overlay class
     *
     * @class Overlay
     * @namespace editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.parent='.metaScore-editor'] The parent element in which the overlay will be appended
     * @param {Boolean} [configs.modal=true] Whether to create a mask underneath that covers its parent and does not allow the user to interact with any other Components until this is dismissed
     * @param {Boolean} [configs.draggable=true] Whether the overlay is draggable
     * @param {Boolean} [configs.autoShow=true] Whether to show the overlay automatically
     * @param {Boolean} [configs.toolbar=false] Whether to add a toolbar with title and close button
     * @param {String} [configs.title=''] The overlay's title
     */
    function Overlay(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Overlay.parent.call(this, '<div/>', {'class': 'overlay clearfix'});

        this.setupUI();

        if(this.configs.autoShow){
            this.show();
        }
    }

    Overlay.defaults = {
        'parent': '.metaScore-editor',
        'modal': true,
        'draggable': true,
        'autoShow': false,
        'toolbar': false,
        'title': ''
    };

    metaScore.Dom.extend(Overlay);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    Overlay.prototype.setupUI = function(){

        if(this.configs.modal){
            this.mask = new metaScore.Dom('<div/>', {'class': 'overlay-mask'});
        }

        if(this.configs.toolbar){
            this.toolbar = new metaScore.editor.overlay.Toolbar({'title': this.configs.title})
                .appendTo(this);

            this.toolbar.addButton('close')
                .addListener('click', metaScore.Function.proxy(this.onCloseClick, this));
        }

        this.contents = new metaScore.Dom('<div/>', {'class': 'contents'})
            .appendTo(this);

        if(this.configs.draggable){
            this.draggable = new metaScore.Draggable({'target': this, 'handle': this.configs.toolbar ? this.toolbar : this});
        }

    };

    /**
     * Show the overlay
     *
     * @method show
     * @chainable
     */
    Overlay.prototype.show = function(){
        if(this.configs.modal){
            this.mask.appendTo(this.configs.parent);
        }

        this.appendTo(this.configs.parent);

        this.triggerEvent(EVT_SHOW, {'overlay': this}, true, false);

        return this;
    };

    /**
     * Hide the overlay
     *
     * @method hide
     * @chainable
     */
    Overlay.prototype.hide = function(){
        if(this.configs.modal){
            this.mask.remove();
        }

        this.remove();

        this.triggerEvent(EVT_HIDE, {'overlay': this}, true, false);

        return this;
    };

    /**
     * Get the overlay's toolbar
     *
     * @method getToolbar
     * @return {editor.overlay.Toolbar} The toolbar
     */
    Overlay.prototype.getToolbar = function(){
        return this.toolbar;
    };

    /**
     * Get the overlay's contents
     *
     * @method getContents
     * @return {Dom} The contents
     */
    Overlay.prototype.getContents = function(){
        return this.contents;
    };

    /**
     * The close button's click handler
     *
     * @method onCloseClick
     * @private
     * @param {Event} evt The event object
     */
    Overlay.prototype.onCloseClick = function(evt){
        this.hide();
    };

    return Overlay;

})();
/** 
 * @module Editor
 */

metaScore.namespace('editor').Panel = (function(){

    /**
     * Fired before a component is set
     *
     * @event componentbeforeset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTBEFORESET = 'componentbeforeset';

    /**
     * Fired when a component is set
     *
     * @event componentset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTSET = 'componentset';

    /**
     * Fired when a component is unset
     *
     * @event componentunset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTUNSET = 'componentunset';

    /**
     * Fired when a component's values change
     *
     * @event valueschange
     * @param {Object} component The component instance
     * @param {Object} old_values The component instance
     * @param {Object} new_values The component instance
     */
    var EVT_VALUESCHANGE = 'valueschange';

    /**
     * A generic panel class
     *
     * @class Panel
     * @namespace editor
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function Panel(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Panel.parent.call(this, '<div/>', {'class': 'panel'});

        // fix event handlers scope
        this.onComponentDragStart = metaScore.Function.proxy(this.onComponentDragStart, this);
        this.onComponentDrag = metaScore.Function.proxy(this.onComponentDrag, this);
        this.onComponentDragEnd = metaScore.Function.proxy(this.onComponentDragEnd, this);
        this.onComponentResizeStart = metaScore.Function.proxy(this.onComponentResizeStart, this);
        this.onComponentResize = metaScore.Function.proxy(this.onComponentResize, this);
        this.onComponentResizeEnd = metaScore.Function.proxy(this.onComponentResizeEnd, this);

        this.toolbar = new metaScore.editor.panel.Toolbar(this.configs.toolbarConfigs)
            .addDelegate('.buttons [data-action]', 'click', metaScore.Function.proxy(this.onToolbarButtonClick, this))
            .appendTo(this);

        this.toolbar.getTitle()
            .addListener('click', metaScore.Function.proxy(this.toggleState, this));

        this.contents = new metaScore.Dom('<div/>', {'class': 'fields'})
            .appendTo(this);

        this
            .addDelegate('.fields .field', 'valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .unsetComponent();
    }

    Panel.defaults = {
        'toolbarConfigs': {}
    };

    metaScore.Dom.extend(Panel);

    /**
     * Setup the panel's fields
     *
     * @method setupFields
     * @private
     * @param {Object} properties The properties description object
     * @chainable
     */
    Panel.prototype.setupFields = function(properties){
        var configs, fieldType, field;

        this.fields = {};
        this.contents.empty();

        metaScore.Object.each(properties, function(key, prop){
            if(prop.editable !== false){
                configs = prop.configs || {};

                field = new metaScore.editor.field[prop.type](configs)
                    .data('name', key)
                    .appendTo(this.contents);

                this.fields[key] = field;
            }
        }, this);

        return this;
    };

    /**
     * Get the panel's toolbar
     *
     * @method getToolbar
     * @return {editor.panel.Toolbar} The toolbar
     */
    Panel.prototype.getToolbar = function(){
        return this.toolbar;
    };

    /**
     * Get a field by name
     *
     * @method getField
     * @param {String} name The name of the field to get
     * @return {editor.Field} The field
     */
    Panel.prototype.getField = function(name){
        if(name === undefined){
            return this.fields;
        }

        return this.fields[name];
    };

    /**
     * Enable all fields
     *
     * @method enableFields
     * @chainable
     */
    Panel.prototype.enableFields = function(){
        metaScore.Object.each(this.fields, function(key, field){
            field.enable();
        }, this);
        
        return this;
    };

    /**
     * Show a field by name
     *
     * @method showField
     * @param {String} name The name of the field to show
     * @chainable
     */
    Panel.prototype.showField = function(name){
        this.getField(name).show();

        return this;
    };

    /**
     * Hide a field by name
     *
     * @method hideField
     * @param {String} name The name of the field to show
     * @chainable
     */
    Panel.prototype.hideField = function(name){
        this.getField(name).hide();

        return this;
    };

    /**
     * Toggle the panel's collapsed state
     *
     * @method toggleState
     * @chainable
     */
    Panel.prototype.toggleState = function(){
        this.toggleClass('collapsed');

        return this;
    };

    /**
     * Disable the panel
     *
     * @method disable
     * @chainable
     */
    Panel.prototype.disable = function(){
        this.addClass('disabled');

        return this;
    };

    /**
     * Enable the panel
     *
     * @method enable
     * @chainable
     */
    Panel.prototype.enable = function(){
        this.removeClass('disabled');

        return this;
    };

    /**
     * Get the currently associated component
     *
     * @method getComponent
     * @return {player.Component} The component
     */
    Panel.prototype.getComponent = function(){
        return this.component;
    };

    /**
     * Set the associated component
     *
     * @method setComponent
     * @param {player.Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Panel.prototype.setComponent = function(component, supressEvent){
        if(component !== this.getComponent()){
            if(!component){
                return this.unsetComponent();
            }

            this.unsetComponent(true);

            this.triggerEvent(EVT_COMPONENTBEFORESET, {'component': component}, false);

            this.component = component;

            this
                .setupFields(this.component.configs.properties)
                .updateFieldValues(this.getValues(Object.keys(this.getField())), true)
                .updateDraggable(true)
                .updateResizable(true)
                .addClass('has-component');

            this.getToolbar().getSelector().setValue(component.getId(), true);

            if(!component.instanceOf('Controller') && !component.instanceOf('Media')){
                this.getToolbar().toggleMenuItem('delete', true);
            }

            component
                .addClass('selected')
                .addListener('dragstart', this.onComponentDragStart)
                .addListener('drag', this.onComponentDrag)
                .addListener('dragend', this.onComponentDragEnd)
                .addListener('resizestart', this.onComponentResizeStart)
                .addListener('resize', this.onComponentResize)
                .addListener('resizeend', this.onComponentResizeEnd);

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTSET, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Unset the associated component
     *
     * @method unsetComponent
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Panel.prototype.unsetComponent = function(supressEvent){
        var component = this.getComponent(),
            toolbar = this.getToolbar();

        this.removeClass('has-component');
        toolbar.toggleMenuItem('delete', false);

        if(component){
            this
                .updateDraggable(false)
                .updateResizable(false);

            toolbar.getSelector().setValue(null, true);

            component
                .removeClass('selected')
                .removeListener('dragstart', this.onComponentDragStart)
                .removeListener('drag', this.onComponentDrag)
                .removeListener('dragend', this.onComponentDragEnd)
                .removeListener('resizestart', this.onComponentResizeStart)
                .removeListener('resize', this.onComponentResize)
                .removeListener('resizeend', this.onComponentResizeEnd);

            delete this.component;

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTUNSET, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Set or unset the draggability of the associated component
     *
     * @method updateDraggable
     * @private
     * @param {Boolean} draggable Whether the component should be draggable
     * @chainable
     */
    Panel.prototype.updateDraggable = function(draggable){
        var component = this.getComponent();

        draggable = metaScore.Var.is(component.setDraggable, 'function') ? component.setDraggable(draggable) : false;

        this.toggleFields(['x', 'y'], draggable ? true : false);

        return this;
    };

    /**
     * Set or unset the resizability of the associated component
     *
     * @method updateResizable
     * @private
     * @param {Boolean} resizable Whether the component should be resizable
     * @chainable
     */
    Panel.prototype.updateResizable = function(resizable){
        var component = this.getComponent();

        resizable = metaScore.Var.is(component.setResizable, 'function') ? component.setResizable(resizable) : false;

        this.toggleFields(['width', 'height'], resizable ? true : false);

        return this;
    };

    /**
     * The toolbar buttons' click event handler
     *
     * @method onToolbarButtonClick
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onToolbarButtonClick = function(evt){
        var selector, options, count, index,
            action = metaScore.Dom.data(evt.target, 'action');

        switch(action){
            case 'previous':
                selector = this.getToolbar().getSelector();
                options = selector.find('option[value^="component"]');
                count = options.count();

                if(count > 0){
                    index = options.index(':checked') - 1;

                    if(index < 0){
                        index = count - 1;
                    }

                    selector.setValue(new metaScore.Dom(options.get(index)).val());
                }

                evt.stopPropagation();
                break;

            case 'next':
                selector = this.getToolbar().getSelector();
                options = selector.find('option[value^="component"]');
                count = options.count();

                if(count > 0){
                    index = options.index(':checked') + 1;

                    if(index >= count){
                        index = 0;
                    }

                    selector.setValue(new metaScore.Dom(options.get(index)).val());
                }

                evt.stopPropagation();
                break;
        }
    };

    /**
     * The component's dragstart event handler
     *
     * @method onComponentDragStart
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentDragStart = function(evt){
        var fields = ['x', 'y'];

        this._beforeDragValues = this.getValues(fields);
    };

    /**
     * The component's drag event handler
     *
     * @method onComponentDrag
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentDrag = function(evt){
        var fields = ['x', 'y'];

        this.updateFieldValues(fields, true);
    };

    /**
     * The component's dragend event handler
     *
     * @method onComponentDragEnd
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentDragEnd = function(evt){
        var component = this.getComponent(),
            fields = ['x', 'y'];

        this.updateFieldValues(fields, true);

        this.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': this._beforeDragValues, 'new_values': this.getValues(fields)}, false);

        delete this._beforeDragValues;
    };

    /**
     * The component's resizestart event handler
     *
     * @method onComponentResizeStart
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentResizeStart = function(evt){
        var fields = ['x', 'y', 'width', 'height'];

        this._beforeResizeValues = this.getValues(fields);
    };

    /**
     * The component's resize event handler
     *
     * @method onComponentResize
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentResize = function(evt){
        var fields = ['x', 'y', 'width', 'height'];

        this.updateFieldValues(fields, true);
    };

    /**
     * The component's resizeend event handler
     *
     * @method onComponentResizeEnd
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onComponentResizeEnd = function(evt){
        var component = this.getComponent(),
            fields = ['x', 'y', 'width', 'height'];

        this.updateFieldValues(fields, true);

        this.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': this._beforeResizeValues, 'new_values': this.getValues(fields)}, false);

        delete this._beforeResizeValues;
    };

    /**
     * The fields' valuechange event handler
     *
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    Panel.prototype.onFieldValueChange = function(evt){
        var component = this.getComponent(),
            name, value, old_values;

        if(!component){
            return;
        }

        name = evt.detail.field.data('name');
        value = evt.detail.value;
        old_values = this.getValues([name]);

        component.setProperty(name, value);

        switch(name){
            case 'locked':
                this.updateDraggable(!value);
                this.updateResizable(!value);
                break;

            case 'name':
                this.getToolbar().getSelector().updateOption(component.getId(), value);
                break;

            case 'start-time':
                this.getField('end-time').setMin(value);
                break;

            case 'end-time':
                this.getField('start-time').setMax(value);
                break;
        }

        this.triggerEvent(EVT_VALUESCHANGE, {'component': component, 'old_values': old_values, 'new_values': this.getValues([name])}, false);
    };

    /**
     * Update a field's value
     *
     * @method updateFieldValue
     * @param {String} name The field's name
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Panel.prototype.updateFieldValue = function(name, value, supressEvent){
        this.getField(name).setValue(value, supressEvent);

        return this;
    };

    /**
     * Update fields' values
     *
     * @method updateFieldValues
     * @param {Object} values A list of values with the field names as keys
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    Panel.prototype.updateFieldValues = function(values, supressEvent){
        if(metaScore.Var.is(values, 'array')){
            metaScore.Array.each(values, function(index, field){
                this.updateFieldValue(field, this.getValue(field), supressEvent);
            }, this);
        }
        else{
            metaScore.Object.each(values, function(field, value){
                this.updateFieldValue(field, value, supressEvent);
            }, this);
        }

        return this;
    };

    /**
     * Update a component's properties
     *
     * @method updateProperties
     * @param {player.Component} component The component to update
     * @param {Object} values A list of values with the property names as keys
     * @chainable
     */
    Panel.prototype.updateProperties = function(component, values){
        metaScore.Object.each(values, function(name, value){
            if(!this.getField(name).disabled){
                component.setProperty(name, value);
            }
        }, this);

        this.updateFieldValues(values, true);

        return this;
    };

    /**
     * Toggle the enabled state of some fields
     *
     * @method toggleFields
     * @param {Array} names The list of field names to toggle
     * @param {Boolean} toggle Whether the fields are to be enabled or disabled
     * @chainable
     */
    Panel.prototype.toggleFields = function(names, toggle){
        var field;

        metaScore.Array.each(names, function(index, name){
            if(field = this.getField(name)){
                if(toggle){
                    field.enable();
                }
                else{
                    field.disable();
                }
            }
        }, this);

        return this;
    };

    /**
     * Get the associated component's property value
     *
     * @method getValue
     * @param {String} name The propoerty's name
     * @return {Mixed} The value
     */
    Panel.prototype.getValue = function(name){
        return this.getComponent().getProperty(name);
    };

    /**
     * Get the associated component's properties values
     *
     * @method getValues
     * @param {Array} [names] The names of properties, if not set, the panel's field names are used
     * @return {Object} A list of values keyed by property name
     */
    Panel.prototype.getValues = function(names){
        var values = {};

        names = names || Object.keys(this.getField());

        metaScore.Array.each(names, function(index, name){
            if(!this.getField(name).disabled){
                values[name] = this.getValue(name);
            }
        }, this);

        return values;
    };

    return Panel;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Boolean = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A boolean field based on an HTML input[type=checkbox] element
     *
     * @class Boolean
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.checked=false] Whether the field is checked by default
     * @param {Boolean} [configs.checked_value=true] The value when checked
     * @param {Boolean} [configs.unchecked_value=false] The value when unchecked
     */
    function BooleanField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        BooleanField.parent.call(this, this.configs);

        this.addClass('booleanfield');

        this.setValue(this.configs.checked ? this.configs.checked_value : this.configs.unchecked_value);
    }

    BooleanField.defaults = {
        'checked': false,
        'checked_value': true,
        'unchecked_value': false
    };

    metaScore.editor.Field.extend(BooleanField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    BooleanField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<input/>', {'type': 'checkbox', 'id': uid})
            .addListener('click', metaScore.Function.proxy(this.onClick, this))
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    BooleanField.prototype.onClick = function(evt){
        if(this.is_readonly){
            evt.preventDefault();
        }
    };

    /**
     * The change event handler
     * 
     * @method onChange
     * @private
     * @param {Event} evt The event object
     */
    BooleanField.prototype.onChange = function(evt){
        if(this.is_readonly){
            evt.preventDefault();
            return;
        }

        if(this.input.is(":checked")){
            this.value = this.configs.checked_value;
            this.addClass('checked');
        }
        else{
            this.value = this.configs.unchecked_value;
            this.removeClass('checked');
        }

        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    BooleanField.prototype.setValue = function(value, supressEvent){
        this.input.get(0).checked = value === this.configs.checked_value;

        if(supressEvent !== true){
            this.input.triggerEvent('change');
        }

        return this;
    };

    return BooleanField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').BorderRadius = (function () {

    /**
     * A complex field for defining CSS border radius values
     * 
     * @class BorderRadius
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     */
    function BorderRadiusrField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        BorderRadiusrField.parent.call(this, this.configs);

        this.addClass('borderradiusrfield');
    }

    metaScore.editor.Field.extend(BorderRadiusrField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    BorderRadiusrField.prototype.setupUI = function(){
        BorderRadiusrField.parent.prototype.setupUI.call(this);

        this.input
            .attr('readonly', 'readonly')
            .addListener('click', metaScore.Function.proxy(this.onClick, this));

        this.overlay = new metaScore.editor.overlay.BorderRadius()
            .addListener('submit', metaScore.Function.proxy(this.onOverlaySubmit, this));

        this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
            .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
            .appendTo(this.input_wrapper);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Mixed} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    BorderRadiusrField.prototype.setValue = function(value, supressEvent){
        BorderRadiusrField.parent.prototype.setValue.call(this, value, supressEvent);

        this.input.attr('title', value);

        return this;
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    BorderRadiusrField.prototype.onClick = function(evt){
        if(this.disabled){
            return;
        }

        this.overlay
            .setValue(this.value)
            .show();
    };

    /**
     * The overlay's submit event handler
     * 
     * @method onOverlaySubmit
     * @private
     * @param {Event} evt The event object
     */
    BorderRadiusrField.prototype.onOverlaySubmit = function(evt){
        var value = evt.detail.value,
            overlay = evt.detail.overlay;

        this.setValue(value);
    };

    /**
     * The clear button's click event handler
     * 
     * @method onClearClick
     * @private
     * @param {Event} evt The event object
     */
    BorderRadiusrField.prototype.onClearClick = function(evt){
        this.setValue('0px');
    };

    return BorderRadiusrField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Buttons = (function () {

    /**
     * Fired when a value is selected though a button click
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The clicked button's key
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A simple buttons field based on HTML button elements
     *
     * @class ButtonsField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.buttons={}}] The list of buttons as name/attributes pairs
     */
    function ButtonsField(configs) {
        this.configs = this.getConfigs(configs);

        this.buttons = {};

        // fix event handlers scope
        this.onClick = metaScore.Function.proxy(this.onClick, this);

        // call parent constructor
        ButtonsField.parent.call(this, this.configs);

        this.addClass('buttonsfield');
    }

    ButtonsField.defaults = {
        'buttons': {}
    };

    metaScore.editor.Field.extend(ButtonsField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    ButtonsField.prototype.setupUI = function(){
        var field = this;

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        metaScore.Object.each(this.configs.buttons, function(name, attr){
            this.buttons[name] = new metaScore.Dom('<button/>', attr)
                .addListener('click', function(){
                    field.triggerEvent(EVT_VALUECHANGE, {'field': field, 'value': name}, true, false);
                })
                .appendTo(this.input_wrapper);
        }, this);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @chainable
     */
    ButtonsField.prototype.setValue = function(){
        return this;
    };

    /**
     * Get the list of buttons
     * 
     * @method getButtons
     * @return {Object} The list of buttons as a name/Dom pair
     */
    ButtonsField.prototype.getButtons = function(){
        return this.buttons;
    };

    /**
     * Get a button by name
     * 
     * @method getButton
     * @param {String} name The button's name
     * @return {Dom} The button's Dom object
     */
    ButtonsField.prototype.getButton = function(name){
        return this.buttons[name];
    };

    return ButtonsField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Color = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A color selection field
     *
     * @class ColorField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Mixed} [configs.value={r:255, g:255, b:255, a:1}}] The default value (see {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}} for valid values)
     */
    function ColorField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        ColorField.parent.call(this, this.configs);

        this.addClass('colorfield');
    }

    ColorField.defaults = {
        value: {
            r: 255,
            g: 255,
            b: 255,
            a: 1
        }
    };

    metaScore.editor.Field.extend(ColorField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    ColorField.prototype.setupUI = function(){
        ColorField.parent.prototype.setupUI.call(this);

        this.input
            .attr('readonly', 'readonly')
            .addListener('click', metaScore.Function.proxy(this.onClick, this));

        this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
            .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
            .appendTo(this.input_wrapper);

        this.overlay = new metaScore.editor.overlay.ColorSelector()
            .addListener('submit', metaScore.Function.proxy(this.onOverlaySubmit, this));
    };

    /**
     * Set the field'S value
     * 
     * @method setValue
     * @param {Mixed} value The new color's value (see {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}} for valid values)
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    ColorField.prototype.setValue = function(value, supressEvent){
        var rgba;

        this.value = value ? metaScore.Color.parse(value) : null;

        rgba = this.value ? 'rgba('+ this.value.r +','+ this.value.g +','+ this.value.b +','+ this.value.a +')' : null;

        this.input
            .attr('title', rgba)
            .css('background-color', rgba);

        if(supressEvent !== true){
            this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
        }

        return this;

    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    ColorField.prototype.onClick = function(evt){
        if(this.disabled){
            return;
        }

        this.overlay
            .setValue(metaScore.Object.copy(this.value))
            .show();
    };

    /**
     * The overlay's submit event handler
     * 
     * @method onOverlaySubmit
     * @private
     * @param {Event} evt The event object
     */
    ColorField.prototype.onOverlaySubmit = function(evt){
        var value = evt.detail.value,
            overlay = evt.detail.overlay;

        this.setValue(value);
    };

    /**
     * The clear button click event handler
     * 
     * @method onClearClick
     * @private
     * @param {Event} evt The event object
     */
    ColorField.prototype.onClearClick = function(evt){
        this.setValue(null);
    };

    return ColorField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').File = (function () {

    /**
     * A file field based on an HTML input[type=file] element
     *
     * @class FileField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.accept=null] The list of accepted file types (see {{#crossLink "editor.field.FileField/setAcceptedTypes:method"}}{{/crossLink}})
     */
    function FileField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        FileField.parent.call(this, this.configs);

        if(this.configs.accept){
            this.setAcceptedTypes(this.configs.accept);
        }

        this.addClass('filefield');
    }

    FileField.defaults = {
        'accept': null
    };

    metaScore.editor.Field.extend(FileField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    FileField.prototype.setupUI = function(){
        FileField.parent.prototype.setupUI.call(this);

        this.input.attr('type', 'file');

        this.current = new metaScore.Dom('<div/>')
            .appendTo(this.input_wrapper);
    };

    /**
     * Set the accepted file types
     * 
     * @method setAcceptedTypes
     * @param {String} types A comma seperated list of accepted file types (ex: ".gif,.jpg,.png,.doc" or "audio/*,video/*,image/*")
     */
    FileField.prototype.setAcceptedTypes = function(types){
        this.input.attr('accept', types);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Object} [value] The new value
     * @param {String} value.name The file's name
     * @param {String} [value.url] The file's url
     * @chainable
     */
    FileField.prototype.setValue = function(value){
        var info;

        this.current.empty();

        this.input.val('');

        if(value && ('name' in value)){
            info = new metaScore.Dom('<a/>', {'text': value.name})
                .attr('target', '_blank')
                .appendTo(this.current);

            if('url' in value){
                info.attr('href', value.url);
            }
        }

        return this;
    };

    /**
     * Helper function to get a selected file from the HTML input field
     * 
     * @method getFile
     * @private
     * @param {Integer} [index] The index of the selected file, all files will be returned if not provided
     * @return {Mixed} The <a href="https://developer.mozilla.org/en-US/docs/Web/API/File" target="_blank">File</a> or <a href="https://developer.mozilla.org/en/docs/Web/API/FileList" target="_blank">FileList</a>
     */
    FileField.prototype.getFile = function(index){
        var files = this.input.get(0).files;

        if(index !== undefined){
            return files[index];
        }

        return files;
    };

    return FileField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Image = (function () {

    /**
     * Fired when the external filebrowser should be opened
     *
     * @event filebrowser
     * @param {Function} callback The callback to invoke once a file is selected throught the external file browser
     */
    var EVT_FILEBROWSER = 'filebrowser';

    /**
     * An image field wich depends on an external file browser to function
     *
     * @class ImageField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.placeholder="Browse..."] A placeholder text
     */
    function ImageField(configs) {
        this.configs = this.getConfigs(configs);

        // fix event handlers scope
        this.onFileSelect = metaScore.Function.proxy(this.onFileSelect, this);

        // call parent constructor
        ImageField.parent.call(this, this.configs);

        this.addClass('imagefield');
    }

    ImageField.defaults = {
        'placeholder': metaScore.Locale.t('editor.field.Image.placeholder', 'Browse...')
    };

    metaScore.editor.Field.extend(ImageField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    ImageField.prototype.setupUI = function(){
        ImageField.parent.prototype.setupUI.call(this);

        this.input
            .attr('readonly', 'readonly')
            .attr('placeholder', this.configs.placeholder)
            .addListener('click', metaScore.Function.proxy(this.onClick, this));

        this.clear = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'clear'})
            .addListener('click', metaScore.Function.proxy(this.onClearClick, this))
            .appendTo(this.input_wrapper);
    };

    /**
     * Set the field'S value
     * 
     * @method setValue
     * @param {String} value The image file's url
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    ImageField.prototype.setValue = function(value, supressEvent){
        ImageField.parent.prototype.setValue.call(this, value, supressEvent);

        this.input.attr('title', value);

        return this;
    };

    /**
     * The click event handler
     * 
     * @method onClick
     * @private
     * @param {Event} evt The event object
     */
    ImageField.prototype.onClick = function(evt){
        if(this.disabled){
            return;
        }

        this.triggerEvent(EVT_FILEBROWSER, {'callback': this.onFileSelect}, true, false);
    };

    /**
     * The clear button click event handler
     * 
     * @method onClearClick
     * @private
     * @param {Event} evt The event object
     */
    ImageField.prototype.onClearClick = function(evt){
        this.setValue(null);
    };

    /**
     * The file select event handler
     * 
     * @method onFileSelect
     * @private
     * @param {String} url The image file's url
     */
    ImageField.prototype.onFileSelect = function(url){
        this.setValue(url);
    };

    return ImageField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Number = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * A number field based on an HTML input[type=number] element
     *
     * @class NumberField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Number} [configs.value=0] The default value
     * @param {Number} [configs.min=null] The minimum allowed value
     * @param {Number} [configs.max=null] The maximum allowed value
     * @param {Number} [configs.step=1] The spin up/down step amount
     * @param {Boolean} [configs.spinButtons=true] Whether to show the in spin buttons
     * @param {Integer} [configs.spinInterval=200] The speed of the spinner buttons
     * @param {String} [configs.spinDirection='horizontal'] The direction of the spin buttons
     */
    function NumberField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        NumberField.parent.call(this, this.configs);
        
        this.spinDown = metaScore.Function.proxy(this.spinDown, this);
        this.spinUp = metaScore.Function.proxy(this.spinUp, this);

        this.addClass('numberfield');
    }

    NumberField.defaults = {
        'value': 0,
        'min': null,
        'max': null,
        'step': 1,
        'spinButtons': true,
        'spinInterval': 200,
        'spinDirection': 'horizontal'
    };

    metaScore.editor.Field.extend(NumberField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    NumberField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5),
            buttons;

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<input/>', {'type': 'text', 'id': uid})
            .addListener('input', metaScore.Function.proxy(this.onInput, this))
            .addListener('mousewheel', metaScore.Function.proxy(this.onMouseWheel, this))
            .addListener('DOMMouseScroll', metaScore.Function.proxy(this.onMouseWheel, this))
            .addListener('keydown', metaScore.Function.proxy(this.onKeyDown, this))
            .appendTo(this.input_wrapper);

        if(this.configs.spinButtons){
            buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
                .appendTo(this.input_wrapper);
                
            this.spindown_btn = new metaScore.Dom('<button/>', {'text': '-', 'data-action': 'spin-down'})
                .addListener('mousedown', metaScore.Function.proxy(this.onSpinBtnMouseDown, this))
                .addListener('mouseup', metaScore.Function.proxy(this.onSpinBtnMouseUp, this))
                .addListener('mouseout', metaScore.Function.proxy(this.onSpinBtnMouseOut, this))
                .appendTo(buttons);
                
            this.spinup_btn = new metaScore.Dom('<button/>', {'text': '+', 'data-action': 'spin-up'})
                .addListener('mousedown', metaScore.Function.proxy(this.onSpinBtnMouseDown, this))
                .addListener('mouseup', metaScore.Function.proxy(this.onSpinBtnMouseUp, this))
                .addListener('mouseout', metaScore.Function.proxy(this.onSpinBtnMouseOut, this))
                .appendTo(buttons);
        }
        
        this.addClass(this.configs.spinDirection === 'vertical' ? 'vertical' : 'horizontal');

        this.addListener('change', metaScore.Function.proxy(this.onChange, this));
    };

    /**
     * The change event handler
     * 
     * @method onChange
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onChange = function(evt){
        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * The input event handler
     * 
     * @method onInput
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onInput = function(evt){
        this.setValue(this.input.val());
        
        evt.stopPropagation();
    };

    /**
     * The mousewheel event handler
     * 
     * @method onMouseWheel
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onMouseWheel = function(evt){
        if(this.input.is(':focus')){
            if(evt.wheelDelta > 0){
                this.setValue(this.getValue() + this.configs.step);
            }
            else{
                this.setValue(this.getValue() - this.configs.step);
            }
        
            evt.preventDefault();
        }
    };

    /**
     * The keydown event handler
     * 
     * @method onKeyDown
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onKeyDown = function(evt){
        switch(evt.keyCode){
            case 38:
                this.spinUp();
                evt.preventDefault();
                break;
                
            case 40:
                this.spinDown();
                evt.preventDefault();
                break;
        }
    };

    /**
     * The spin button's mousedown event handler
     * 
     * @method onSpinBtnMouseDown
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onSpinBtnMouseDown = function(evt){
        var fn;

        switch(metaScore.Dom.data(evt.target, 'action')){
            case 'spin-down':
                fn = this.spinDown;
                break;
                
            default:
                fn = this.spinUp;
        }
        
        fn();
        
        this.interval = setInterval(fn, this.configs.spinInterval);
    };

    /**
     * The spin button's mouseup event handler
     * 
     * @method onSpinBtnMouseUp
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onSpinBtnMouseUp = function(evt){
        clearInterval(this.interval);
    };

    /**
     * The spin button's mouseout event handler
     * 
     * @method onSpinBtnMouseOut
     * @private
     * @param {Event} evt The event object
     */
    NumberField.prototype.onSpinBtnMouseOut = NumberField.prototype.onSpinBtnMouseUp;

    /**
     * Decrement the value by one step
     * 
     * @method spinDown
     * @private
     */
    NumberField.prototype.spinDown = function(){
        this.setValue(this.getValue() - this.configs.step);
    };

    /**
     * Increment the value by one step
     * 
     * @method spinUp
     * @private
     */
    NumberField.prototype.spinUp = function(){
        this.setValue(this.getValue() + this.configs.step);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Number} value The new value
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    NumberField.prototype.setValue = function(value, supressEvent){
        value = parseFloat(value);
        
        if(!isNaN(value)){
            this.value = value;
        }
        else if(isNaN(this.value)){
            this.value = 0;
        }

        if(this.configs.min !== null){
            this.value = Math.max(this.value, this.configs.min);
        }
        if(this.configs.max !== null){
            this.value = Math.min(this.value, this.configs.max);
        }
        
        this.input.val(this.value);
    
        if(supressEvent !== true){
            this.triggerEvent('change');
        }

        return this;
    };

    /**
     * Set the minimum allowed value
     * 
     * @method setMin
     * @param {Number} value The minimum allowed value
     * @chainable
     */
    NumberField.prototype.setMin = function(value){
        this.configs.min = value;

        if(this.getValue() < value){
            this.setValue(value);
        }

        return this;
    };

    /**
     * Set the maximum allowed value
     * 
     * @method setMax
     * @param {Number} value The maximum allowed value
     * @chainable
     */
    NumberField.prototype.setMax = function(value){
        this.configs.max = value;

        if(this.getValue() > value){
            this.setValue(value);
        }

        return this;
    };

    return NumberField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Select = (function () {

    /**
     * A select list field based on an HTML select element
     *
     * @class SelectField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.options={}}] A list of select options as key/value pairs
     */
    function SelectField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        SelectField.parent.call(this, this.configs);

        this.addClass('selectfield');
    }

    SelectField.defaults = {
        'options': {}
    };

    metaScore.editor.Field.extend(SelectField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    SelectField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<select/>', {'id': uid})
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);

            metaScore.Object.each(this.configs.options, function(key, value){
                this.addOption(key, value);
            }, this);
    };

    /**
     * Adds an option group to the select list
     * 
     * @method addGroup
     * @param {String} label The group's text label
     * @return {Dom} The created Dom object
     */
    SelectField.prototype.addGroup = function(label){
        var group = new metaScore.Dom('<optgroup/>', {'label': label});

        this.input.append(group);

        return group;
    };

    /**
     * Add an option to the select list
     * 
     * @method addOption
     * @param {String} value The option's value
     * @param {String} text The option's label
     * @param {Dom} [group] The group to append the option to, it will be appended to the root list if not specified
     * @return {Dom} The created Dom object
     */
    SelectField.prototype.addOption = function(value, text, group){
        var option = new metaScore.Dom('<option/>', {'value': value, 'text': text});

        option.appendTo(group ? group : this.input);

        return option;
    };

    /**
     * Update an option's label by value
     * 
     * @method updateOption
     * @param {String} value The value of the option to update
     * @param {String} text The new label's text
     * @return {Dom} The option's Dom object
     */
    SelectField.prototype.updateOption = function(value, text){
        var option = this.input.find('option[value="'+ value +'"]');

        option.text(text);

        return option;
    };

    /**
     * Remove an option by value
     * 
     * @method removeOption
     * @param {String} value The value of the option to remove
     * @return {Dom} The option's Dom object
     */
    SelectField.prototype.removeOption = function(value){
        var option = this.input.find('option[value="'+ value +'"]');

        option.remove();

        return option;
    };

    /**
     * Remove all groups and options
     * 
     * @method clear
     * @chainable
     */
    SelectField.prototype.clear = function(){
        this.input.empty();

        return this;
    };

    /**
     * Toggle the readonly attribute of the field
     * 
     * @method readonly
     * @param {Boolean} [readonly] Whether the field should be readonly, the current state is toggled if not provided
     * @chainable
     */
    SelectField.prototype.readonly = function(readonly){
        SelectField.parent.prototype.readonly.call(this, readonly);

        this.input.attr('disabled', this.is_readonly ? "disabled" : null);

        return this;
    };

    return SelectField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Text = (function () {

    /**
     * A single-line text field based on an HTML input[type=text] element
     *
     * @class TextField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.value=''] The default value
     */
    function TextField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        TextField.parent.call(this, this.configs);

        this.addClass('textfield');
    }

    TextField.defaults = {
        'value': ''
    };

    metaScore.editor.Field.extend(TextField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    TextField.prototype.setupUI = function(){
        TextField.parent.prototype.setupUI.call(this);

        this.input.attr('type', 'text');
    };

    return TextField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Textarea = (function () {

    /**
     * A multi-line text field based on an HTML textarea element
     *
     * @class TextareaField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.value=''] The default value
     */
    function TextareaField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        TextareaField.parent.call(this, this.configs);

        this.addClass('textareafield');
    }

    TextareaField.defaults = {
        'value': ''
    };

    metaScore.editor.Field.extend(TextareaField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    TextareaField.prototype.setupUI = function(){
        var uid = 'field-'+ metaScore.String.uuid(5);

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'for': uid, 'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        this.input = new metaScore.Dom('<textarea></textarea>', {'id': uid})
            .addListener('change', metaScore.Function.proxy(this.onChange, this))
            .appendTo(this.input_wrapper);
    };

    return TextareaField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.field').Time = (function () {

    /**
     * Fired when the field's value changes
     *
     * @event valuechange
     * @param {Object} field The field instance
     * @param {Mixed} value The new value
     */
    var EVT_VALUECHANGE = 'valuechange';

    /**
     * Fired when the in button is clicked
     *
     * @event valuein
     */
    var EVT_VALUEIN = 'valuein';

    /**
     * Fired when the out button is clicked
     *
     * @event valueout
     */
    var EVT_VALUEOUT = 'valueout';

    /**
     * A time field for entering time values in hours:minutes:seconds:centiseconds format with optional in/out buttons
     *
     * @class TimeField
     * @namespace editor.field
     * @extends editor.Field
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Number} [configs.value=0] The default value
     * @param {Number} [configs.min=0] The minimum allowed value
     * @param {Number} [configs.max=null] The maximum allowed value
     * @param {Boolean} [configs.checkbox=false] Whether to show the enable/disable checkbox
     * @param {Boolean} [configs.inButton=false] Whether to show the in button
     * @param {Boolean} [configs.outButton=false] Whether to show the out button
     */
    function TimeField(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        TimeField.parent.call(this, this.configs);

        this.addClass('timefield');
    }

    TimeField.defaults = {
        'value': 0,
        'min': 0,
        'max': null,
        'checkbox': false,
        'inButton': false,
        'outButton': false
    };

    metaScore.editor.Field.extend(TimeField);

    /**
     * Setup the field's UI
     *
     * @method setupUI
     * @private
     */
    TimeField.prototype.setupUI = function(){
        var buttons;

        if(this.configs.label){
            this.label = new metaScore.Dom('<label/>', {'text': this.configs.label})
                .appendTo(this);
        }

        this.input_wrapper = new metaScore.Dom('<div/>', {'class': 'input-wrapper'})
            .appendTo(this);

        if(this.configs.checkbox){
            this.checkbox = new metaScore.Dom('<input/>', {'type': 'checkbox'})
                .addListener('change', metaScore.Function.proxy(this.onInput, this))
                .appendTo(this.input_wrapper);
         }

        this.hours = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'hours'})
            .addListener('input', metaScore.Function.proxy(this.onInput, this))
            .appendTo(this.input_wrapper);

        new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'})
            .appendTo(this.input_wrapper);

        this.minutes = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'minutes'})
            .addListener('input', metaScore.Function.proxy(this.onInput, this))
            .appendTo(this.input_wrapper);

        new metaScore.Dom('<span/>', {'text': ':', 'class': 'separator'})
            .appendTo(this.input_wrapper);

        this.seconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'seconds'})
            .addListener('input', metaScore.Function.proxy(this.onInput, this))
            .appendTo(this.input_wrapper);

        new metaScore.Dom('<span/>', {'text': '.', 'class': 'separator'})
            .appendTo(this.input_wrapper);

        this.centiseconds = new metaScore.Dom('<input/>', {'type': 'number', 'class': 'centiseconds'})
            .addListener('input', metaScore.Function.proxy(this.onInput, this))
            .appendTo(this.input_wrapper);

        if(this.configs.inButton || this.configs.outButton){
            buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
                .appendTo(this.input_wrapper);

            if(this.configs.inButton){
                this.in = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'in'})
                    .addListener('click', metaScore.Function.proxy(this.onInClick, this))
                    .appendTo(buttons);
            }

            if(this.configs.outButton){
                this.out = new metaScore.Dom('<button/>', {'text': '.', 'data-action': 'out'})
                    .addListener('click', metaScore.Function.proxy(this.onOutClick, this))
                    .appendTo(buttons);
            }
        }

        this.addListener('change', metaScore.Function.proxy(this.onChange, this));
    };

    /**
     * The change event handler
     * 
     * @method onChange
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onChange = function(evt){
        this.triggerEvent(EVT_VALUECHANGE, {'field': this, 'value': this.value}, true, false);
    };

    /**
     * The input event handler
     * 
     * @method onInput
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onInput = function(evt){
        var active = this.isActive(),
            centiseconds_val, seconds_val, minutes_val, hours_val;

        if(active){
            centiseconds_val = parseInt(this.centiseconds.val(), 10) || 0;
            seconds_val = parseInt(this.seconds.val(), 10) || 0;
            minutes_val = parseInt(this.minutes.val(), 10) || 0;
            hours_val = parseInt(this.hours.val(), 10) || 0;

            this.setValue(centiseconds_val + (seconds_val * 100) + (minutes_val * 6000) + (hours_val * 360000));
        }

        evt.stopPropagation();
    };

    /**
     * The in button's click event handler
     * 
     * @method onInClick
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onInClick = function(evt){
        this.triggerEvent(EVT_VALUEIN);
    };

    /**
     * The out button's click event handler
     * 
     * @method onOutClick
     * @private
     * @param {Event} evt The event object
     */
    TimeField.prototype.onOutClick = function(evt){
        this.triggerEvent(EVT_VALUEOUT);
    };

    /**
     * Set the field's value
     * 
     * @method setValue
     * @param {Number} centiseconds The new value in centiseconds
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TimeField.prototype.setValue = function(centiseconds, supressEvent){
        var centiseconds_val, seconds_val, minutes_val, hours_val;

        centiseconds = parseFloat(centiseconds);

        if(isNaN(centiseconds)){
            this.value = null;

            this.centiseconds.val(0);
            this.seconds.val(0);
            this.minutes.val(0);
            this.hours.val(0);

            if(!this.disabled){
                this.hours.attr('disabled', 'disabled');
                this.minutes.attr('disabled', 'disabled');
                this.seconds.attr('disabled', 'disabled');
                this.centiseconds.attr('disabled', 'disabled');

                if(this.in){
                    this.in.attr('disabled', 'disabled');
                }
                if(this.out){
                    this.out.attr('disabled', 'disabled');
                }
            }

            if(this.checkbox){
                this.checkbox.attr('checked', null);
            }
        }
        else{
            this.value = Math.floor(centiseconds);

            if(this.configs.min !== null){
                this.value = Math.max(this.value, this.configs.min);
            }
            if(this.configs.max !== null){
                this.value = Math.min(this.value, this.configs.max);
            }

            centiseconds_val = parseInt((this.value) % 100, 10) || 0;
            seconds_val = parseInt((this.value / 100) % 60, 10) || 0;
            minutes_val = parseInt((this.value / 6000) % 60, 10) || 0;
            hours_val = parseInt((this.value / 360000), 10) || 0;

            if(!this.disabled){
                this.hours.attr('disabled', null);
                this.minutes.attr('disabled', null);
                this.seconds.attr('disabled', null);
                this.centiseconds.attr('disabled', null);

                if(this.in){
                    this.in.attr('disabled', null);
                }
                if(this.out){
                    this.out.attr('disabled', null);
                }
            }

            this.centiseconds.val(centiseconds_val);
            this.seconds.val(seconds_val);
            this.minutes.val(minutes_val);
            this.hours.val(hours_val);

            if(this.checkbox){
                this.checkbox.attr('checked', 'checked');
            }
        }

        if(supressEvent !== true){
            this.triggerEvent('change');
        }

        return this;
    };

    /**
     * Set the minimum allowed value
     * 
     * @method setMin
     * @param {Number} value The minimum allowed value
     * @chainable
     */
    TimeField.prototype.setMin = function(value){
        this.configs.min = value;

        if(this.getValue() < value){
            this.setValue(value);
        }

        return this;
    };

    /**
     * Set the maximum allowed value
     * 
     * @method setMax
     * @param {Number} value The maximum allowed value
     * @chainable
     */
    TimeField.prototype.setMax = function(value){
        this.configs.max = value;

        if(this.getValue() > value){
            this.setValue(value);
        }

        return this;
    };

    /**
     * Check whether the field's checkbox is checked
     * 
     * @method isActive
     * @return {Boolean} Whether the field does not have a checkbox or is active
     */
    TimeField.prototype.isActive = function(){
        return !this.checkbox || this.checkbox.is(":checked");
    };

    /**
     * Disable the field
     * 
     * @method disable
     * @chainable
     */
    TimeField.prototype.disable = function(){
        this.disabled = true;

        if(this.checkbox){
            this.checkbox.attr('disabled', 'disabled');
        }

        this.hours.attr('disabled', 'disabled');
        this.minutes.attr('disabled', 'disabled');
        this.seconds.attr('disabled', 'disabled');
        this.centiseconds.attr('disabled', 'disabled');

        if(this.in){
            this.in.attr('disabled', 'disabled');
        }
        if(this.out){
            this.out.attr('disabled', 'disabled');
        }

        this.addClass('disabled');

        return this;
    };

    /**
     * Enable the field
     * 
     * @method enable
     * @chainable
     */
    TimeField.prototype.enable = function(){
        var active = this.isActive();

        this.disabled = false;

        if(this.checkbox){
            this.checkbox.attr('disabled', null);
        }

        this.hours.attr('disabled', active ? null : 'disabled');
        this.minutes.attr('disabled', active ? null : 'disabled');
        this.seconds.attr('disabled', active ? null : 'disabled');
        this.centiseconds.attr('disabled', active ? null : 'disabled');

        if(this.in){
            this.in.attr('disabled', active ? null : 'disabled');
        }
        if(this.out){
            this.out.attr('disabled', active ? null : 'disabled');
        }

        this.removeClass('disabled');

        return this;
    };

    return TimeField;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Block = (function () {

    /**
     * A panel for {{#crossLink "player.component.Block"}}{{/crossLink}} components
     * 
     * @class Block
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={'title':'Block', 'menuItems': {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function BlockPanel(configs) {
        // call parent constructor
        BlockPanel.parent.call(this, configs);

        this.addClass('block');
    }

    BlockPanel.defaults = {
        'toolbarConfigs': {
            'title': metaScore.Locale.t('editor.panel.Block.title', 'Block'),
            'menuItems': {
                'synched': metaScore.Locale.t('editor.panel.Block.menuItems.synched', 'Add a synchronized block'),
                'non-synched': metaScore.Locale.t('editor.panel.Block.menuItems.non-synched', 'Add a non-synchronized block'),
                'delete': metaScore.Locale.t('editor.panel.Block.menuItems.delete', 'Delete the active block')
            }
        }
    };

    metaScore.editor.Panel.extend(BlockPanel);

    return BlockPanel;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Element = (function () {

    /**
     * A panel for {{#crossLink "player.component.Element"}}{{/crossLink}} components
     * 
     * @class Element
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={'title':'Element', 'menuItems': {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function ElementPanel(configs) {
        // call parent constructor
        ElementPanel.parent.call(this, configs);

        this.addClass('element');
    }

    ElementPanel.defaults = {
        toolbarConfigs: {
            'title': metaScore.Locale.t('editor.panel.Element.title', 'Element'),
            'menuItems': {
                'Cursor': metaScore.Locale.t('editor.panel.Element.menuItems.Cursor', 'Add a new cursor'),
                'Image': metaScore.Locale.t('editor.panel.Element.menuItems.Image', 'Add a new image'),
                'Text': metaScore.Locale.t('editor.panel.Element.menuItems.Text', 'Add a new text element'),
                'delete': metaScore.Locale.t('editor.panel.Element.menuItems.delete', 'Delete the active element')
            }
        }
    };

    metaScore.editor.Panel.extend(ElementPanel);

    /**
     * The fields' valuechange event handler
     *
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    ElementPanel.prototype.onFieldValueChange = function(evt){
        var component = this.getComponent(),
            name = evt.detail.field.data('name');

        if(component && component.getProperty('type') === 'Image' && evt.detail.field.data('name') === 'background-image'){
            this.onBeforeImageSet(name, evt.detail.value);
        }

        ElementPanel.parent.prototype.onFieldValueChange.call(this, evt);
    };

    /**
     * The beforeimageset event handler
     * 
     * @method onBeforeImageSet
     * @private
     * @param {String} property The updated component property's name
     * @param {String} url The new image url
     */
    ElementPanel.prototype.onBeforeImageSet = function(property, url){
        var panel = this,
            component = panel.getComponent(),
            old_src, new_src;

        old_src = component.getProperty(property);
        new_src = url;

        if(old_src){
            panel.getImageMetadata(old_src, function(old_metadata){
                var name = component.getProperty('name'),
                    width = component.getProperty('width'),
                    height = component.getProperty('height');

                if((old_metadata.name === name) || (old_metadata.width === width && old_metadata.height === height)){
                    panel.getImageMetadata(new_src, function(new_metadata){
                        if(old_metadata.name === name){
                            panel.updateFieldValue('name', new_metadata.name);
                        }

                        if(old_metadata.width === width && old_metadata.height === height){
                            panel.updateFieldValue('width', new_metadata.width);
                            panel.updateFieldValue('height', new_metadata.height);
                        }
                    });
                }
            });
        }
        else{
            panel.getImageMetadata(new_src, function(new_metadata){
                panel.updateFieldValue('name', new_metadata.name);
                panel.updateFieldValue('width', new_metadata.width);
                panel.updateFieldValue('height', new_metadata.height);
            });
        }

    };

    /**
     * Get an image's metadata (name, width, and height)
     * 
     * @method getImageMetadata
     * @private
     * @param {String} url The image's url
     * @param {Function} callback The callback to call with the retreived metadata
     */
    ElementPanel.prototype.getImageMetadata = function(url, callback){
        var img = new metaScore.Dom('<img/>')
            .addListener('load', function(evt){
                var el = img.get(0),
                    matches, name;

                if(matches = el.src.match(/([^/]*)\.[^.]*$/)){
                    name = matches[1];
                }

                callback({
                    'name': name,
                    'width': el.naturalWidth,
                    'height': el.naturalHeight
                });
            })
            .attr('src', url);
    };

    return ElementPanel;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Page = (function () {

    /**
     * A panel for {{#crossLink "player.component.Page"}}{{/crossLink}} components
     * 
     * @class Page
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={'title':'Page', 'menuItems': {...}}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function PagePanel(configs) {
        // call parent constructor
        PagePanel.parent.call(this, configs);

        this.addClass('page');
    }

    PagePanel.defaults = {
        toolbarConfigs: {
            'title': metaScore.Locale.t('editor.panel.Page.title', 'Page'),
            'menuItems': {
                'new': metaScore.Locale.t('editor.panel.Page.menuItems.new', 'Add a new page'),
                'delete': metaScore.Locale.t('editor.panel.Page.menuItems.delete', 'Delete the active page')
            }
        }
    };

    metaScore.editor.Panel.extend(PagePanel);

    return PagePanel;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Text = (function () {

    /**
     * Fired when the component is set
     *
     * @event componentset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTSET = 'componentset';

    /**
     * Fired when the component is unset
     *
     * @event componentunset
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTUNSET = 'componentunset';

    /**
     * Fired when the component is locked
     *
     * @event componentlock
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTLOCK = 'componentlock';

    /**
     * Fired when the component is unlocked
     *
     * @event componentunlock
     * @param {Object} component The component instance
     */
    var EVT_COMPONENTUNLOCK = 'componentunlock';

    /**
     * A panel for {{#crossLink "player.component.element.Text"}}{{/crossLink}} components
     * 
     * @class Text
     * @namespace editor.panel
     * @extends editor.Panel
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.toolbarConfigs={'title':'Text', 'buttons': [], 'selector': false]}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     * @param {Object} [configs.properties={'locked': ...}] Configs to pass to the toolbar (see {{#crossLink "editor.panel.Toolbar"}}{{/crossLink}})
     */
    function TextPanel(configs) {
        // call parent constructor
        TextPanel.parent.call(this, configs);

        this.addClass('text');

        // fix event handlers scope
        this.onComponentContentsDblClick = metaScore.Function.proxy(this.onComponentContentsDblClick, this);
        this.onComponentContentsClick = metaScore.Function.proxy(this.onComponentContentsClick, this);
        this.onComponentContentsKey = metaScore.Function.proxy(this.onComponentContentsKey, this);
    }

    TextPanel.defaults = {
        'toolbarConfigs': {
            'title': metaScore.Locale.t('editor.panel.Text.title', 'Text'),
            'buttons': [],
            'selector': false
        },
        'properties': {
            'locked': {
                'type': 'Boolean',
                'configs': {
                    'label': metaScore.Locale.t('editor.panel.Text.locked', 'Locked ?')
                },
                'setter': function(value){
                    if(value){
                        this.lock();
                    }
                    else{
                        this.unlock();
                    }
                }
            }
        }
    };

    metaScore.editor.Panel.extend(TextPanel);

    /**
     * The fields' valuechange event handler
     *
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    TextPanel.prototype.onFieldValueChange = function(evt){
        var component = this.getComponent(),
            name, value;

        if(!component){
            return;
        }

        name = evt.detail.field.data('name');
        value = evt.detail.value;

        if(name in this.configs.properties && 'setter' in this.configs.properties[name]){
            this.configs.properties[name].setter.call(this, value);
        }
    };

    /**
     * Set the associated component
     *
     * @method setComponent
     * @param {player.Component} component The component
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TextPanel.prototype.setComponent = function(component, supressEvent){
        if(component !== this.getComponent()){
            if(!component){
                return this.unsetComponent();
            }

            this.unsetComponent(true);

            this.component = component;

            this
                .setupFields(this.configs.properties)
                .updateFieldValue('locked', true)
                .addClass('has-component');

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTSET, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Unset the associated component
     *
     * @method unsetComponent
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TextPanel.prototype.unsetComponent = function(supressEvent){
        var component = this.getComponent();

        this.lock().removeClass('has-component');

        if(component){
            this.component = null;

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTUNSET, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Lock the associated component
     * 
     * @method lock
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TextPanel.prototype.lock = function(supressEvent){
        var component = this.getComponent();

        if(component){
            component.contents
                .attr('contenteditable', null)
                .addListener('dblclick', this.onComponentContentsDblClick)
                .removeListener('click', this.onComponentContentsClick)
                .removeListener('keydown', this.onComponentContentsKey)
                .removeListener('keypress', this.onComponentContentsKey)
                .removeListener('keyup', this.onComponentContentsKey);

            this.toggleFields(metaScore.Array.remove(Object.keys(this.getField()), 'locked'), false);

            if(component._draggable){
                component._draggable.enable();
            }
            if(component._resizable){
                component._resizable.enable();
            }

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTLOCK, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Unlock the associated component
     * 
     * @method unlock
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    TextPanel.prototype.unlock = function(supressEvent){
        var component = this.getComponent();

        if(component){
            if(component._draggable){
                component._draggable.disable();
            }
            if(component._resizable){
                component._resizable.disable();
            }

            component.contents
                .attr('contenteditable', 'true')
                .removeListener('dblclick', this.onComponentContentsDblClick)
                .addListener('click', this.onComponentContentsClick)
                .addListener('keydown', this.onComponentContentsKey)
                .addListener('keypress', this.onComponentContentsKey)
                .addListener('keyup', this.onComponentContentsKey);

            this.toggleFields(metaScore.Array.remove(Object.keys(this.getField()), 'locked'), true);

            if(supressEvent !== true){
                this.triggerEvent(EVT_COMPONENTUNLOCK, {'component': component}, false);
            }
        }

        return this;
    };

    /**
     * Disable the panel
     *
     * @method disable
     * @chainable
     */
    TextPanel.prototype.disable = function(){
        this.lock();

        return TextPanel.parent.prototype.disable.call(this);
    };

    /**
     * The component's contents click event handler
     * 
     * @method onComponentContentsClick
     * @private
     * @param {Event} evt The event object
     */
    TextPanel.prototype.onComponentContentsClick = function(evt){
        evt.stopPropagation();
    };

    /**
     * The component's contents dblclick event handler
     * 
     * @method onComponentContentsDblClick
     * @private
     * @param {Event} evt The event object
     */
    TextPanel.prototype.onComponentContentsDblClick = function(evt){
        this.updateFieldValue('locked', false);
    };

    /**
     * The component's contents key event handler
     * 
     * @method onComponentContentsKey
     * @private
     * @param {Event} evt The event object
     */
    TextPanel.prototype.onComponentContentsKey = function(evt){
        evt.stopPropagation();
    };

    return TextPanel;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.panel').Toolbar = (function(){

    /**
     * A title toolbar for panel's
     *
     * @class Toolbar
     * @namespace editor.panel
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.title=''] The text to display as a title
     * @param {Array} [configs.buttons=['previous', 'next']] The buttons to display
     * @param {Boolean} [configs.selector=true] Whether to display a selector
     * @param {Object} [configs.menuItems={}}] A list of dropdown menu items to display
     */
    function Toolbar(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Toolbar.parent.call(this, '<div/>', {'class': 'toolbar clearfix'});

        this.title = new metaScore.Dom('<div/>', {'class': 'title', 'text': this.configs.title})
            .appendTo(this);

        this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        metaScore.Array.each(this.configs.buttons, function(index, action){
            this.addButton(action);
        }, this);

        if(this.configs.selector){
            this.selector = new metaScore.editor.field.Select()
                .addClass('selector')
                .appendTo(this);
        }

        if(!metaScore.Var.isEmpty(this.configs.menuItems)){
            this.menu = new metaScore.editor.DropDownMenu();

            metaScore.Object.each(this.configs.menuItems, function(action, label){
                this.menu.addItem(action, label);
            }, this);

            this.addButton('menu')
                .append(this.menu);
        }
    }

    Toolbar.defaults = {
        'title': '',
        'buttons': ['previous', 'next'],
        'selector': true,
        'menuItems': {}
    };

    metaScore.Dom.extend(Toolbar);

    /**
     * Get the title's Dom object
     * 
     * @method getTitle
     * @return {Dom} The Dom object
     */
    Toolbar.prototype.getTitle = function(){
        return this.title;
    };

    /**
     * Get the selector field
     * 
     * @method getSelector
     * @return {editor.field.Select} The selector field
     */
    Toolbar.prototype.getSelector = function(){
        return this.selector;
    };

    /**
     * Get the dropdown menu
     * 
     * @method getMenu
     * @return {editor.DropDownMenu} The dropdown menu
     */
    Toolbar.prototype.getMenu = function(){
        return this.menu;
    };

    /**
     * Add a button
     * 
     * @method addButton
     * @param {String} action The button's associated action
     * @return {editor.Button} The created button
     */
    Toolbar.prototype.addButton = function(action){
        var button = new metaScore.editor.Button().data('action', action)
            .appendTo(this.buttons);

        return button;
    };

    /**
     * Get a button by associated action
     * 
     * @method getButton
     * @param {String} action The button's associated action
     * @return {Dom} The button's Dom object
     */
    Toolbar.prototype.getButton = function(action){
        return this.buttons.children('[data-action="'+ action +'"]');
    };

    /**
     * Toggle the enabled state of a menu item
     * 
     * @method toggleMenuItem
     * @param {String} action The item's associated action
     * @param {Boolean} state The enabled state to set
     * @chainable
     */
    Toolbar.prototype.toggleMenuItem = function(action, state){
        var menu = this.getMenu();

        if(menu){
            menu.toggleItem(action, state);
        }

        return this;
    };

    return Toolbar;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').Alert = (function () {

    /**
     * Fired when a button is clicked
     *
     * @event buttonclick
     * @param {Object} alert The alert instance
     * @param {String} action The buttons's action
     */
    var EVT_BUTTONCLICK = 'buttonclick';

    /**
     * An alert overlay to show a simple message with buttons
     *
     * @class Alert
     * @namespace editor.overlay
     * @extends editor.Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.draggable=false] Whether the overlay is draggable
     * @param {String} [configs.text=''] The message's text
     * @param {Array} [configs.buttons={}] The list of buttons as action/label pairs
     */
    function Alert(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Alert.parent.call(this, this.configs);

        this.addClass('alert');
    }

    Alert.defaults = {
        'draggable': false,
        'text': '',
        'buttons': {}
    };

    metaScore.editor.Overlay.extend(Alert);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    Alert.prototype.setupUI = function(){
        // call parent method
        Alert.parent.prototype.setupUI.call(this);

        this.text = new metaScore.Dom('<div/>', {'class': 'text'})
            .appendTo(this.contents);

        if(this.configs.text){
            this.setText(this.configs.text);
        }

        this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .addDelegate('button', 'click', metaScore.Function.proxy(this.onButtonClick, this))
            .appendTo(this.contents);

        if(this.configs.buttons){
            metaScore.Object.each(this.configs.buttons, function(action, label){
                this.addButton(action, label);
            }, this);
        }

    };

    /**
     * Set the message's text
     * 
     * @method setText
     * @param {String} str The message's text
     * @chainable
     */
    Alert.prototype.setText = function(str){
        this.text.text(str);

        return this;
    };

    /**
     * Add a button
     * 
     * @method addButton
     * @param {String} action The button's associated action
     * @param {String} label The button's text label
     * @return {Button} The button object
     */
    Alert.prototype.addButton = function(action, label){
        var button = new metaScore.editor.Button()
            .setLabel(label)
            .data('action', action)
            .appendTo(this.buttons);

        return button;
    };

    /**
     * The button click event handler
     * 
     * @method onButtonClick
     * @private
     * @param {Event} evt The event object
     */
    Alert.prototype.onButtonClick = function(evt){
        var action = new metaScore.Dom(evt.target).data('action');

        this.hide();

        this.triggerEvent(EVT_BUTTONCLICK, {'alert': this, 'action': action}, false);

        evt.stopPropagation();
    };

    return Alert;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').BorderRadius = (function () {

    /**
     * Fired when the submit button is clicked
     *
     * @event submit
     * @param {Object} overlay The overlay instance
     * @param {String} value The border radius value in CSS format
     */
    var EVT_SUBMIT = 'submit';

    /**
     * An overlay that simplifies the creation of a CSS border-radius value
     *
     * @class BorderRadius
     * @namespace editor.overlay
     * @extends editor.Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.title='Border Radius'] The overlay's title
     */
    function BorderRadius(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        BorderRadius.parent.call(this, this.configs);

        this.addClass('border-radius');
    }

    BorderRadius.defaults = {
        'toolbar': true,
        'title': metaScore.Locale.t('editor.overlay.BorderRadius.title', 'Border Radius')
    };

    metaScore.editor.Overlay.extend(BorderRadius);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    BorderRadius.prototype.setupUI = function(){
        var contents;

        // call parent method
        BorderRadius.parent.prototype.setupUI.call(this);

        contents = this.getContents();

        this.fields = {};
        this.buttons = {};

        this.preview = new metaScore.Dom('<div/>', {'class': 'preview'})
            .appendTo(contents);

        this.fields.tlw = new metaScore.editor.field.Number({'min': 0})
            .addClass('tlw')
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .appendTo(this.preview);

        this.fields.tlh = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('tlh')
            .appendTo(this.preview);

        this.fields.trw = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('trw')
            .appendTo(this.preview);

        this.fields.trh = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('trh')
            .appendTo(this.preview);

        this.fields.brw = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('brw')
            .appendTo(this.preview);

        this.fields.brh = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('brh')
            .appendTo(this.preview);

        this.fields.blw = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('blw')
            .appendTo(this.preview);

        this.fields.blh = new metaScore.editor.field.Number({'min': 0})
            .addListener('valuechange', metaScore.Function.proxy(this.onValueChange, this))
            .addClass('blh')
            .appendTo(this.preview);

        // Buttons
        this.buttons.apply = new metaScore.editor.Button({'label': 'Apply'})
            .addClass('apply')
            .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
            .appendTo(contents);

        this.buttons.cancel = new metaScore.editor.Button({'label': 'Cancel'})
            .addClass('cancel')
            .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
            .appendTo(contents);

    };

    /**
     * The valuechange event handler
     * 
     * @method onValueChange
     * @private
     * @param {Event} evt The event object
     */
    BorderRadius.prototype.onValueChange = function(){
        var radius    = '';

        radius += this.fields.tlw.getValue() +'px ';
        radius += this.fields.trw.getValue() +'px ';
        radius += this.fields.brw.getValue() +'px ';
        radius += this.fields.blw.getValue() +'px ';
        radius += '/ ';
        radius += this.fields.tlh.getValue() +'px ';
        radius += this.fields.trh.getValue() +'px ';
        radius += this.fields.brh.getValue() +'px ';
        radius += this.fields.blh.getValue() +'px';

        this.preview.css('border-radius', radius);
    };

    /**
     * Set the current value
     * 
     * @method setValue
     * @param {String} val The value in CSS border-radius format
     * @chainable
     */
    BorderRadius.prototype.setValue = function(val){
        var matches,
            values = {
                tlw: 0, tlh: 0,
                trw: 0, trh: 0,
                blw: 0, blh: 0,
                brw: 0, brh: 0
            };

        this.preview.css('border-radius', val);

        if(matches = this.preview.css('border-top-left-radius', undefined, true).match(/(\d*)px/g)){
            if(matches.length > 1){
                values.tlw = matches[0];
                values.tlh = matches[1];
            }
            else{
                values.tlw = values.tlh = matches[0];
            }
        }

        if(matches = this.preview.css('border-top-right-radius', undefined, true).match(/(\d*)px/g)){
            if(matches.length > 1){
                values.trw = matches[0];
                values.trh = matches[1];
            }
            else{
                values.trw = values.trh = matches[0];
            }
        }

        if(matches = this.preview.css('border-bottom-left-radius', undefined, true).match(/(\d*)px/g)){
            if(matches.length > 1){
                values.blw = matches[0];
                values.blh = matches[1];
            }
            else{
                values.blw = values.blh = matches[0];
            }
        }

        if(matches = this.preview.css('border-bottom-right-radius', undefined, true).match(/(\d*)px/g)){
            if(matches.length > 1){
                values.brw = matches[0];
                values.brh = matches[1];
            }
            else{
                values.brw = values.brh = matches[0];
            }
        }

        metaScore.Object.each(this.fields, function(key, field){
            field.setValue(parseInt(values[key], 10), true);
        });

        return this;
    };

    /**
     * Get the current value
     * 
     * @method getValue
     * @return {String} The value in CSS border-radius format
     */
    BorderRadius.prototype.getValue = function(){
        return this.preview.css('border-radius');
    };

    /**
     * The apply button's click event handler
     * 
     * @method onApplyClick
     * @private
     * @param {Event} evt The event object
     */
    BorderRadius.prototype.onApplyClick = function(evt){
        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'value': this.getValue()}, true, false);
        this.hide();
    };

    /**
     * The cancel button's click event handler
     * 
     * @method onCancelClick
     * @private
     * @param {Event} evt The event object
     */
    BorderRadius.prototype.onCancelClick = BorderRadius.prototype.onCloseClick;

    return BorderRadius;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').ColorSelector = (function () {

    /**
     * Fired when the submit button is clicked
     *
     * @event submit
     * @param {Object} overlay The overlay instance
     * @param {Object} value The color value in rgba format
     */
    var EVT_SUBMIT = 'submit';

    /**
     * An overlay to select an RGBA color
     *
     * @class ColorSelector
     * @namespace editor.overlay
     * @extends editor.Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.draggable=false] Whether the overlay is draggable
     */
    function ColorSelector(configs) {
        this.configs = this.getConfigs(configs);

        // fix event handlers scope
        this.onGradientMousemove = metaScore.Function.proxy(this.onGradientMousemove, this);
        this.onAlphaMousemove = metaScore.Function.proxy(this.onAlphaMousemove, this);

        // call parent constructor
        ColorSelector.parent.call(this, this.configs);

        this.addClass('color-selector');
    }

    ColorSelector.defaults = {
        'draggable': false
    };

    metaScore.editor.Overlay.extend(ColorSelector);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    ColorSelector.prototype.setupUI = function(){
        // call parent method
        ColorSelector.parent.prototype.setupUI.call(this);

        this.gradient = new metaScore.Dom('<div/>', {'class': 'gradient'}).appendTo(this.contents);
        
        this.gradient.canvas = new metaScore.Dom('<canvas/>', {'width': '255', 'height': '255'})
            .addListener('click', metaScore.Function.proxy(this.onGradientClick, this))
            .addListener('mousedown', metaScore.Function.proxy(this.onGradientMousedown, this))
            .addListener('mouseup', metaScore.Function.proxy(this.onGradientMouseup, this))
            .appendTo(this.gradient);
            
        this.gradient.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(this.gradient);

        this.alpha = new metaScore.Dom('<div/>', {'class': 'alpha'}).appendTo(this.contents);
        
        this.alpha.canvas = new metaScore.Dom('<canvas/>', {'width': '20', 'height': '255'})
            .addListener('click', metaScore.Function.proxy(this.onAlphaClick, this))
            .addListener('mousedown', metaScore.Function.proxy(this.onAlphaMousedown, this))
            .addListener('mouseup', metaScore.Function.proxy(this.onAlphaMouseup, this))
            .appendTo(this.alpha);
            
        this.alpha.position = new metaScore.Dom('<div/>', {'class': 'position'}).appendTo(this.alpha);

        this.controls = new metaScore.Dom('<div/>', {'class': 'controls'}).appendTo(this.contents);

        this.controls.r = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'r'})
            .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
            
        new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
            .append(new metaScore.Dom('<label/>', {'text': 'R', 'for': 'r'}))
            .append(this.controls.r)
            .appendTo(this.controls);

        this.controls.g = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'g'})
            .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
            
        new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
            .append(new metaScore.Dom('<label/>', {'text': 'G', 'for': 'g'}))
            .append(this.controls.g)
            .appendTo(this.controls);

        this.controls.b = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '255', 'name': 'b'})
            .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
            
        new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
            .append(new metaScore.Dom('<label/>', {'text': 'B', 'for': 'b'}))
            .append(this.controls.b)
            .appendTo(this.controls);

        this.controls.a = new metaScore.Dom('<input/>', {'type': 'number', 'min': '0', 'max': '1', 'step': '0.01', 'name': 'a'})
            .addListener('input', metaScore.Function.proxy(this.onControlInput, this));
            
        new metaScore.Dom('<div/>', {'class': 'control-wrapper'})
            .append(new metaScore.Dom('<label/>', {'text': 'A', 'for': 'a'}))
            .append(this.controls.a)
            .appendTo(this.controls);

        this.controls.current = new metaScore.Dom('<canvas/>');
        
        new metaScore.Dom('<div/>', {'class': 'canvas-wrapper current'})
            .append(this.controls.current)
            .appendTo(this.controls);

        this.controls.previous = new metaScore.Dom('<canvas/>');
        
        new metaScore.Dom('<div/>', {'class': 'canvas-wrapper previous'})
            .append(this.controls.previous)
            .appendTo(this.controls);

        this.controls.cancel = new metaScore.editor.Button({'label': 'Cancel'})
            .addClass('cancel')
            .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
            .appendTo(this.controls);

        this.controls.apply = new metaScore.editor.Button({'label': 'Apply'})
            .addClass('apply')
            .addListener('click', metaScore.Function.proxy(this.onApplyClick, this))
            .appendTo(this.controls);

        this.fillGradient();

    };

    /**
     * Set the current value
     * 
     * @method setValue
     * @param {Mixed} val The value in a format accepted by {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}}
     * @chainable
     */
    ColorSelector.prototype.setValue = function(val){
        this.updateValue(val);

        this.previous_value = this.value;

        this.fillPrevious();

        return this;
    };

    /**
     * Update the selected value
     * 
     * @method updateValue
     * @private
     * @param {Mixed} val The value in a format accepted by {{#crossLink "Color/parse:method"}}Color.parse{{/crossLink}}
     * @param {Boolean} refillAlpha Whether to refill the alpha indicator canvas
     * @param {Boolean} updatePositions Whether to update the cursor positions
     * @param {Boolean} updateInputs Whether to update the input values
     * @chainable
     */
    ColorSelector.prototype.updateValue = function(val, refillAlpha, updatePositions, updateInputs){

        var hsv;

        this.value = this.value || {};

        if(!metaScore.Var.is(val, 'object')){
            val = metaScore.Color.parse(val);
        }

        if('r' in val){
            this.value.r = parseInt(val.r, 10);
        }
        if('g' in val){
            this.value.g = parseInt(val.g, 10);
        }
        if('b' in val){
            this.value.b = parseInt(val.b, 10);
        }
        if('a' in val){
            this.value.a = parseFloat(val.a);
        }

        if(refillAlpha !== false){
            this.fillAlpha();
        }

        if(updateInputs !== false){
            this.controls.r.val(this.value.r);
            this.controls.g.val(this.value.g);
            this.controls.b.val(this.value.b);
            this.controls.a.val(this.value.a);
        }

        if(updatePositions !== false){
            hsv = metaScore.Color.rgb2hsv(this.value);

            this.gradient.position.css('left', ((1 - hsv.h) * 255) +'px');
            this.gradient.position.css('top', (hsv.s * (255 / 2)) + ((1 - (hsv.v/255)) * (255/2)) +'px');

            this.alpha.position.css('top', ((1 - this.value.a) * 255) +'px');
        }

        this.fillCurrent();

        return this;

    };

    /**
     * Fill the gradient's canvas
     * 
     * @method fillGradient
     * @private
     * @chainable
     */
    ColorSelector.prototype.fillGradient = function(){
        var context = this.gradient.canvas.get(0).getContext('2d'),
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

        return this;
    };

    /**
     * Fill the previous color indicator canvas
     * 
     * @method fillPrevious
     * @private
     * @chainable
     */
    ColorSelector.prototype.fillPrevious = function(){
        var context = this.controls.previous.get(0).getContext('2d');

        context.fillStyle = "rgba("+ this.previous_value.r +","+ this.previous_value.g +","+ this.previous_value.b +","+ this.previous_value.a +")";
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        return this;
    };

    /**
     * Fill the current color indicator canvas
     * 
     * @method fillCurrent
     * @private
     * @chainable
     */
    ColorSelector.prototype.fillCurrent = function(){
        var context = this.controls.current.get(0).getContext('2d');

        context.fillStyle = "rgba("+ this.value.r +","+ this.value.g +","+ this.value.b +","+ this.value.a +")";
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        return this;
    };

    /**
     * Fill the alpha indicator canvas
     * 
     * @method fillAlpha
     * @private
     * @chainable
     */
    ColorSelector.prototype.fillAlpha = function(){
        var context = this.alpha.canvas.get(0).getContext('2d'),
            fill;

        // Create color gradient
        fill = context.createLinearGradient(0, 0, 0, context.canvas.height);
        fill.addColorStop(0, "rgb("+ this.value.r +","+ this.value.g +","+ this.value.b +")");
        fill.addColorStop(1, "transparent");

        // Apply gradient to canvas
        context.fillStyle = fill;
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);

        return this;
    };

    /**
     * The controls input event handler
     * 
     * @method onControlInput
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onControlInput = function(evt){
        var rgba, hsv;

        this.updateValue({
            'r': this.controls.r.val(),
            'g': this.controls.g.val(),
            'b': this.controls.b.val(),
            'a': this.controls.a.val()
        }, true, true, false);
    };

    /**
     * The gradient mousedown event handler
     * 
     * @method onGradientMousedown
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onGradientMousedown = function(evt){
        this.gradient.canvas.addListener('mousemove', this.onGradientMousemove);

        evt.stopPropagation();
    };

    /**
     * The gradient mouseup event handler
     * 
     * @method onGradientMouseup
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onGradientMouseup = function(evt){
        this.gradient.canvas.removeListener('mousemove', this.onGradientMousemove);

        evt.stopPropagation();
    };

    /**
     * The gradient click event handler
     * 
     * @method onGradientClick
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onGradientClick = function(evt){
        var offset = evt.target.getBoundingClientRect(),
            colorX = evt.pageX - offset.left,
            colorY = evt.pageY - offset.top,
            context = this.gradient.canvas.get(0).getContext('2d'),
            imageData = context.getImageData(colorX, colorY, 1, 1),
            value = this.value;

        this.gradient.position.css('left', colorX +'px');
        this.gradient.position.css('top', colorY +'px');

        value.r = imageData.data[0];
        value.g = imageData.data[1];
        value.b = imageData.data[2];

        if(!value.a){
            value.a = 1;
            this.updateValue(value, true, true);
        }
        else{
            this.updateValue(value, true, false);
        }


        evt.stopPropagation();
    };

    /**
     * The gradient mousemove event handler
     * 
     * @method onGradientMousemove
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onGradientMousemove = ColorSelector.prototype.onGradientClick;

    /**
     * The alpha mousedown event handler
     * 
     * @method onAlphaMousedown
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onAlphaMousedown = function(evt){
        this.alpha.canvas.addListener('mousemove', this.onAlphaMousemove);

        evt.stopPropagation();
    };

    /**
     * The alpha mouseup event handler
     * 
     * @method onAlphaMouseup
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onAlphaMouseup = function(evt){
        this.alpha.canvas.removeListener('mousemove', this.onAlphaMousemove);

        evt.stopPropagation();
    };

    /**
     * The alpha click event handler
     * 
     * @method onAlphaClick
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onAlphaClick = function(evt){
        var offset = evt.target.getBoundingClientRect(),
            colorY = evt.pageY - offset.top,
            context = this.alpha.canvas.get(0).getContext('2d'),
            imageData = context.getImageData(0, colorY, 1, 1),
            value = this.value;

        this.alpha.position.css('top', colorY +'px');

        value.a = Math.round(imageData.data[3] / 255 * 100) / 100;

        this.updateValue(value, false, false);

        evt.stopPropagation();
    };

    /**
     * The alpha mousemove event handler
     * 
     * @method onAlphaClick
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onAlphaMousemove = ColorSelector.prototype.onAlphaClick;

    /**
     * The apply button click event handler
     * 
     * @method onApplyClick
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onApplyClick = function(evt){
        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'value': this.value}, true, false);

        this.hide();
    };

    /**
     * The cancel button click event handler
     * 
     * @method onCancelClick
     * @private
     * @param {Event} evt The event object
     */
    ColorSelector.prototype.onCancelClick = function(evt){
        this.hide();
    };

    return ColorSelector;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').GuideDetails = (function () {

    /**
     * Fired when the submit button is clicked
     *
     * @event submit
     * @param {Object} overlay The overlay instance
     * @param {Object} values The field values
     */
    var EVT_SUBMIT = 'submit';

    /**
     * An overlay to update a guide's details (title, description, thumbnail, etc)
     *
     * @class GuideDetails
     * @namespace editor.overlay
     * @extends editor.Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.title='Guide Info'] The overlay's title
     * @param {String} [configs.submit_text='Save'] The overlay's submit button label
     */
    function GuideDetails(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        GuideDetails.parent.call(this, this.configs);

        this.changed = {};
        this.previous_values = null;

        this.addClass('guide-details');
    }

    GuideDetails.defaults = {
        'toolbar': true,
        'title': metaScore.Locale.t('editor.overlay.GuideDetails.title', 'Guide Info'),
        'submit_text': metaScore.Locale.t('editor.overlay.GuideDetails.submitText', 'Save')
    };

    metaScore.editor.Overlay.extend(GuideDetails);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    GuideDetails.prototype.setupUI = function(){
        var contents, form;

        // call parent method
        GuideDetails.parent.prototype.setupUI.call(this);

        contents = this.getContents();

        this.fields = {};

        form = new metaScore.Dom('<form>')
            .addListener('submit', metaScore.Function.proxy(this.onFormSubmit, this))
            .appendTo(contents);

        // Fields
        this.fields['type'] = new metaScore.editor.field.Select({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.type.label', 'Type'),
                'options': {
                    '': '',
                    'audio': metaScore.Locale.t('editor.overlay.GuideDetails.fields.type.options.audio', 'Audio'),
                    'video': metaScore.Locale.t('editor.overlay.GuideDetails.fields.type.options.video', 'Video')
                },
                'required': true
            })
            .data('name', 'type')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['title'] = new metaScore.editor.field.Text({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.title.label', 'Title'),
                'required': true
            })
            .data('name', 'title')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['description'] = new metaScore.editor.field.Textarea({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.description.label', 'Description')
            })
            .data('name', 'description')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['credits'] = new metaScore.editor.field.Textarea({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.credits.label', 'Credits')
            })
            .data('name', 'credits')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['thumbnail'] = new metaScore.editor.field.File({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.thumbnail.label', 'Thumbnail'),
                'description': metaScore.Locale.t('editor.overlay.GuideDetails.fields.thumbnail.description', 'Allowed file types: !types', {'!types': 'png gif jpg jpeg'}),
                'accept': '.png,.gif,.jpg,.jpeg'
            })
            .data('name', 'thumbnail')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['media'] = new metaScore.editor.field.File({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.media.label', 'Media'),
                'description': metaScore.Locale.t('editor.overlay.GuideDetails.fields.media.description', 'Allowed file types: !types', {'!types': 'mp4 m4v m4a mp3'}),
                'accept': '.mp4,.m4v,.m4a,.mp3'
            })
            .data('name', 'media')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        this.fields['css'] = new metaScore.editor.field.Textarea({
                'label': metaScore.Locale.t('editor.overlay.GuideDetails.fields.css.label', 'CSS')
            })
            .data('name', 'css')
            .addListener('valuechange', metaScore.Function.proxy(this.onFieldValueChange, this))
            .appendTo(form);

        // Buttons
        new metaScore.editor.Button({'label': this.configs.submit_text})
            .addClass('apply')
            .appendTo(form);

        new metaScore.editor.Button({'label': 'Cancel'})
            .addClass('cancel')
            .addListener('click', metaScore.Function.proxy(this.onCancelClick, this))
            .appendTo(form);

    };

    /**
     * Get a field by name
     * 
     * @method getField
     * @param {String} name The field's name
     * @return {editor.Field} The field object
     */
    GuideDetails.prototype.getField = function(name){
        var fields = this.fields;

        if(name){
            return fields[name];
        }

        return fields;
    };

    /**
     * Set the field values
     * 
     * @method setValues
     * @param {Object} values A list of field values in name/value pairs
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    GuideDetails.prototype.setValues = function(values, supressEvent){
        metaScore.Object.each(values, function(key, value){
            if(key in this.fields){
                this.fields[key].setValue(value, supressEvent);
            }
        }, this);

        this.previous_values = values;

        return this;
    };

    /**
     * Clears all field values
     * 
     * @method clearValues
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     * @chainable
     */
    GuideDetails.prototype.clearValues = function(supressEvent){
        metaScore.Object.each(this.fields, function(key, field){
            field.setValue(null, supressEvent);
        }, this);

        return this;
    };

    /**
     * Get all changed field values
     * 
     * @method getValues
     * @return {Object} The values of changed fields in name/value pairs
     */
    GuideDetails.prototype.getValues = function(){
        return metaScore.Object.extend({}, this.changed);
    };

    /**
     * The fields change event handler
     * 
     * @method onFieldValueChange
     * @private
     * @param {Event} evt The event object
     */
    GuideDetails.prototype.onFieldValueChange = function(evt){
        var field = evt.detail.field,
            value = evt.detail.value,
            name = field.data('name'),
            file;

        if(field instanceof metaScore.editor.field.File){
            if(file = field.getFile(0)){
                this.changed[name] = {
                    'name': file.name,
                    'url': URL.createObjectURL(file),
                    'mime': file.type,
                    'object': file
                };
            }
            else{
                delete this.changed[name];
            }
        }
        else{
            this.changed[name] = value;
        }
    };

    /**
     * The form submit event handler
     * 
     * @method onFormSubmit
     * @private
     * @param {Event} evt The event object
     */
    GuideDetails.prototype.onFormSubmit = function(evt){
        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'values': this.getValues()}, true, false);

        evt.preventDefault();
        evt.stopPropagation();
    };

    /**
     * The close button click event handler
     * 
     * @method onCloseClick
     * @private
     * @param {Event} evt The event object
     */
    GuideDetails.prototype.onCloseClick = function(evt){
        if(this.previous_values){
            this.clearValues(true)
                .setValues(this.previous_values, true);
        }

        this.hide();

        evt.preventDefault();
    };

    /**
     * The cancel button click event handler
     * 
     * @method onCancelClick
     * @private
     * @param {Event} evt The event object
     */
    GuideDetails.prototype.onCancelClick = GuideDetails.prototype.onCloseClick;

    return GuideDetails;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').GuideSelector = (function () {

    /**
     * Fired when a guide's select button is clicked
     *
     * @event submit
     * @param {Object} overlay The overlay instance
     * @param {Object} guide The guide's data
     * @param {Integer} vid The selected vid of the guide
     */
    var EVT_SUBMIT = 'submit';

    /**
     * A guide selector overlay
     *
     * @class GuideSelector
     * @namespace editor.overlay
     * @extends editor.Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.title='Select a guide'] The overlay's title
     * @param {String} [configs.empty_text='No guides available'] A text to show when no guides are available
     * @param {String} [configs.url=''] The url from which to retreive the list of guides
     */
    function GuideSelector(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        GuideSelector.parent.call(this, this.configs);

        this.addClass('guide-selector');
    }

    GuideSelector.defaults = {
        'toolbar': true,
        'title': metaScore.Locale.t('editor.overlay.GuideSelector.title', 'Select a guide'),
        'empty_text': metaScore.Locale.t('editor.overlay.GuideSelector.emptyText', 'No guides available'),
        'url': null
    };

    metaScore.editor.Overlay.extend(GuideSelector);

    /**
     * Show the overlay
     * 
     * @method show
     * @chainable
     */
    GuideSelector.prototype.show = function(){
        this.loadmask = new metaScore.editor.overlay.LoadMask({
            'autoShow': true
        });

        metaScore.Ajax.get(this.configs.url, {
            'success': metaScore.Function.proxy(this.onLoadSuccess, this),
            'error': metaScore.Function.proxy(this.onLoadError, this)
        });

        return this;
    };

    /**
     * The onload success event handler
     * 
     * @method onLoadSuccess
     * @private
     * @param {XMLHttpRequest} xhr The <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest" target="_blank">XMLHttpRequest</a> object
     */
    GuideSelector.prototype.onLoadSuccess = function(xhr){
        var contents = this.getContents(),
            data = JSON.parse(xhr.response),
            guides = data.items,
            table, row,
            revision_wrapper, revision_field, last_vid,
            groups, button;

        table = new metaScore.Dom('<table/>', {'class': 'guides'})
            .appendTo(contents);

        if(metaScore.Var.isEmpty(guides)){
            contents.text(this.configs.empty_text);
        }
        else{
            metaScore.Array.each(guides, function(index, guide){
                row = new metaScore.Dom('<tr/>', {'class': 'guide guide-'+ guide.id})
                    .appendTo(table);

                new metaScore.Dom('<td/>', {'class': 'thumbnail'})
                    .append(new metaScore.Dom('<img/>', {'src': guide.thumbnail ? guide.thumbnail.url : null}))
                    .appendTo(row);

                revision_field = new metaScore.editor.field.Select()
                    .addClass('revisions');

                if('revisions' in guide){
                    groups = {};

                    metaScore.Object.each(guide.revisions, function(vid, revision){
                        var group_id, group_label, group, text;

                        switch(revision.state){
                            case 0: // archives
                                group_id = 'archives';
                                group_label = metaScore.Locale.t('editor.overlay.GuideSelector.archivesGroup', 'archives');
                                break;

                            case 1: // published
                                group_id = 'published';
                                group_label = metaScore.Locale.t('editor.overlay.GuideSelector.publishedGroup', 'published');
                                break;

                            case 2: // drafts
                                group_id = 'drafts';
                                group_label = metaScore.Locale.t('editor.overlay.GuideSelector.draftsGroup', 'drafts');
                                break;
                        }

                        if(!(group_id in groups)){
                            groups[group_id] = revision_field.addGroup(group_label).addClass(group_id);
                        }

                        group = groups[group_id];

                        text = metaScore.Locale.t('editor.overlay.GuideSelector.revisionText', '!date by !username (!id:!vid)', {'!date': revision.date, '!username': revision.username, '!id': guide.id, '!vid': vid});

                        revision_field.addOption(vid, text, group);
                    });

                    if('latest_revision' in guide){
                        revision_field.setValue(guide.latest_revision);
                    }
                }

                button = new metaScore.editor.Button()
                    .setLabel(metaScore.Locale.t('editor.overlay.GuideSelector.button', 'Select'))
                    .addListener('click', metaScore.Function.proxy(function(guide, revision_field, evt){
                        this.triggerEvent(EVT_SUBMIT, {'overlay': this, 'guide': guide, 'vid': revision_field.getValue()}, true, false);

                        this.hide();

                        evt.stopPropagation();
                    }, this, [guide, revision_field]))
                    .data('action', 'select');

                revision_wrapper = new metaScore.Dom('<div/>', {'class': 'revision-wrapper'})
                    .append(revision_field)
                    .append(button);

                new metaScore.Dom('<td/>', {'class': 'details'})
                    .append(new metaScore.Dom('<h1/>', {'class': 'title', 'text': guide.title}))
                    .append(new metaScore.Dom('<p/>', {'class': 'description', 'text': guide.description}))
                    .append(new metaScore.Dom('<h2/>', {'class': 'author', 'text': guide.author.name}))
                    .append(revision_wrapper)
                    .appendTo(row);
            }, this);
        }

        this.loadmask.hide();
        delete this.loadmask;

        if(this.configs.modal){
            this.mask.appendTo(this.configs.parent);
        }

        this.appendTo(this.configs.parent);
    };

    /**
     * The load error event handler
     * 
     * @method onLoadError
     * @private
     * @param {XMLHttpRequest} xhr The <a href="https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest" target="_blank">XMLHttpRequest</a> object
     */
    GuideSelector.prototype.onLoadError = function(xhr){
    };

    return GuideSelector;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').LoadMask = (function () {

    /**
     * A loading mask
     *
     * @class LoadMask
     * @namespace editor.overlay
     * @extends editor.Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.draggable=false] Whether the mask is draggable
     * @param {String} [configs.text='Loading...'] The text to display
     */
    function LoadMask(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        LoadMask.parent.call(this, this.configs);

        this.addClass('loadmask');

        this.text = new metaScore.Dom('<div/>', {'class': 'text', 'text': this.configs.text})
            .appendTo(this.contents);
    }

    LoadMask.defaults = {
        'draggable': false,
        'text': metaScore.Locale.t('editor.overlay.LoadMask.text', 'Loading...')
    };

    metaScore.editor.Overlay.extend(LoadMask);

    return LoadMask;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').Toolbar = (function(){

    /**
     * A title toolbar for overlay's
     *
     * @class Toolbar
     * @namespace editor.overlay
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.title=null] The text to display as a title
     */
    function Toolbar(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Toolbar.parent.call(this, '<div/>', {'class': 'toolbar clearfix'});

        this.title = new metaScore.Dom('<div/>', {'class': 'title'})
            .appendTo(this);

        this.buttons = new metaScore.Dom('<div/>', {'class': 'buttons'})
            .appendTo(this);

        if(this.configs.title){
            this.title.text(this.configs.title);
        }
    }

    Toolbar.defaults = {
        'title': null
    };

    metaScore.Dom.extend(Toolbar);

    /**
     * Get the title's Dom
     * 
     * @method getTitle
     * @return {Dom} The Dom object
     */
    Toolbar.prototype.getTitle = function(){
        return this.title;
    };

    /**
     * Add a button
     * 
     * @method addButton
     * @param {String} action The action associated with the button
     * @return {editor.Button} The created button
     */
    Toolbar.prototype.addButton = function(action){
        var button = new metaScore.editor.Button().data('action', action)
            .appendTo(this.buttons);

        return button;
    };

    /**
     * Get a button by associated action
     * 
     * @method getButton
     * @param {String} action The action associated with the button
     * @return {Dom} The button
     */
    Toolbar.prototype.getButton = function(action){
        return this.buttons.children('[data-action="'+ action +'"]');
    };

    return Toolbar;

})();
/**
 * @module Editor
 */

metaScore.namespace('editor.overlay').iFrame = (function () {


    /**
     * An iframe overlay
     *
     * @class iFrame
     * @namespace editor.overlay
     * @extends editor.Overlay
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Boolean} [configs.toolbar=true] Whether to show a toolbar with a title and close button
     * @param {String} [configs.url=null] The iframe's url
     */
    function iFrame(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        iFrame.parent.call(this, this.configs);

        this.addClass('iframe');
    }

    iFrame.defaults = {
        'toolbar': true,
        'url': null
    };

    metaScore.editor.Overlay.extend(iFrame);

    /**
     * Setup the overlay's UI
     *
     * @method setupUI
     * @private
     */
    iFrame.prototype.setupUI = function(){
        // call parent method
        iFrame.parent.prototype.setupUI.call(this);

        this.frame = new metaScore.Dom('<iframe/>', {'src': this.configs.url})
            .appendTo(this.contents);
    };

    return iFrame;

})();
    // attach the metaScore object to the global scope
    global.metaScore = metaScore;

} (this));