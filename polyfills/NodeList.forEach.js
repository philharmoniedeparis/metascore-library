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
