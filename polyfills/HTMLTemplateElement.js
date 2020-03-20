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
