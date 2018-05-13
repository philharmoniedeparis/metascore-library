/**
 * The Player module defines classes used in player
 *
 * @module Player
 * @main
 */

metaScore.Player = (function(){

    /**
     * Fired when the guide's loading finished successfully
     *
     * @event load
     * @param {Object} player The player instance
     * @param {Object} data The json data loaded
     */
    var EVT_LOAD = 'load';

    /**
       * Fired when the guide's loading failed
       *
       * @event loaderror
       * @param {Object} player The player instance
       */
    var EVT_ERROR = 'error';

    /**
       * Fired when the id is set
       *
       * @event idset
       * @param {Object} player The player instance
       * @param {String} id The guide's id
       */
    var EVT_IDSET = 'idset';

    /**
       * Fired when the vid is set
       *
       * @event revisionset
       * @param {Object} player The player instance
       * @param {Integer} vid The guide's vid
       */
    var EVT_REVISIONSET = 'revisionset';

    /**
       * Fired when the media is added
       *
       * @event mediaadd
       * @param {Object} player The player instance
       * @param {Object} media The media instance
       */
    var EVT_MEDIAADD = 'mediaadd';

    /**
       * Fired when the controller is added
       *
       * @event controlleradd
       * @param {Object} player The player instance
       * @param {Object} controller The controller instance
       */
    var EVT_CONTROLLERADD = 'controlleradd';

    /**
       * Fired when a block is added
       *
       * @event blockadd
       * @param {Object} player The player instance
       * @param {Object} block The block instance
       */
    var EVT_BLOCKADD = 'blockadd';

    /**
       * Fired when the reading index is set
       *
       * @event rindex
       * @param {Object} player The player instance
       * @param {Object} value The reading index value
       */
    var EVT_RINDEX = 'rindex';

    /**
     * Provides the main Player class
     *
     * @class Player
     * @extends Dom
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {String} [configs.url=''] The URL of the guide's JSON data to load
     * @param {Mixed} [configs.container='body'] The HTMLElement, Dom instance, or CSS selector to which the player should be appended
     * @param {Object} [configs.ajax={}] Custom options to send with each AJAX request. See {{#crossLink "Ajax/send:method"}}Ajax.send{{/crossLink}} for available options
     * @param {Boolean} [configs.keyboard=false] Whether to activate keyboard shortcuts or not
     * @param {Boolean} [configs.api=false] Whether to allow API access or not
     * @param {Boolean} [configs.autoload=true] Whether to automatically call the load function
     */
    function Player(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        Player.parent.call(this, '<div></div>', {'class': 'metaScore-player'});
        
        this.loaded = false;

        if(this.configs.api){
            metaScore.Dom.addListener(window, 'message', metaScore.Function.proxy(this.onAPIMessage, this));
        }
        
        this.contextmenu = new metaScore.ContextMenu({'target': this, 'items': {
                'about': {
                    'text': metaScore.Locale.t('player.contextmenu.about', 'metaScore v.!version r.!revision', {'!version': metaScore.getVersion(), '!revision': metaScore.getRevision()})
                },
                'logo': {
                    'class': 'logo'
                }
            }})
            .appendTo(this);

        this.appendTo(this.configs.container);

        if(this.configs.autoload !== false){
            this.load();
        }
    }

    Player.defaults = {
        'url': '',
        'container': 'body',
        'ajax': {},
        'keyboard': false,
        'api': false,
        'autoload': true
    };

    metaScore.Dom.extend(Player);

    /**
     * Keydown event callback
     *
     * @method onKeydown
     * @private
     * @param {KeyboardEvent} evt The event object
     */
    Player.prototype.onKeydown = function(evt){
        switch(evt.keyCode){
            case 32: //space-bar
                this.togglePlay();
                evt.preventDefault();
                break;

            case 37: //left
                this.find('.metaScore-component.block:hover .pager .button[data-action="previous"]').triggerEvent('click');
                evt.preventDefault();
                break;

            case 39: //right
                this.find('.metaScore-component.block:hover .pager .button[data-action="next"]').triggerEvent('click');
                evt.preventDefault();
                break;
        }
    };

    /**
     * API message event callback
     *
     * @method onAPIMessage
     * @private
     * @param {MessageEvent} evt The event object
     */
    Player.prototype.onAPIMessage = function(evt){
        var player = this,
            data,
            source, origin, method, params,
            dom;

        try {
            data = JSON.parse(evt.data);
        }
        catch(e){
            return false;
        }

        if (!('method' in data)) {
            return false;
        }

        source = evt.source;
        origin = evt.origin;
        method = data.method;
        params = 'params' in data ? data.params : null;

        switch(method){
            case 'play':
                player.play(params.inTime, params.outTime, params.rIndex);
                break;

            case 'pause':
                player.getMedia().pause();
                break;

            case 'seek':
                player.getMedia().setTime(parseFloat(params.seconds, 10) * 100);
                break;

            case 'page':
                dom = player.getComponent('.block[data-name="'+ params.block +'"]');
                if(dom && dom._metaScore){
                    dom._metaScore.setActivePage(params.index);
                }
                break;

            case 'hideBlock':
                dom = player.getComponent('.block[data-name="'+ params.name +'"]');
                if(dom && dom._metaScore){
                    dom._metaScore.toggleVisibility(false);
                }
                break;

            case 'showBlock':
                dom = player.getComponent('.block[data-name="'+ params.name +'"]');
                if(dom && dom._metaScore){
                    dom._metaScore.toggleVisibility(true);
                }
                break;

            case 'toggleBlock':
                dom = player.getComponent('.block[data-name="'+ params.name +'"]');
                if(dom && dom._metaScore){
                    dom._metaScore.toggleVisibility();
                }
                break;

            case 'rindex':
                player.setReadingIndex(!isNaN(params.index) ? params.index : 0);
                break;

            case 'playing':
                source.postMessage(JSON.stringify({
                    'callback': params.callback,
                    'params': player.getMedia().isPlaying()
                }), origin);
                break;

            case 'time':
                source.postMessage(JSON.stringify({
                    'callback': params.callback,
                    'params': player.getMedia().getTime() / 100
                }), origin);
                break;

            case 'addEventListener':
                switch(params.type){
                    case 'ready':
                        if(player.loaded){
                            source.postMessage(JSON.stringify({
                                'callback': params.callback
                            }), origin);
                        }
                        else{
                            player.addListener('load', function(event){
                                source.postMessage(JSON.stringify({
                                    'callback': params.callback
                                }), origin);
                            });
                        }
                        break;

                    case 'timeupdate':
                        player.addListener(params.type, function(event){
                            source.postMessage(JSON.stringify({
                                'callback': params.callback,
                                'params': event.detail.media.getTime() / 100
                            }), origin);
                        });
                        break;

                    case 'rindex':
                        player.addListener(params.type, function(event){
                            source.postMessage(JSON.stringify({
                                'callback': params.callback,
                                'params': event.detail.value
                            }), origin);
                        });
                        break;
                }
                break;

            case 'removeEventListener':
                break;
        }
    };

    /**
     * Controller button click event callback
     *
     * @method onControllerButtonClick
     * @private
     * @param {MouseEvent} evt The event object
     */
    Player.prototype.onControllerButtonClick = function(evt){
        var action = metaScore.Dom.data(evt.target, 'action');

        switch(action){
            case 'rewind':
                this.getMedia().reset();
                break;

            case 'play':
                this.togglePlay();
                break;
        }

        evt.stopPropagation();
    };

    /**
     * Media loadedmetadata event callback
     *
     * @method onMediaLoadedMetadata
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaLoadedMetadata = function(evt){
        this.getMedia().reset();
    };

    /**
     * Media waiting event callback
     *
     * @method onMediaWaiting
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaWaiting = function(evt){
        this.addClass('media-waiting');
    };

    /**
     * Media seeking event callback
     *
     * @method onMediaSeeking
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaSeeking = function(evt){
        this.addClass('media-waiting');
    };

    /**
     * Media seeked event callback
     *
     * @method onMediaSeeked
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaSeeked = function(evt){
        this.removeClass('media-waiting');
    };

    /**
     * Media playing event callback
     *
     * @method onMediaPlaying
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaPlaying = function(evt){
        this.removeClass('media-waiting');
        
        this.controller.addClass('playing');
    };

    /**
     * Media play event callback
     *
     * @method onMediaPlay
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaPlay = function(evt){
        this.removeClass('media-waiting');
        
        this.controller.addClass('playing');
    };

    /**
     * Media pause event callback
     *
     * @method onMediaPause
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaPause = function(evt){
        this.removeClass('media-waiting');
        
        this.controller.removeClass('playing');
    };

    /**
     * Media timeupdate event callback
     *
     * @method onMediaTimeUpdate
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaTimeUpdate = function(evt){
        var currentTime = evt.detail.media.getTime();

        this.controller.updateTime(currentTime);
    };

    /**
     * Media suspend event callback
     *
     * @method onMediaSuspend
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaSuspend = function(evt){
        this.removeClass('media-waiting');
    };

    /**
     * Media suspend event callback
     *
     * @method onMediaStalled
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaStalled = function(evt){
        this.removeClass('media-waiting');
    };

    /**
     * Media error event callback
     *
     * @method onMediaError
     * @private
     * @param {Event} evt The event object
     */
    Player.prototype.onMediaError = function(evt){
        var error = evt.target.error,
            text;
        
        this.removeClass('media-waiting');
        
        switch(error.code) {
            case error.MEDIA_ERR_ABORTED:
                text = metaScore.Locale.t('player.onMediaError.Aborted.msg', 'You aborted the media playback.');
                break;
                
            case error.MEDIA_ERR_NETWORK:
                text = metaScore.Locale.t('player.onMediaError.Network.msg', 'A network error caused the media download to fail.');
                break;
                
            case error.MEDIA_ERR_DECODE:
                text = metaScore.Locale.t('player.onMediaError.Decode.msg', 'The media playback was aborted due to a format problem.');
                break;
                
            case error.MEDIA_ERR_SRC_NOT_SUPPORTED:
                text = metaScore.Locale.t('player.onMediaError.NotSupported.msg', 'The media could not be loaded, either because the server or network failed or because the format is not supported.');
                break;
                
            default:
                text = metaScore.Locale.t('player.onMediaError.Default.msg', 'An unknown error occurred.');
                break;
        }
        
        new metaScore.overlay.Alert({
            'parent': this,
            'text': text,
            'buttons': {
                'ok': metaScore.Locale.t('editor.onMediaError.ok', 'OK'),
            },
            'autoShow': true
        });
    };

    /**
     * Block pageactivate event callback
     *
     * @method onPageActivate
     * @private
     * @param {CustomEvent} evt The event object
     */
    Player.prototype.onPageActivate = function(evt){
        var block = evt.target._metaScore,
            page = evt.detail.page,
            basis = evt.detail.basis;

        if(block.getProperty('synched') && (basis !== 'pagecuepoint')){
            this.getMedia().setTime(page.getProperty('start-time'));
        }
    };

    /**
     * Element of type Cursor time event callback
     *
     * @method onCursorElementTime
     * @private
     * @param {CustomEvent} evt The event object
     */
    Player.prototype.onCursorElementTime = function(evt){            
        if(!this.hasClass('editing') || evt.detail.element.hasClass('selected')){
            this.getMedia().setTime(evt.detail.value);
        }
    };

    /**
     * Element of type Text play event callback
     *
     * @method onTextElementPlay
     * @private
     * @param {CustomEvent} evt The event object
     */
    Player.prototype.onTextElementPlay = function(evt){
        this.play(evt.detail.inTime, evt.detail.outTime, evt.detail.rIndex);
    };

    /**
     * Element of type Text page event callback
     *
     * @method onTextElementPage
     * @private
     * @param {CustomEvent} evt The event object
     */
    Player.prototype.onTextElementPage = function(evt){
        var dom = this.getComponent('.block[data-name="'+ evt.detail.block +'"]');
        if(dom && dom._metaScore){
            dom._metaScore.setActivePage(evt.detail.index);
        }
    };

    /**
     * Element of type Text block_visibility event callback
     *
     * @method onTextElementBlockVisibility
     * @private
     * @param {CustomEvent} evt The event object
     */
    Player.prototype.onTextElementBlockVisibility = function(evt){
        var dom = this.getComponent('.block[data-name="'+ evt.detail.block +'"]'),
            show;
            
        if(dom && dom._metaScore){
            switch(evt.detail.action){
                case 'show':
                    show = true;
                    break;
                case 'hide':
                    show = false;
                    break;
            }
            
            dom._metaScore.toggleVisibility(show);
        }
    };

    /**
     * Componenet propchange event callback
     *
     * @method onComponenetPropChange
     * @private
     * @param {CustomEvent} evt The event object
     */
    Player.prototype.onComponenetPropChange = function(evt){
        var component = evt.detail.component,
            cuepoint;

        switch(evt.detail.property){
            case 'start-time':
            case 'end-time':
                component.setCuePoint({
                    'media': this.getMedia()
                });
                break;
                
            case 'direction':
            case 'acceleration':
                cuepoint = component.getCuePoint();
                if(cuepoint){
                    cuepoint.update();
                }
                break;
        }
    };

    /**
     * loadsuccess event callback
     *
     * @method onLoadSuccess
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Player.prototype.onLoadSuccess = function(xhr){
        this.json = JSON.parse(xhr.response);

        this.setId(this.json.id)
            .setRevision(this.json.vid);

        this.css = new metaScore.StyleSheet()
            .setInternalValue(this.json.css)
            .appendTo(document.head);

        this.rindex_css = new metaScore.StyleSheet()
            .appendTo(document.head);

        metaScore.Array.each(this.json.blocks, function(index, block){
            switch(block.type){
                case 'media':
                    this.media = this.addMedia(metaScore.Object.extend({}, block, {'type': this.json.type}))
                        .setSources([this.json.media]);
                    break;

                case 'controller':
                    this.controller = this.addController(block);
                    break;

                default:
                    this.addBlock(block);
            }
        }, this);

        if(this.configs.keyboard){
            new metaScore.Dom('body').addListener('keydown', metaScore.Function.proxy(this.onKeydown, this));
        }

        this.removeClass('loading');
        
        this.loaded = true;

        this.triggerEvent(EVT_LOAD, {'player': this, 'data': this.json}, true, false);
    };

    /**
     * loaderror event callback
     *
     * @method onLoadError
     * @private
     * @param {XMLHttpRequest} xhr The XHR request
     */
    Player.prototype.onLoadError = function(xhr){
        this.removeClass('loading');

        this.triggerEvent(EVT_ERROR, {'player': this}, true, false);
    };

    /**
     * Load the guide
     *
     * @method load
     * @private
     */
    Player.prototype.load = function(){
        var options;

        this.addClass('loading');

        options = metaScore.Object.extend({}, {
            'success': metaScore.Function.proxy(this.onLoadSuccess, this),
            'error': metaScore.Function.proxy(this.onLoadError, this)
        }, this.configs.ajax);


        metaScore.Ajax.get(this.configs.url, options);
    };

    /**
     * Get the id of the loaded guide
     *
     * @method getId
     * @return {String} The id
     */
    Player.prototype.getId = function(){
        return this.data('id');
    };

    /**
     * Set the id of the loaded guide in a data attribute
     *
     * @method setId
     * @param {String} id The id
     * @param {Boolean} [supressEvent=false] Whether to supress the idset event
     * @chainable
     */
    Player.prototype.setId = function(id, supressEvent){
        this.data('id', id);

        if(supressEvent !== true){
            this.triggerEvent(EVT_IDSET, {'player': this, 'id': id}, true, false);
        }

        return this;
    };

    /**
     * Get the revision id of the loaded guide
     *
     * @method getRevision
     * @return {String} The revision id
     */
    Player.prototype.getRevision = function(){
        return this.data('vid');
    };

    /**
     * Set the revision id of the loaded guide in a data attribute
     *
     * @method setRevision
     * @param {String} id The id
     * @param {Boolean} [supressEvent=false] Whether to supress the revisionset event
     * @chainable
     */
    Player.prototype.setRevision = function(vid, supressEvent){
        this.data('vid', vid);

        if(supressEvent !== true){
            this.triggerEvent(EVT_REVISIONSET, {'player': this, 'vid': vid}, true, false);
        }

        return this;
    };

    /**
     * Get the loaded JSON data
     *
     * @method getData
     * @param {String} [key] An optional data key
     * @return {Object} The value corresponding to the key, or the entire JSON data
     */
    Player.prototype.getData = function(key){
        if(key){
            return this.json[key];
        }
        
        return this.json;
    };

    /**
     * Get the media instance
     *
     * @method getMedia
     * @return {Media} The media instance
     */
    Player.prototype.getMedia = function(){
        return this.media;
    };

    /**
     * Update the loaded JSON data
     *
     * @method updateData
     * @param {Object} data The data key, value pairs to update
     * @param {Boolean} [skipInternalUpdates=false] Whether to skip internal update methods for CSS, media sources, etc
     * @chainable
     */
    Player.prototype.updateData = function(data, skipInternalUpdates){
        metaScore.Object.extend(this.json, data);

        if(skipInternalUpdates !== true){
            if('css' in data){
                this.updateCSS(data.css);
            }

            if('media' in data){
                this.getMedia().setSources([data.media]);
            }

            if('vid' in data){
                this.setRevision(data.vid);
            }
        }
        
        return this;
    };

    /**
     * Get a component by CSS selector
     *
     * @method getComponent
     * @param {String} selector The CSS selector
     * @return {Component} The component
     */
    Player.prototype.getComponent = function(selector){
        return this.getComponents(selector).get(0);
    };

    /**
     * Get components by CSS selector
     *
     * @method getComponents
     * @param {String} selector The CSS selector
     * @return {Dom} A Dom instance containing the selected components
     */
    Player.prototype.getComponents = function(selector){
        var components;

        components = this.find('.metaScore-component');

        if(selector){
            components = components.filter(selector);
        }

        return components;
    };

    /**
     * Create and add a Media instance
     *
     * @method addMedia
     * @param {Object} configs The configurations to send to the Media class
     * @param {Boolean} [supressEvent=false] Whether to supress the mediadd event or not
     * @return {Media} The Media instance
     */
    Player.prototype.addMedia = function(configs, supressEvent){
        var media = new metaScore.player.component.Media(configs)
            .addListener('loadedmetadata', metaScore.Function.proxy(this.onMediaLoadedMetadata, this))
            .addListener('waiting', metaScore.Function.proxy(this.onMediaWaiting, this))
            .addListener('seeking', metaScore.Function.proxy(this.onMediaSeeking, this))
            .addListener('seeked', metaScore.Function.proxy(this.onMediaSeeked, this))
            .addListener('playing', metaScore.Function.proxy(this.onMediaPlaying, this))
            .addListener('play', metaScore.Function.proxy(this.onMediaPlay, this))
            .addListener('pause', metaScore.Function.proxy(this.onMediaPause, this))
            .addListener('timeupdate', metaScore.Function.proxy(this.onMediaTimeUpdate, this))
            .addListener('suspend', metaScore.Function.proxy(this.onMediaSuspend, this))
            .addListener('stalled', metaScore.Function.proxy(this.onMediaStalled, this))
            .addListener('error', metaScore.Function.proxy(this.onMediaError, this))
            .appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent(EVT_MEDIAADD, {'player': this, 'media': media}, true, false);
        }

        return media;
    };

    /**
     * Create and add a Controller instance
     *
     * @method addController
     * @param {Object} configs The configurations to send to the Controller class
     * @param {Boolean} [supressEvent=false] Whether to supress the controlleradd event or not
     * @return {Controller} The Controller instance
     */
    Player.prototype.addController = function(configs, supressEvent){
        var controller = new metaScore.player.component.Controller(configs)
            .addDelegate('.buttons button', 'click', metaScore.Function.proxy(this.onControllerButtonClick, this))
            .appendTo(this);

        if(supressEvent !== true){
            this.triggerEvent(EVT_CONTROLLERADD, {'player': this, 'controller': controller}, true, false);
        }

        return controller;
    };

    /**
     * Create and add a Block instance
     *
     * @method addBlock
     * @param {Object} configs The configurations to send to the Block class
     * @param {Boolean} [supressEvent=false] Whether to supress the blockadd event or not
     * @return {Block} The Block instance
     */
    Player.prototype.addBlock = function(configs, supressEvent){
        var block, page;

        if(configs instanceof metaScore.player.component.Block){
            block = configs;
            block.appendTo(this);
        }
        else{
            block = new metaScore.player.component.Block(metaScore.Object.extend({}, configs, {
                    'container': this,
                    'listeners': {
                        'propchange': metaScore.Function.proxy(this.onComponenetPropChange, this)
                    }
                }))
                .addListener('pageactivate', metaScore.Function.proxy(this.onPageActivate, this))
                .addDelegate('.element[data-type="Cursor"]', 'time', metaScore.Function.proxy(this.onCursorElementTime, this))
                .addDelegate('.element[data-type="Text"]', 'play', metaScore.Function.proxy(this.onTextElementPlay, this))
                .addDelegate('.element[data-type="Text"]', 'page', metaScore.Function.proxy(this.onTextElementPage, this))
                .addDelegate('.element[data-type="Text"]', 'block_visibility', metaScore.Function.proxy(this.onTextElementBlockVisibility, this));
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_BLOCKADD, {'player': this, 'block': block}, true, false);
        }

        return block;
    };

    /**
     * Update the custom CSS
     *
     * @method updateCSS
     * @param {String} value The custom CSS value
     * @chainable
     */
    Player.prototype.updateCSS = function(value){
        this.css.setInternalValue(value);

        return this;
    };

    /**
     * Toggles the media playing state
     *
     * @method togglePlay
     * @chainable
     */
    Player.prototype.togglePlay = function(){
        var media = this.getMedia();

        if(media.isPlaying()){
            media.pause();
        }
        else{
            media.play();
        }

        return this;
    };

    /**
     * Start playing the media at the current position, or plays a specific extract
     *
     * @method play
     * @param {String} [inTime] The time at which the media should start playing
     * @param {String} [outTime] The time at which the media should stop playing
     * @param {String} [rIndex] A reading index to go to while playing
     * @chainable
     */
    Player.prototype.play = function(inTime, outTime, rIndex){
        var player = this,
            media = this.getMedia();

        if(this.cuepoint){
            this.cuepoint.destroy();
        }

        inTime = parseFloat(inTime);
        outTime = parseFloat(outTime);
        rIndex = parseInt(rIndex);

        if(isNaN(inTime)){
            media.play();
        }
        else{
            this.cuepoint = new metaScore.player.CuePoint({
                'media': media,
                'inTime': inTime,
                'outTime': !isNaN(outTime) ? outTime : null,
                'considerError': true
            })
            .addListener('start', function(evt){
                player.setReadingIndex(!isNaN(rIndex) ? rIndex : 0);
            })
            .addListener('seekout', function(evt){
                evt.target.destroy();
                delete player.cuepoint;

                player.setReadingIndex(0);
            })
            .addListener('stop', function(evt){
                evt.target.getMedia().pause();
            })
            .init();

            media.setTime(inTime).play();
        }

        return this;
    };

    /**
     * Set the current reading index
     *
     * @method setReadingIndex
     * @param {Integer} index The reading index
     * @param {Boolean} [supressEvent=false] Whether to supress the blockadd event or not
     * @chainable
     */
    Player.prototype.setReadingIndex = function(index, supressEvent){
        this.rindex_css.removeRules();

        if(index !== 0){
            this.rindex_css
                .addRule('.metaScore-component.element[data-r-index="'+ index +'"]', 'display: block;')
                .addRule('.metaScore-component.element[data-r-index="'+ index +'"]:not([data-start-time]), .metaScore-component.element[data-r-index="'+ index +'"].active', 'pointer-events: auto;')
                .addRule('.metaScore-component.element[data-r-index="'+ index +'"]:not([data-start-time]) .contents, .metaScore-component.element[data-r-index="'+ index +'"].active .contents', 'display: block;')
                .addRule('.in-editor.editing.show-contents .metaScore-component.element[data-r-index="'+ index +'"] .contents', 'display: block;');

            this.data('r-index', index);
        }
        else{
            this.data('r-index', null);
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_RINDEX, {'player': this, 'value': index}, true, false);
        }

        return this;
    };

    return Player;

})();