import EventEmitter from './EventEmitter';

/**
 * Fired when the operation is complete (the request's readyState is 4)
 *
 * @event complete
 */
const EVT_COMPLETE = 'complete';

/**
 * Fired when the operation is complete and the status is greater or equal to 200 and less than 300 or equal to 304
 *
 * @event success
 */
const EVT_SUCCESS = 'success';

/**
 * Fired when the operation is complete but the status is not greater or equal to 200 and less than 300 or equal to 304
 *
 * @event error
 */
const EVT_ERROR = 'error';

/**
 * Fired when the operation is aborted
 *
 * @event abort
 */
const EVT_ABORT = 'abort';

// relevant HTTP status codes
const MIN_OK_STATUS = 200;
const MAX_OK_STATUS = 300;
const NOT_MODIFIED_STATUS = 304

/**
 * A class to handle AJAX requests
 */
export default class Ajax extends EventEmitter {

    constructor(url, configs) {
        // call parent constructor
        super();

        let _url = url;

        // bind the readystatechange handler
        this.onReadyStateChange = this.onReadyStateChange.bind(this);

        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        this.xhr = new XMLHttpRequest();

        if(this.configs.method === 'GET' && this.configs.data){
            const params = [];

			Object.entries(this.configs.data).forEach(([key, value]) => {
                params.push(`${key}=${encodeURIComponent(value)}`);
            });

            _url += `?${params.join('&')}`;
        }

        this.xhr.open(this.configs.method, _url, this.configs.async);

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
            this.addListener(EVT_COMPLETE, this.configs.onComplete);
        }
        if(this.configs.onSuccess){
            this.addListener(EVT_SUCCESS, this.configs.onSuccess);
        }
        if(this.configs.onError){
            this.addListener(EVT_ERROR, this.configs.onError);
        }
        if(this.configs.onAbort){
            this.addListener(EVT_ABORT, this.configs.onAbort);
        }

        if(this.configs.autoSend){
            this.send();
        }
    }

    static getDefaults(){
        return {
            'method': 'GET',
            'headers': {},
            'async': true,
            'data': null,
            'dataType': 'json', // xml, json, script, text or html
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
     * @method GET
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} configs to set for the request. See {{#crossLink "Ajax/send:method"}}send{{/crossLink}} for available options
     * @return {Ajax} The Ajax instance
     */
    static GET(url, configs) {

        return new this(url, Object.assign({}, configs, {'method': 'GET'}));

    }

    /**
     * Send an XMLHttp POST request
     *
     * @method POST
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request. See {{#crossLink "Ajax/send:method"}}send{{/crossLink}} for available options
     * @return {Ajax} The Ajax instance
     */
    static POST(url, configs) {

        return new this(url, Object.assign({}, configs, {'method': 'POST'}));

    }

    /**
     * Send an XMLHttp PUT request
     *
     * @method PUT
     * @static
     * @param {String} url The URL to which the request is sent
     * @param {Object} options to set for the request. See {{#crossLink "Ajax/send:method"}}send{{/crossLink}} for available options
     * @return {Ajax} The Ajax instance
     */
    static PUT(url, configs) {

        return new this(url, Object.assign({}, configs, {'method': 'PUT'}));

    }

    onReadyStateChange(){
        switch(this.xhr.readyState){
            case XMLHttpRequest.DONE: {
                let success = false;

                if(this.xhr.status >= MIN_OK_STATUS && this.xhr.status < MAX_OK_STATUS || this.xhr.status === NOT_MODIFIED_STATUS){
                    success = true;
                }
                // local requests can return a status of 0 even if no error occurs
                else if(this.xhr.status === 0 && !this.xhr.error){
                    success = true;
                }

                this.triggerEvent(EVT_COMPLETE);

                if(success){
                    this.triggerEvent(EVT_SUCCESS);
                }
                else{
                    this.triggerEvent(EVT_ERROR);
                }

                break;
            }
        }
    }

    onAbort(){
        this.triggerEvent(EVT_ABORT);

        // reattach the readystatechange handler in case the request is sent again
        this.xhr.addEventListener('readystatechange', this.onReadyStateChange);
    }

    send(){
        this.xhr.send(this.configs.method !== 'GET' ? this.configs.data : null);
        return this;
    }

    abort(){
        // detach the readystatechange handler to prevent the success callback from being falsly called
        this.xhr.removeEventListener('readystatechange', this.onReadyStateChange);

        this.xhr.abort();
        return this;
    }

    setHeaders(headers){
        Object.entries(headers).forEach(([key, value]) => {
            this.xhr.setRequestHeader(key, value);
        });
        return this;
    }

    getXHR(){
        return this.xhr;
    }

    getStatus(){
        return this.xhr.status;
    }

    getStatusText(){
        return this.xhr.statusText;
    }

    getResponse(){
        return this.xhr.response;
    }

    addUploadListener(type, listener){
        this.xhr.upload.addEventListener(type, listener);
        return this;
    }

    removeUploadListener(type, listener){
        this.xhr.upload.removeEventListener(type, listener);
        return this;
    }

}
