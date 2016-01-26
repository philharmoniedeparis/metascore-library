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