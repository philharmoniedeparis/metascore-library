import {isFunction} from './utils/Var';

/**
 * A class to handle AJAX requests
 */
export default class Ajax {

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
     * @param {Object} [options.data] Data to be send along with the request
     * @param {String} [options.dataType='json'] The type of data expected back from the server
     * @param {Funtion} [options.complete] A function to be called when the request finishes
     * @param {Funtion} [options.success] A function to be called if the request succeeds
     * @param {Funtion} [options.error] A function to be called if the request fails
     * @param {Object} [options.scope=this] The object to which the scope of the above functions should be set
     * @return {XMLHttpRequest} The XHR request
     */
    static send(url, options) {

        let xhr = new XMLHttpRequest(),
            defaults = {
                'method': 'GET',
                'headers': {},
                'async': true,
                'data': null,
                'dataType': 'json', // xml, json, script, text or html
                'complete': null,
                'success': null,
                'error': null,
                'scope': this
            },
            params;

        options = Object.assign({}, defaults, options);

        if(options.method === 'GET' && options.data){
            params = [];

			Object.entries(options.data).forEach(([key, value]) => {
                params.push(`${key}=${encodeURIComponent(value)}`);
            });

            url += `?${params.join('&')}`;

            options.data = null;
        }

        xhr.open(options.method, url, options.async);

        if(options.headers){
            Object.entries(options.headers).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
            });
        }

        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if(isFunction(options.complete)){
                    options.complete.call(options.scope, xhr);
                }
                if((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304){
                    if(isFunction(options.success)){
                        options.success.call(options.scope, xhr);
                    }
                }
                else if(isFunction(options.error)){
                    options.error.call(options.scope, xhr);
                }
            }
        };

        xhr.send(options.data);

        return xhr;

    }

    /**
     * Send an XMLHttp GET request
     *
     * @method get
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request. See {{#crossLink "Ajax/send:method"}}send{{/crossLink}} for available options
     * @return {XMLHttpRequest} The XHR request
     */
    static get(url, options) {

        Object.assign(options, {'method': 'GET'});

        return Ajax.send(url, options);

    }

    /**
     * Send an XMLHttp POST request
     *
     * @method post
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request. See {{#crossLink "Ajax/send:method"}}send{{/crossLink}} for available options
     * @return {XMLHttpRequest} The XHR request
     */
    static post(url, options) {

        Object.assign(options, {'method': 'POST'});

        return Ajax.send(url, options);

    }

    /**
     * Send an XMLHttp PUT request
     *
     * @method put
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request. See {{#crossLink "Ajax/send:method"}}send{{/crossLink}} for available options
     * @return {XMLHttpRequest} The XHR request
     */
    static put(url, options) {

        Object.assign(options, {'method': 'PUT'});

        return Ajax.send(url, options);

    }

}
