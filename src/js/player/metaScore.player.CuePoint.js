/**
* Description
*
* @class player.CuePoint
* @extends Evented
*/

metaScore.namespace('player').CuePoint = (function () {

    /**
     * Description
     * @constructor
     * @param {} configs
     */
    function CuePoint(configs) {
        this.configs = this.getConfigs(configs);

        this.id = metaScore.String.uuid();

        this.running = false;

        this.launch = metaScore.Function.proxy(this.launch, this);
        this.stop = metaScore.Function.proxy(this.stop, this);
        this.onMediaTimeUpdate = metaScore.Function.proxy(this.onMediaTimeUpdate, this);
        this.onMediaSeeked = metaScore.Function.proxy(this.onMediaSeeked, this);

        this.configs.media.addListener('timeupdate', this.onMediaTimeUpdate);
        
        this.max_error = 0;
    }

    metaScore.Evented.extend(CuePoint);

    CuePoint.defaults = {
        'media': null,
        'inTime': null,
        'outTime': null,
        'onStart': null,
        'onUpdate': null,
        'onEnd': null,
        'onSeekOut': null,
        'considerError': false
    };

    /**
     * Description
     * @method onMediaTimeUpdate
     * @param {} evt
     * @return 
     */
    CuePoint.prototype.onMediaTimeUpdate = function(evt){
        var cur_time = this.configs.media.getTime();

        if(!this.running){
            if((Math.floor(cur_time) >= this.configs.inTime) && ((this.configs.outTime === null) || (Math.ceil(cur_time) < this.configs.outTime))){
                this.launch();
            }
        }
        else{
            if(this.configs.considerError){
                if('previous_time' in this){
                    this.max_error = Math.max(this.max_error, Math.abs(cur_time - this.previous_time));
                }
                
                this.previous_time = cur_time;
            }
        
            if((Math.ceil(cur_time) < this.configs.inTime) || ((this.configs.outTime !== null) && (Math.floor(cur_time + this.max_error) >= this.configs.outTime))){
                this.stop();
            }

            if(this.configs.onUpdate){
                this.configs.onUpdate(this, cur_time);
            }
        }
        
        if(this.configs.onSeekOut){
            this.configs.media.addListener('seeking', this.onMediaSeeked);
        }
    };

    /**
     * Description
     * @method onMediaSeeked
     * @param {} evt
     * @return 
     */
    CuePoint.prototype.onMediaSeeked = function(evt){
        var cur_time;
        
        this.configs.media.removeListener('play', this.onMediaSeeked);
        
        if(this.configs.onSeekOut){
            cur_time = this.configs.media.getTime();
        
            if((Math.ceil(cur_time) < this.configs.inTime) || (Math.floor(cur_time) > this.configs.outTime)){
                this.configs.onSeekOut(this);
            }
        }
    };

    /**
     * Description
     * @method getMedia
     * @return MemberExpression
     */
    CuePoint.prototype.getMedia = function(){
        return this.configs.media;
    };

    /**
     * Description
     * @method getInTime
     * @return MemberExpression
     */
    CuePoint.prototype.getInTime = function(){
        return this.configs.inTime;
    };

    /**
     * Description
     * @method getOutTime
     * @return MemberExpression
     */
    CuePoint.prototype.getOutTime = function(){
        return this.configs.outTime;
    };

    /**
     * Description
     * @method launch
     * @return 
     */
    CuePoint.prototype.launch = function(){
        if(this.running){
            return;
        }

        if(this.configs.onStart){
            this.configs.onStart(this);
        }

        // stop the cuepoint if it doesn't have an outTime or doesn't have onUpdate and onEnd callbacks
        if((this.configs.outTime === null) || (!this.configs.onUpdate && !this.configs.onEnd)){
            this.stop();
        }
        else{
            this.running = true;
        }
    };

    /**
     * Description
     * @method stop
     * @param {} launchCallback
     * @return 
     */
    CuePoint.prototype.stop = function(launchCallback){
        if(launchCallback !== false && this.configs.onEnd){
            this.configs.onEnd(this);
        
            if(this.configs.onSeekOut){
                this.configs.media.addListener('play', this.onMediaSeeked);
            }
        }
        
        if(this.configs.considerError){
            this.max_error = 0;
            delete this.previous_time;
        }

        this.running = false;
    };

    /**
     * Description
     * @method destroy
     * @return 
     */
    CuePoint.prototype.destroy = function(){
        this.stop(false);
        
        this.configs.media
            .removeListener('timeupdate', this.onMediaTimeUpdate)
            .removeListener('seeking', this.onMediaSeeked)
            .removeListener('play', this.onMediaSeeked);
    };

    return CuePoint;

})();