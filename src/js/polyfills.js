// CustomEvent
(function() {
    if (typeof window.CustomEvent === "function"){
        return;
    }

    function CustomEvent(event, params) {
        const _params = params || {bubbles: false, cancelable: false, detail: undefined};
        const evt = document.createEvent('CustomEvent');

        evt.initCustomEvent(event, _params.bubbles, _params.cancelable, _params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
})();

// Element.matches
(function() {
    if (!Element.prototype.matches) {
        Element.prototype.matches =
            Element.prototype.matchesSelector ||
            Element.prototype.mozMatchesSelector ||
            Element.prototype.msMatchesSelector ||
            Element.prototype.oMatchesSelector ||
            Element.prototype.webkitMatchesSelector ||
            function(s) {
                const matches = (this.document || this.ownerDocument).querySelectorAll(s);
                let i = matches.length;
                while (--i >= 0 && matches.item(i) !== this) {continue;}
                return i > -1;
            };
    }
})();

// NodeList.forEach
(function() {
    if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = function (callback, thisArg) {
            const scope = thisArg || window;
            for (let i = 0; i < this.length; i++) {
                callback.call(scope, this[i], i, this);
            }
        };
    }
})();
