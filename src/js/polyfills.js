// CustomEvent
(function() {
    if (typeof window.CustomEvent === "function"){
        return;
    }

    function CustomEvent(event, params) {
        const _params = params || {bubbles: false, cancelable: false, detail: null};
        const evt = document.createEvent('CustomEvent');

        evt.initCustomEvent(event, _params.bubbles, _params.cancelable, _params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
})();

// Element.prototype.matches
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

// Element.prototype.closest
(function() {
  if (!Element.prototype.closest) {
    Element.prototype.closest = function(s) {
      let el = this;

      do {
        if (el.matches(s)){
            return el;
        }
        el = el.parentElement || el.parentNode;
      } while (el !== null && el.nodeType === 1);
      return null;
    };
  }
})();

// NodeList.prototype.forEach
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

// Node.prototype.childElementCount
(function(constructor) {
    if (constructor && constructor.prototype && !constructor.prototype.childElementCount) {
        Object.defineProperty(constructor.prototype, 'childElementCount', {
            get: function() {
                const nodes = this.childNodes;
                let count = 0;
                for (let i = 0; i < nodes.length; i++) {
                    if (nodes[i].nodeType === 1){
                        count++;
                    }
                }
                return count;
            }
        });
    }
})(window.Node || window.Element);

// HTMLTemplateElement.prototype.content
(function() {
    const needsTemplate = typeof HTMLTemplateElement === "undefined";

    const needsCloning = (() => {
        if(needsTemplate) {
            return false;
        }

        const template1 = document.createElement("template");
        const template2 = document.createElement("template");

        template1.content.appendChild(document.createElement("div"));
        template2.content.appendChild(template1);

        const clone = template2.cloneNode(true);

        return clone.content.childNodes.length === 0 || clone.content.firstChild.content.childNodes.length === 0;
    })();

    if(!(needsTemplate || needsCloning)){
        return;
    }

    if (/Trident/.test(navigator.userAgent)) {
        (function() {
            const importNode = document.importNode;
            document.importNode = function(...args) {
                const n = importNode.apply(document, args);

                if (n.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                    const fragment = document.createDocumentFragment();
                    fragment.appendChild(n);
                    return fragment;
                }

                return n;
            };
        })();
    }

    const TemplateElement = function() {}; // eslint-disable-line no-empty-function

    const escapeDataRegExp = /[&\u00A0<>]/g;
    function escapeReplace(c) {
        switch (c) {
            case "&":
                return "&amp;";
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case " ":
            default:
                return "&nbsp;";
        }
    }

    function escapeData(s) {
        return s.replace(escapeDataRegExp, escapeReplace);
    }

    if (needsTemplate) {
        const contentDoc = document.implementation.createHTMLDocument("template");
        let canDecorate = true;

        const templateStyle = document.createElement("style");
        templateStyle.textContent = "template{display:none;}";
        document.head.insertBefore(templateStyle, document.head.firstElementChild);

        TemplateElement.prototype = Object.create(HTMLElement.prototype);
        TemplateElement.decorate = function(template) {
            if (template.content) {
                return;
            }

            template.content = contentDoc.createDocumentFragment();

            let child = template.firstChild;
            while (child) {
            template.content.appendChild(child);
            child = template.firstChild;
            }

            template.cloneNode = function(deep) {
                return TemplateElement.cloneNode(this, deep);
            };

            if(canDecorate){
                try {
                    Object.defineProperty(template, "innerHTML", {
                        get: function() {
                            let value = "";
                            for (let e = this.content.firstChild; e; e = e.nextSibling) {
                                value += e.outerHTML || escapeData(e.data);
                            }
                            return value;
                        },
                        set: function(text) {
                            contentDoc.body.innerHTML = text;
                            TemplateElement.bootstrap(contentDoc);

                            while (this.content.firstChild) {
                                this.content.removeChild(this.content.firstChild);
                            }

                            while (contentDoc.body.firstChild) {
                                this.content.appendChild(contentDoc.body.firstChild);
                            }
                        },
                        configurable: true
                    });
                }
                catch (err) {
                    canDecorate = false;
                }
            }
            TemplateElement.bootstrap(template.content);
        };
        TemplateElement.bootstrap = function(doc) {
            const templates = doc.querySelectorAll("template");
            for (let i = 0, l = templates.length, t; i < l && (t = templates[i]); i++) {
                TemplateElement.decorate(t);
            }
        };

        document.addEventListener("DOMContentLoaded", () => {
            TemplateElement.bootstrap(document);
        });

        const createElement = document.createElement;
        const createElementNS = document.createElementNS;

        document.createElement = function() {
            "use strict";
            const el = createElement.apply(document, arguments); // eslint-disable-line prefer-rest-params
            if (el.localName === "template") {
                TemplateElement.decorate(el);
            }
            return el;
        };
        document.createElementNS = function() {
            "use strict";
            const el = createElementNS.apply(document, arguments); // eslint-disable-line prefer-rest-params
            if (el.namespaceURI === "http://www.w3.org/1999/xhtml" && el.localName === "template") {
                TemplateElement.decorate(el);
            }
            return el;
        };
    }

    const nativeCloneNode = Node.prototype.cloneNode;

    TemplateElement.cloneNode = function(template, deep) {
        const clone = nativeCloneNode.call(template, false);

        if(this.decorate){
            this.decorate(clone);
        }

        if(deep){
            clone.content.appendChild(nativeCloneNode.call(template.content, true));
            this.fixClonedDom(clone.content, template.content);
        }

        return clone;
    };
    TemplateElement.fixClonedDom = function(clone, source) {
        if(!source.querySelectorAll) {
            return;
        }

        const s$ = source.querySelectorAll("template");
        const t$ = clone.querySelectorAll("template");

        for (let i = 0, l = t$.length, t, s; i < l; i++) {
            s = s$[i];
            t = t$[i];

            if (this.decorate) {
                this.decorate(s);
            }

            t.parentNode.replaceChild(s.cloneNode(true), t);
        }
    };
    const originalImportNode = document.importNode;

    Node.prototype.cloneNode = function(deep) {
        const dom = nativeCloneNode.call(this, deep);
        if (deep) {
            TemplateElement.fixClonedDom(dom, this);
        }
        return dom;
    };

    document.importNode = function(element, deep) {
        if(element.localName === "template"){
            return TemplateElement.cloneNode(element, deep);
        }

        const dom = originalImportNode.call(document, element, deep);
        if(deep){
            TemplateElement.fixClonedDom(dom, element);
        }

        return dom;
    };

    if(needsTemplate){
        window.HTMLTemplateElement = TemplateElement;
    }
    else{
        HTMLTemplateElement.prototype.cloneNode = function(deep) {
            return TemplateElement.cloneNode(this, deep);
        };
    }
})();

// Element.requestFullscreen
if (!('requestFullscreen' in Element.prototype)) {
    Element.prototype.requestFullscreen = Element.prototype.mozRequestFullscreen || Element.prototype.webkitRequestFullscreen || Element.prototype.msRequestFullscreen;
}
// document.exitFullscreen
if (!('exitFullscreen' in document)) {
    document.exitFullscreen = document.mozExitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
}
// document.fullscreenElement
if (!('fullscreenElement' in document)) {
    Object.defineProperty(document, 'fullscreenElement', {
        get: function() {
            return document.mozFullScreenElement || document.msFullscreenElement || document.webkitFullscreenElement;
        }
    });

    Object.defineProperty(document, 'fullscreenEnabled', {
        get: function() {
            return document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitFullscreenEnabled;
        }
    });
}

// windowconvertPointFromPageToNode & window.convertPointFromNodeToPage
import 'geometry-polyfill';
(function() {
    if (typeof window.convertPointFromPageToNode === "function" && typeof window.convertPointFromNodeToPage === "function"){
        return;
    }

    const I = new window.DOMMatrix();

    class Point{
        constructor(x, y, z){
            this.x = x;
            this.y = y;
            this.z = z;
        }

        transformBy(matrix) {
            const tmp = matrix.multiply(I.translate(this.x, this.y, this.z));
            return new Point(tmp.m41, tmp.m42, tmp.m43);
        }
    }

    function getTransformationMatrix(element) {
        let transformationMatrix = I;
        let x = element;

        while (typeof x !== "undefined" && x !== x.ownerDocument.documentElement) {
            const computedStyle = window.getComputedStyle(x);
            const transform = computedStyle.transform || "none";
            const c = transform === "none" ? I : new window.DOMMatrix(transform);

            transformationMatrix = c.multiply(transformationMatrix);
            x = x.parentNode;
        }

        const w = element.offsetWidth;
        const h = element.offsetHeight;
        const p0 = new Point(0, 0, 0).transformBy(transformationMatrix);
        const p1 = new Point(w, 0, 0).transformBy(transformationMatrix);
        const p2 = new Point(w, h, 0).transformBy(transformationMatrix);
        const p3 = new Point(0, h, 0).transformBy(transformationMatrix);
        const left = Math.min(p0.x, p1.x, p2.x, p3.x);
        const top = Math.min(p0.y, p1.y, p2.y, p3.y);
        const rect = element.getBoundingClientRect();

        transformationMatrix = I.translate(window.pageXOffset + rect.left - left, window.pageYOffset + rect.top - top, 0).multiply(transformationMatrix);

        return transformationMatrix;
    }

    /**
     * Helper function to convert coordinates from the page's coordinate system to an element's local coordinate system
     * (works properly with css transforms without perspective projection)
     *
     * @param {DOMElement} element The dom element
     * @param {Number} pageX The x postion in the page's coordinate system
     * @param {Number} pageY The y postion in the page's coordinate system
     * @returns {Object} The x and y position in the element's local coordinate system
     */
    window.convertPointFromPageToNode = window.convertPointFromPageToNode || function (element, pageX, pageY) {
        return new Point(pageX, pageY, 0).transformBy(getTransformationMatrix(element).inverse());
    };

    /**
     * Helper function to convert coordinates from the page's coordinate system to an element's local coordinate system
     * (works properly with css transforms without perspective projection)
     *
     * @param {DOMElement} element The dom element
     * @param {Number} offsetX The x postion in the element's local coordinate system
     * @param {Number} offset> The y postion in the element's local coordinate system
     * @returns {Object} The x and y position in the page's coordinate system
     */
    window.convertPointFromNodeToPage = window.convertPointFromNodeToPage || function (element, offsetX, offsetY) {
        return new Point(offsetX, offsetY, 0).transformBy(getTransformationMatrix(element));
    };
})();
