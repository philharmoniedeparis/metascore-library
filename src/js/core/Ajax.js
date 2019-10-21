import EventEmitter from './EventEmitter';
import {isObject} from './utils/Var';

/**
 * A class to handle AJAX requests
 *
 * @emits {complete} Fired when the operation is complete (the request's readyState is 4)
 * @emits {success} Fired when the operation is complete and the status is greater or equal to 200 and less than 300 or equal to 304
 * @emits {error} Fired when the operation is complete but the status is not greater or equal to 200 and less than 300 or equal to 304
 */
export default class Ajax extends EventEmitter {

    /**
     * Instantiate
     */
    constructor(url, configs) {
        // call parent constructor
        super();

        let _url = url;

        // bind the readystatechange handler
        this.onReadyStateChange = this.onReadyStateChange.bind(this);

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        /**
         * The XMLHttpRequest instance
         * @type {XMLHttpRequest}
         */
        this.xhr = new XMLHttpRequest();

        if(this.configs.method === 'GET' && this.configs.data){
            const params = [];

            Object.entries(this.configs.data).forEach(([key, value]) => {
                params.push(`${key}=${encodeURIComponent(value)}`);
            });

            _url += `?${params.join('&')}`;
        }

        this.xhr.open(this.configs.method, _url, this.configs.async);

        this.xhr.responseType = this.configs.responseType;

        if(this.configs.headers){
            this.setHeaders(this.configs.headers);
        }

        if(this.configs.withCredentials){
            this.xhr.withCredentials = true;
        }

        if(this.configs.timeout){
            this.xhr.timeout = this.configs.timeout;
        }

        this.xhr.addEventListener('readystatechange', this.onReadyStateChange);
        this.xhr.addEventListener('abort', this.onAbort.bind(this));

        if(this.configs.onComplete){
            this.addListener('complete', this.configs.onComplete);
        }
        if(this.configs.onSuccess){
            this.addListener('success', this.configs.onSuccess);
        }
        if(this.configs.onError){
            this.addListener('error', this.configs.onError);
        }
        if(this.configs.onAbort){
            this.addListener('abort', this.configs.onAbort);
        }

        if(this.configs.autoSend){
            this.send();
        }
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
    */
    static getDefaults(){
        return {
            'method': 'GET',
            'headers': {},
            'async': true,
            'data': null,
            'responseType': 'json',
            'withCredentials': false,
            'timeout': null,
            'autoSend': true,
            'onComplete': null,
            'onSuccess': null,
            'onError': null,
        };
    }

    /**
     * Send an XMLHttp GET request
     *
     * @param {String} url The URL to which the request is sent
     * @param {Object} configs Custom configs to override defaults
     * @return {Ajax} The Ajax instance
     */
    static GET(url, configs) {

        return new this(url, Object.assign({}, configs, {'method': 'GET'}));

    }

    /**
     * Send an XMLHttp POST request
     *
     * @param {String} url The URL to which the request is sent
     * @param {Object} configs Custom configs to override defaults
     * @return {Ajax} The Ajax instance
     */
    static POST(url, configs) {

        return new this(url, Object.assign({}, configs, {'method': 'POST'}));

    }

    /**
     * Send an XMLHttp PUT request
     *
     * @param {String} url The URL to which the request is sent
     * @param {Object} configs Custom configs to override defaults
     * @return {Ajax} The Ajax instance
     */
    static PUT(url, configs) {

        return new this(url, Object.assign({}, configs, {'method': 'PUT'}));

    }

    /**
     * Send an XMLHttp PATCH request
     *
     * @param {String} url The URL to which the request is sent
     * @param {Object} configs Custom configs to override defaults
     * @return {Ajax} The Ajax instance
     */
    static PATCH(url, configs) {

        return new this(url, Object.assign({}, configs, {'method': 'PATCH'}));

    }

    /**
     * Send an XMLHttp DELETE request
     *
     * @param {String} url The URL to which the request is sent
     * @param {Object} configs Custom configs to override defaults
     * @return {Ajax} The Ajax instance
     */
    static DELETE(url, configs) {

        return new this(url, Object.assign({}, configs, {'method': 'DELETE'}));

    }

    /**
    * readystatechange event callback
    *
    * @private
    */
    onReadyStateChange(){
        switch(this.xhr.readyState){
            case XMLHttpRequest.DONE: {
                let success = false;

                const min_ok_status = 200;
                const max_ok_status = 300;
                const not_modified_status = 304

                if(this.xhr.status >= min_ok_status && this.xhr.status < max_ok_status || this.xhr.status === not_modified_status){
                    success = true;
                }
                // local requests can return a status of 0 even if no error occurs
                else if(this.xhr.status === 0 && !this.xhr.error){
                    success = true;
                }

                this.triggerEvent('complete');

                if(success){
                    this.triggerEvent('success');
                }
                else{
                    this.triggerEvent('error');
                }

                break;
            }
        }
    }

    /**
    * abort event callback
    *
    * @private
    * @emits {abort} Fired when the operation is aborted
    */
    onAbort(){
        this.triggerEvent('abort');

        // reattach the readystatechange handler in case the request is sent again
        this.xhr.addEventListener('readystatechange', this.onReadyStateChange);
    }

    /**
    * Send the XHR request
    *
    * @return {this}
    */
    send(){
        this.xhr.send(this.configs.method !== 'GET' ? this.configs.data : null);
        return this;
    }

    /**
    * Abort the XHR request
    *
    * @return {this}
    */
    abort(){
        // detach the readystatechange handler to prevent the success callback from being falsly called
        this.xhr.removeEventListener('readystatechange', this.onReadyStateChange);

        this.xhr.abort();
        return this;
    }

    /**
    * Set request headers
    *
    * @param {Object} headers The list of headers as header/value to set
    * @return {this}
    */
    setHeaders(headers){
        Object.entries(headers).forEach(([key, value]) => {
            this.xhr.setRequestHeader(key, value);
        });
        return this;
    }

    /**
    * Get the XMLHttpRequest instance
    *
    * @return {XMLHttpRequest} The request instance
    */
    getXHR(){
        return this.xhr;
    }

    /**
    * Get the XMLHttpRequest status
    *
    * @return {Number} The numerical status code of the response
    */
    getStatus(){
        return this.xhr.status;
    }

    /**
    * Get the XMLHttpRequest statusText
    *
    * @return {DOMString} The response's status message
    */
    getStatusText(){
        return this.xhr.statusText;
    }

    /**
    * Get the XMLHttpRequest response
    *
    * @return {*} The response's body content
    */
    getResponse(){
        let response = this.xhr.response;

        // workaround for IE11 and Edge, which don't support XHR.responseType = json
        if(this.configs.responseType === 'json' && !isObject(response)) {
            try{
                response = JSON.parse(response);
            }
            catch(e){
                console.error(e);
            }
        }

        return response;
    }

    /**
    * Get the XMLHttpRequest responseXML
    *
    * @return {*} The response's body content
    */
    getXMLResponse(){
        return this.xhr.responseXML;
    }

    /**
    * Add an upload listener
    *
    * @param {String} type The event type to listen to
    * @param {Function} listener The callback function
    * @return {this}
    */
    addUploadListener(type, listener){
        this.xhr.upload.addEventListener(type, listener);
        return this;
    }

    /**
    * Remove an upload listener
    *
    * @param {String} type The event type to stop listening to
    * @param {Function} listener The callback function
    * @return {this}
    */
    removeUploadListener(type, listener){
        this.xhr.upload.removeEventListener(type, listener);
        return this;
    }

}
