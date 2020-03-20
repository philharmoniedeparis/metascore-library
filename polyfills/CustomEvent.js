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

