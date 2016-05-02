/**
 * @module Player
 */

metaScore.namespace('player').CuePoint = (function () {

    /**
     * Fired when the cuepoint starts
     *
     * @event start
     */
    var EVT_START = 'start';

    /**
     * Fired when the cuepoint is active (between the start and end times) and the media time is updated
     *
     * @event update
     */
    var EVT_UPDATE = 'update';

    /**
     * Fired when the cuepoint stops
     *
     * @event stop
     */
    var EVT_STOP = 'stop';

    /**
     * Fired when the media is seeked outside of the cuepoint's time
     *
     * @event seekout
     */
    var EVT_SEEKOUT = 'seekout';

    /**
     * A class for managing media cuepoints to execute actions at specific media times
     * 
     * @class CuePoint
     * @namepsace player
     * @extends Evented
     * @constructor
     * @param {Object} configs Custom configs to override defaults
     * @param {player.component.Media} configs.media The media component to which the cuepoint is attached
     * @param {Number} configs.inTime The time at which the cuepoint starts
     * @param {Number} [onfigs.outTime] The time at which the cuepoint stops
     * @param {Boolean} [onfigs.considerError] Whether to estimate and use the error margin in timed events
     */
    function CuePoint(configs) {
        this.configs = this.getConfigs(configs);

        // call parent constructor
        CuePoint.parent.call(this);

        this.id = metaScore.String.uuid();

        this.running = false;

        this.start = metaScore.Function.proxy(this.start, this);
        this.stop = metaScore.Function.proxy(this.stop, this);
        this.onMediaTimeUpdate = metaScore.Function.proxy(this.onMediaTimeUpdate, this);
        this.onMediaSeeked = metaScore.Function.proxy(this.onMediaSeeked, this);

        this.getMedia()
            .addListener('timeupdate', this.onMediaTimeUpdate)
            .addListener('seeked', this.onMediaSeeked);

        this.max_error = 0;
    }

    metaScore.Evented.extend(CuePoint);

    CuePoint.defaults = {
        'media': null,
        'inTime': null,
        'outTime': null,
        'considerError': false
    };

    /**
     * The media's timeupdate event handler
     * 
     * @method onMediaTimeUpdate
     * @private
     * @param {Event} evt The event object
     */
    CuePoint.prototype.onMediaTimeUpdate = function(evt){
        var cur_time = this.getMedia().getTime();

        if(!this.running){
            if((Math.floor(cur_time) >= this.configs.inTime) && ((this.configs.outTime === null) || (Math.ceil(cur_time) < this.configs.outTime))){
                this.start();
            }
        }
        else{
            if(this.configs.considerError){
                if('previous_time' in this){
                    this.max_error = Math.max(this.max_error, Math.abs(cur_time - this.previous_time));
                }

                this.previous_time = cur_time;
            }

            if((this.configs.outTime !== null) && (Math.floor(cur_time + this.max_error) >= this.configs.outTime)){
                this.stop();
            }

            this.triggerEvent(EVT_UPDATE);
        }
    };

    /**
     * The media's seek event handler
     * 
     * @method onMediaSeeked
     * @private
     * @param {Event} evt The event object
     */
    CuePoint.prototype.onMediaSeeked = function(evt){
        var cur_time = this.getMedia().getTime();
        
        if('previous_time' in this){
            // reset the max_error and the previous_time to prevent an abnormaly large max_error
            this.max_error = 0;
            this.previous_time = cur_time;
        }

        if((Math.ceil(cur_time) < this.configs.inTime) || (Math.floor(cur_time) > this.configs.outTime)){
            this.triggerEvent(EVT_SEEKOUT);
            this.stop();
        }
    };

    /**
     * Get the media component on which this cuepoint is attached
     * 
     * @method getMedia
     * @return {player.component.Media} The media component
     */
    CuePoint.prototype.getMedia = function(){
        return this.configs.media;
    };

    /**
     * Start executing the cuepoint
     * 
     * @method start
     * @private
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     */
    CuePoint.prototype.start = function(supressEvent){
        if(this.running){
            return;
        }

        if(supressEvent !== true){
            this.triggerEvent(EVT_START);
        }

        // stop the cuepoint if it doesn't have an outTime
        if(this.configs.outTime === null){
            this.stop();
        }
        else{            
            this.running = true;
        }

    };

    /**
     * Stop executing the cuepoint
     * 
     * @method stop
     * @private
     * @param {Boolean} supressEvent Whether to prevent the custom event from firing
     */
    CuePoint.prototype.stop = function(supressEvent){
        if(!this.running){
            return;
        }
        
        if(supressEvent !== true){
            this.triggerEvent(EVT_STOP);
        }

        if(this.configs.considerError){
            this.max_error = 0;
            delete this.previous_time;
        }

        this.running = false;
    };

    /**
     * Destroy the cuepoint
     * 
     * @method destroy
     */
    CuePoint.prototype.destroy = function(){
        this.stop(true);

        this.getMedia()
            .removeListener('timeupdate', this.onMediaTimeUpdate)
            .removeListener('seeked', this.onMediaSeeked);
    };

    return CuePoint;

})();