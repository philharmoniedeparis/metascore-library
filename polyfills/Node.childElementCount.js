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
