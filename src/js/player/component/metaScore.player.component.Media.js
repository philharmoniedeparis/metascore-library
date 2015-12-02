/**
* Description
*
* @class player.component.Media
* @extends player.Component
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
     * Description
     * @constructor
     * @param {} configs
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
                /**
                 * Description
                 * @param {} skipDefault
                 * @return BinaryExpression
                 */
                'getter': function(skipDefault){
                    return this.data('locked') === "true";
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    this.data('locked', value ? "true" : null);
                }
            },
            'x': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.x', 'X')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return parseInt(this.css('left'), 10);
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    this.css('left', value +'px');
                }
            },
            'y': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.y', 'Y')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return parseInt(this.css('top'), 10);
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    this.css('top', value +'px');
                },
            },
            'width': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.width', 'Width')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return parseInt(this.css('width'), 10);
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    this.css('width', value +'px');
                }
            },
            'height': {
                'type': 'Number',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.height', 'Height')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return parseInt(this.css('height'), 10);
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    this.css('height', value +'px');
                }
            },
            'border-radius': {
                'type': 'BorderRadius',
                'configs': {
                    'label': metaScore.Locale.t('player.component.Media.border-radius', 'Border radius')
                },
                /**
                 * Description
                 * @param {} skipDefault
                 * @return CallExpression
                 */
                'getter': function(skipDefault){
                    return this.css('border-radius', undefined, skipDefault);
                },
                /**
                 * Description
                 * @param {} value
                 * @return
                 */
                'setter': function(value){
                    this.css('border-radius', value);
                }
            }
        }
    };

    /**
     * Description
     * @method setSources
     * @return ThisExpression
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
     * Description
     * @method getName
     * @return Literal
     */
    Media.prototype.getName = function(){
        return '[media]';
    };

    /**
     * Description
     * @method onLoadedMetadata
     * @param {} evt
     * @return
     */
    Media.prototype.onLoadedMetadata = function(evt) {
        this.triggerEvent(EVT_LOADEDMETADATA, {'media': this});
    };

    /**
     * Description
     * @method onPlay
     * @param {} evt
     * @return
     */
    Media.prototype.onPlay = function(evt) {
        this.playing = true;

        this.triggerEvent(EVT_PLAY, {'media': this});

        if(this.configs.useFrameAnimation){
            this.triggerTimeUpdate();
        }
    };

    /**
     * Description
     * @method onPause
     * @param {} evt
     * @return
     */
    Media.prototype.onPause = function(evt) {
        this.playing = false;

        this.triggerEvent(EVT_PAUSE, {'media': this});
    };

    /**
     * Description
     * @method onTimeUpdate
     * @param {} evt
     * @return
     */
    Media.prototype.onTimeUpdate = function(evt){
        if(!this.configs.useFrameAnimation){
            this.triggerTimeUpdate(false);
        }
    };

    /**
     * Description
     * @method onSeeking
     * @param {} evt
     * @return
     */
    Media.prototype.onSeeking = function(evt){
        this.triggerEvent(EVT_SEEKING, {'media': this});
    };

    /**
     * Description
     * @method isPlaying
     * @return MemberExpression
     */
    Media.prototype.isPlaying = function() {
        return this.playing;
    };

    /**
     * Description
     * @method reset
     * @return ThisExpression
     */
    Media.prototype.reset = function() {
        this.setTime(0);

        return this;
    };

    /**
     * Description
     * @method play
     * @return ThisExpression
     */
    Media.prototype.play = function() {
        this.dom.play();

        return this;
    };

    /**
     * Description
     * @method pause
     * @return ThisExpression
     */
    Media.prototype.pause = function() {
        this.dom.pause();

        return this;
    };

    /**
     * Description
     * @method triggerTimeUpdate
     * @param {} loop
     * @return
     */
    Media.prototype.triggerTimeUpdate = function(loop) {
        if(loop !== false && this.isPlaying()){
            window.requestAnimationFrame(metaScore.Function.proxy(this.triggerTimeUpdate, this));
        }

        this.triggerEvent(EVT_TIMEUPDATE, {'media': this});
    };

    /**
     * Description
     * @method setTime
     * @param {} time
     * @return ThisExpression
     */
    Media.prototype.setTime = function(time) {
        this.dom.currentTime = parseFloat(time) / 100;

        this.triggerTimeUpdate(false);

        return this;
    };

    /**
     * Description
     * @method getTime
     * @return BinaryExpression
     */
    Media.prototype.getTime = function() {
        return parseFloat(this.dom.currentTime) * 100;
    };

    /**
     * Description
     * @method getDuration
     * @return BinaryExpression
     */
    Media.prototype.getDuration = function() {
        return parseFloat(this.dom.duration) * 100;
    };

    /**
     * Description
     * @method setDraggable
     * @param {} draggable
     * @return MemberExpression
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
                'container': this.parents(),
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

    return Media;

})();