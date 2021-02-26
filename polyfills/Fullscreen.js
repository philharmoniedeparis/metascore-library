(function() {
    if (!('requestFullscreen' in Element.prototype)) {
        Element.prototype.requestFullscreen = Element.prototype.mozRequestFullscreen || Element.prototype.webkitRequestFullscreen || Element.prototype.msRequestFullscreen;
    }

    if (!('exitFullscreen' in document)) {
        document.exitFullscreen = document.mozExitFullscreen || document.webkitExitFullscreen || document.msExitFullscreen;
    }

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
})();
