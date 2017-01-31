/*! metaScore - v0.9.1 - 2017-01-31 - Oussama Mubarak */
/**
 * @module Player
 */

window.metaScoreAPI = (function(){

    /**
     * A regular expression used to test incoming messages origin
     *
     * @property _origin_regex
     * @private
     * @type Object
     */
    var origin_regex = /^http?:\/\/metascore.philharmoniedeparis.fr/;

     /**
     * The player API class <br/>
     * <b>A signleton is made available in the global context under metaScoreAPI</b> <br/>
     * HTML links that follow the following format are automatically parsed:
     *
     *         <a href="#{action(s)}" rel="metascore" data-guide="{player's iframe id}">{link text}</a>
     *
     * An action can take arguments in the form of action=arg1,arg2,.. <br/>
     * Multiple actions can be specified seperated by &
     *
     * Examples:
     *
     *         <a href="#play" rel="metascore" data-guide="guide-93">PLAY</a>
     *         <a href="#play=20,500,2" rel="metascore" data-guide="guide-93">PLAY EXTRACT</a>
     *         <a href="#pause" rel="metascore" data-guide="guide-93">PAUSE</a>
     *         <a href="#seek=500" rel="metascore" data-guide="guide-93">SEEL TO 500 SECONDS</a>
     *         <a href="#page=permanentText,3" rel="metascore" data-guide="guide-93">GOT TO PAGE 3 OF THE PERMANENTTEXT BLOCK</a>
     *         <a href="#rindex=2" rel="metascore" data-guide="guide-93">SET THE READING INDEX TO 2</a>
     *         <a href="#page=permanentText,3&rindex=2&seek=500" rel="metascore" data-guide="guide-93">GOT TO PAGE 3 OF THE PERMANENTTEXT BLOCK AND SET THE READING INDEX TO 2 AND SEEK TO 500 SECONDS</a>
     *
     * @class API
     * @constructor
     * @param {HTMLIFrameElement} target The player's iframe to control
     * @param {Function} callback A callback called once the API is ready
     * @param {API} callback.api The API instance
     */
    function API(target, callback) {
        if(typeof target === "string") {
            target = document.getElementById(target);
        }

        this.target = target;
        this.origin = '*';
        this.ready = false;

        this.callbacks = {};

        this.target.addEventListener('load', this.onLoad.bind(this, callback), false);

        window.addEventListener('message', this.onMessage.bind(this), false);
    }

    /**
     * Send a message to the player to invoke a desired method
     *
     * @method postMessage
     * @param {String} method The API method to invoke
     * @param {Mixed} params The parameter(s) to send along
     * @chainable
     */
    API.prototype.postMessage = function(method, params){
        var data;

        if (!this.target.contentWindow.postMessage) {
            return false;
        }

        data = JSON.stringify({
            'method': method,
            'params': params
        });

        this.target.contentWindow.postMessage(data, this.origin);

        return this;
    };

    /**
     * Callback called when the player finished loading
     *
     * @method onLoad
     * @private
     * @param {Function} callback A callback called once the player finished loading
     * @param {API} callback.api The API instance
     */
    API.prototype.onLoad = function(callback){
        this.on('ready', function(){
            callback.call(null, this);
        });
    };

    /**
     * Callback called when a message is received from the player
     * If the received message contains a callback id, it will be invoked with any passed parameters
     *
     * @method onMessage
     * @private
     * @param {MessageEvent} evt The event object containing the message details
     */
    API.prototype.onMessage = function(evt){
        var data, callback, params;

        if(!(origin_regex).test(evt.origin)) {
            return false;
        }

        try {
            data = JSON.parse(evt.data);
        }
        catch(e){
            return false;
        }

        if (!('callback' in data) || !(callback = this.callbacks[data.callback])) {
            return false;
        }

        params = 'params' in data ? data.params : null;

        callback.call(this, params);
    };

    /**
     * Add a listener for player messages
     *
     * @method on
     * @param {String} type The type of message to listen to
     * @param {Function} callback A callback to invoke when a matched message is received
     * @chainable
     */
    API.prototype.on = function(type, callback){
        var callback_id = new Date().valueOf().toString() + Math.random();

        this.callbacks[callback_id] = callback;

        this.postMessage('addEventListener', {'type': type, 'callback': callback_id});

        return this;
    };

    /**
     * Sends a 'play' message to the player
     * Used to start playing the player's media, or play a specific extract
     *
     * @method play
     * @param {String} [inTime] The time at which the player should start playing
     * @param {String} [outTime] The time at which the player should stop playing
     * @param {String} [rIndex] A reading index to go to while playing
     * @chainable
     */
    API.prototype.play = function(inTime, outTime, rIndex){
        this.postMessage('play', {'inTime': inTime, 'outTime': outTime, 'rIndex': rIndex});

        return this;
    };

    /**
     * Sends a 'pause' message to the player
     * Used to pause the player's media playback
     *
     * @method pause
     * @chainable
     */
    API.prototype.pause = function(){
        this.postMessage('pause');

        return this;
    };

    /**
     * Sends a 'seek' message to the player
     * Used to seek the player's media to a specific time
     *
     * @method seek
     * @param {Number} seconds The time in seconds to seek to
     * @chainable
     */
    API.prototype.seek = function(seconds){
        this.postMessage('seek', {'seconds': parseFloat(seconds)});

        return this;
    };

    /**
     * Sends a 'page' message to the player
     * Used to set a block's active page
     *
     * @method page
     * @param {String} block The page's block name
     * @param {Integer} index The page's index
     * @chainable
     */
    API.prototype.page = function(block, index){
        this.postMessage('page', {'block': block, 'index': parseInt(index)-1});

        return this;
    };

    /**
     * Sends a 'rIndex' message to the player
     * Used to set the reading index of the player
     *
     * @method rIndex
     * @param {Integer} index The reading index to set
     * @chainable
     */
    API.prototype.rindex = function(index){
        this.postMessage('rindex', {'index': parseInt(index)});

        return this;
    };

    /**
     * Sends a 'playing' message to the player
     * Used to check the state of the player
     *
     * @method playing
     * @param {Function} callback The callback called when the response is received
     * @param {Boolean} callback.value The state of the player (true if playing, false otherwise)
     * @chainable
     */
    API.prototype.playing = function(callback){
        var callback_id = new Date().valueOf().toString() + Math.random();

        this.callbacks[callback_id] = callback;

        this.postMessage('playing', {'callback': callback_id});

        return this;
    };

    /**
     * Sends a 'time' message to the player
     * Used to get the current time of the player's media
     *
     * @method time
     * @param {Function} callback The callback called when the response is received
     * @param {Number} callback.value The current time of the media in seconds
     * @chainable
     */
    API.prototype.time = function(callback){
        var callback_id = new Date().valueOf().toString() + Math.random();

        this.callbacks[callback_id] = callback;

        this.postMessage('time', {'callback': callback_id});

        return this;
    };

    /**
     * Automatically process API links in the current HTML document
     */
    document.addEventListener("DOMContentLoaded", function(event){
        var links, link, ids = [], iframes, i, callback;

        links = document.querySelectorAll('a[rel="metascore"][data-guide]');

        for(i = 0; i < links.length; ++i){
            link = links[i];

            if(ids.indexOf(link.dataset.guide) < 0){
                ids.push(link.dataset.guide);
            }
        }

        if(ids.length > 0){
            iframes = document.querySelectorAll('iframe#'+ ids.join(',iframe#'));

            callback = function(api){
                var links, handler;
                links = document.querySelectorAll('a[rel="metascore"][data-guide="'+ api.target.id +'"]');

                handler = function(evt){
                    var link = evt.target,
                        actions = link.hash.replace(/^#/, '').split('&'),
                        action;

                    for(var i=0,length=actions.length; i<length; i++){
                        action = actions[i].split('=');

                        if(action[0] in api){
                            api[action[0]].apply(api, action[1].split(','));
                        }
                    }

                    evt.preventDefault();
                };

                for(var i = 0; i < links.length; ++i){
                    links[i].addEventListener('click', handler);
                }
            };

            for(i = 0; i < iframes.length; ++i){
                new API(iframes[i], callback);
            }
        }
    });

    return API;

})();