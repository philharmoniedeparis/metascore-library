/**
 * @module Player
 */

metaScore.namespace('player.component').Media = (function () {

    /**
     * Fired when the media source is set
     *
     * @event sourcesset
     * @param {Object} media The media instance
     */
    var EVT_SOURCESSET = 'sourcesset';

    /**
     * Fired when the metadata has loaded
     *
     * @event loadedmetadata
     * @param {Object} media The media instance
     */
    var EVT_LOADEDMETADATA = 'loadedmetadata';

    /**
     * Fired when the media starts playing
     *
     * @event play
     * @param {Object} media The media instance
     */
    var EVT_PLAY = 'play';

    /**
     * Fired when the media is paused
     *
     * @event pause
     * @param {Object} media The media instance
     */
    var EVT_PAUSE = 'pause';

    /**
     * Fired when the media is seeking
     *
     * @event seeking
     * @param {Object} media The media instance
     */
    var EVT_SEEKING = 'seeking';

    /**
     * Fired when the media's time changed
     *
     * @event timeupdate
     * @param {Object} media The media instance
     */
    var EVT_TIMEUPDATE = 'timeupdate';

    /**
     * A media component
     *
     * @class Controller
     * @namespace player.component
     * @extends player.Component
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {Object} [configs.properties={...}} A list of the component properties as name/descriptor pairs
     */
    function Media(configs){
        // call parent constructor
        Media.parent.call(this, configs);

        this.addClass('media').addClass(this.configs.type);

        this.el = new metaScore.Dom('<'+ this.configs.type +'></'+ this.configs.type +'>', {'preload': 'auto'})
            .addListener('loadedmetadata', metaScore.Function.proxy(this.onLoadedMetadata, this))
            .addListener('play', metaScore.Function.proxy(this.onPlay, this))
            .addListener('pause', metaScore.Function.proxy(this.onPause, this))
            .addListener('timeupdate', metaScore.Function.proxy(this.onTimeUpdate, this))
            .addListener('seeking', metaScore.Function.proxy(this.onSeeking, this))
            .appendTo(this);

        this.dom = this.el.get(0);

        this.playing = false;
    }

    metaScore.player.Component.extend(Media);

    Media.defaults = {
        'type': 'audio',
        'useFrameAnimation': true,
        'properties': {
            'locked': {
                'type': 'Boolean',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.locked', 'Locked ?')
                },
                'getter': function(skipDefault){
                    return this.data('locked') === "true";
                },
                'setter': function(value){
                    this.data('locked', value ? "true" : null);
                }
            },
            'x': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.x', 'X'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('left'), 10);
                },
                'setter': function(value){
                    this.css('left', value +'px');
                }
            },
            'y': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.y', 'Y'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('top'), 10);
                },
                'setter': function(value){
                    this.css('top', value +'px');
                },
            },
            'width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.width', 'Width'),
                    'spinDirection': 'vertical'
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('width'), 10);
                },
                'setter': function(value){
                    this.css('width', value +'px');
                }
            },
            'height': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.height', 'Height'),
                    'flipSpinButtons': true
                },
                'getter': function(skipDefault){
                    return parseInt(this.css('height'), 10);
                },
                'setter': function(value){
                    this.css('height', value +'px');
                }
            },
            'z-index': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Element.z-index', 'Display index')
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('z-index', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('z-index', value);
                }
            },
            'background-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.background-color', 'Background color')
                },
                'getter': function(skipDefault){
                    return this.css('background-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.css('background-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            },
            'border-width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.border-width', 'Border width'),
                    'min': 0
                },
                'getter': function(skipDefault){
                    var value = parseInt(this.css('border-width', undefined, skipDefault), 10);
                    return isNaN(value) ? null : value;
                },
                'setter': function(value){
                    this.css('border-width', value +'px');
                }
            },
            'border-color': {
                'type': 'Color',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Block.border-color', 'Border color')
                },
                'getter': function(skipDefault){
                    return this.css('border-color', undefined, skipDefault);
                },
                'setter': function(value){
                    var color = metaScore.Color.parse(value);
                    this.css('border-color', 'rgba('+ color.r +','+ color.g +','+ color.b +','+ color.a +')');
                }
            },
            'border-radius': {
                'type': 'BorderRadius',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.border-radius', 'Border radius')
                },
                'getter': function(skipDefault){
                    return this.css('border-radius', undefined, skipDefault);
                },
                'setter': function(value){
                    this.css('border-radius', value);
                }
            }
        }
    };

    /**
     * Set the media sources
     *
     * @method setSources
     * @param {Array} sources The list of sources as objects with 'url' and 'mime' keys
     * @param {Boolean} [supressEvent=false] Whether to supress the sourcesset event
     * @chainable
     */
    Media.prototype.setSources = function(sources, supressEvent){
        var source_tags = '';

        metaScore.Array.each(sources, function(index, source) {
            source_tags += '<source src="'+ source.url +'" type="'+ source.mime +'"></source>';
        }, this);

        this.el.text(source_tags);

        this.dom.load();

        if(supressEvent !== true){
            this.triggerEvent(EVT_SOURCESSET, {'media': this});
        }

        return this;

    };

    /**
     * Get the value of the media's name property
     * 
     * @method getName
     * @return {String} The name
     */
    Media.prototype.getName = function(){
        return '[media]';
    };

    /**
     * The loadedmetadata event handler
     *
     * @method onLoadedMetadata
     * @private
     * @param {Event} evt The event object
     */
    Media.prototype.onLoadedMetadata = function(evt) {
        this.triggerEvent(EVT_LOADEDMETADATA, {'media': this});
    };

    /**
     * The play event handler
     *
     * @method onPlay
     * @private
     * @param {Event} evt The event object
     */
    Media.prototype.onPlay = function(evt) {
        this.playing = true;

        this.triggerEvent(EVT_PLAY, {'media': this});

        if(this.configs.useFrameAnimation){
            this.triggerTimeUpdate();
        }
    };

    /**
     * The pause event handler
     *
     * @method onPause
     * @private
     * @param {Event} evt The event object
     */
    Media.prototype.onPause = function(evt) {
        this.playing = false;

        this.triggerEvent(EVT_PAUSE, {'media': this});
    };

    /**
     * The timeupdate event handler
     *
     * @method onTimeUpdate
     * @private
     * @param {Event} evt The event object
     */
    Media.prototype.onTimeUpdate = function(evt){
        if(!this.configs.useFrameAnimation){
            this.triggerTimeUpdate(false);
        }
    };

    /**
     * The seeking event handler
     *
     * @method onSeeking
     * @private
     * @param {Event} evt The event object
     */
    Media.prototype.onSeeking = function(evt){
        this.triggerEvent(EVT_SEEKING, {'media': this});
    };

    /**
     * Check whether the media is playing
     *
     * @method isPlaying
     * @return {Boolean} Whether the media is playing
     */
    Media.prototype.isPlaying = function() {
        return this.playing;
    };

    /**
     * Reset the media time
     *
     * @method reset
     * @chainable
     */
    Media.prototype.reset = function() {
        this.setTime(0);

        return this;
    };

    /**
     * Play the media
     *
     * @method play
     * @chainable
     */
    Media.prototype.play = function() {
        this.dom.play();

        return this;
    };

    /**
     * Pause the media
     *
     * @method pause
     * @chainable
     */
    Media.prototype.pause = function() {
        this.dom.pause();

        return this;
    };

    /**
     * Trigger the timeupdate event
     *
     * @method triggerTimeUpdate
     * @private
     * @param {Boolean} [loop=true] Whether to use requestAnimationFrame to trigger this method again
     * @chainable
     */
    Media.prototype.triggerTimeUpdate = function(loop) {
        if(loop !== false && this.isPlaying()){
            window.requestAnimationFrame(metaScore.Function.proxy(this.triggerTimeUpdate, this));
        }

        this.triggerEvent(EVT_TIMEUPDATE, {'media': this});
        
        return this;
    };

    /**
     * Set the media time
     *
     * @method setTime
     * @param {Number} time The time in centiseconds
     * @chainable
     */
    Media.prototype.setTime = function(time) {
        this.dom.currentTime = parseFloat(time) / 100;

        this.triggerTimeUpdate(false);

        return this;
    };

    /**
     * Get the current media time
     *
     * @method getTime
     * @return {Number} The time in centiseconds
     */
    Media.prototype.getTime = function() {
        return parseFloat(this.dom.currentTime) * 100;
    };

    /**
     * Get the media's duration
     *
     * @method getDuration
     * @return {Number} The duration in centiseconds
     */
    Media.prototype.getDuration = function() {
        return parseFloat(this.dom.duration) * 100;
    };

    /**
     * Set/Unset the draggable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [draggable=true] Whether to activate or deactivate the draggable
     * @return {Draggable} The draggable behaviour
     */
    Media.prototype.setDraggable = function(draggable){

        draggable = draggable !== false;

        if(this.getProperty('locked') && draggable){
            return false;
        }

        if(draggable && !this._draggable){
            this._draggable = new metaScore.Draggable({
                'target': this,
                'handle': this.child('video'),
                'limits': {
                    'top': 0,
                    'left': 0
                }
            });
        }
        else if(!draggable && this._draggable){
            this._draggable.destroy();
            delete this._draggable;
        }

        return this._draggable;

    };

    /**
     * Set/Unset the resizable behaviour
     *
     * @method setDraggable
     * @param {Boolean} [resizable=true] Whether to activate or deactivate the resizable
     * @return {Resizable} The resizable behaviour
     */
    Media.prototype.setResizable = function(resizable){

        resizable = resizable !== false;

        if(this.getProperty('locked') && resizable){
            return false;
        }

        if(resizable && !this._resizable){
            this._resizable = new metaScore.Resizable({
                'target': this
            });
        }
        else if(!resizable && this._resizable){
            this._resizable.destroy();
            delete this._resizable;
        }

        return this._resizable;

    };

    return Media;

})();