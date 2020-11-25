import Element from '../Element';
import {MasterClock} from '../../../core/media/MediaClock';
import Lottie from 'lottie-web';

/**
 * An Animation element
 *
 * @emits {contentload} Fired when the animation is loaded
 * @param {Animation} component The component instance
 */
export default class Animation extends Element{

    static defaults = Object.assign({}, super.defaults, {
        'properties': Object.assign({}, super.defaults.properties, {
            'src': {
                'type': 'string'
            },
            'start-frame': {
                'type': 'number',
                'default': 1
            },
            'loop-duration': {
                'type': 'time',
                'sanitize': function(value) {
                    if (this.isLoaded() && !value) {
                        return this.animation.getDuration();
                    }
                    return value;
                }
            },
            'reversed': {
                'type': 'boolean',
                'default': false
            },
            'colors': {
                'type': 'array',
                'applies': function(){
                    return this.contents.find(`[class^='color'] path, [class*=' color'] path`).count() > 0;
                }
            }
        })
    });

    /**
     * @inheritdoc
    */
    static getType(){
        return 'Animation';
    }

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.onLoad = this.onLoad.bind(this);

        this
            .addListener('cuepointset', this.onCuePointSet.bind(this))
            .addListener('activate', this.onActivate.bind(this))
            .addListener('deactivate', this.onDeactivate.bind(this));
    }

    /**
     * @inheritdoc
     */
    updatePropertyValue(property, value){
        switch(property){
            case 'src':
                this.updateSrc(value);
                break;

            case 'start-frame':
                if(!this._playing){
                    this.draw();
                }
                break;

            case 'loop-duration':
                this.updateSpeed(value);
                break;

            case 'reversed':
                this.updateDirection(value);
                break;

            case 'colors':
                this.updateColors(value);
                break;

            default:
                super.updatePropertyValue(property, value);
        }
    }

    /**
     * The cuepointset event handler
     *
     * @param {CustomEvent} evt The event object
     * @private
     */
    onCuePointSet(evt){
        if(evt.detail.cuepoint){
            this.draw();
        }
        else{
            this.play();
        }
    }

    /**
     * The activate event handler
     *
     * @private
     */
    onActivate(){
        if(!this.getCuePoint()){
            this.play();
        }
    }

    /**
     * The deactivate event handler
     *
     * @private
     */
    onDeactivate(){
        this.stop();
    }

    /**
     * @inheritdoc
     */
    onCuePointUpdate(evt){
        super.onCuePointUpdate(evt);

        this.draw();
    }

    /**
     * Update the animation's frame
     *
     * @private
     * @return {this}
     */
    draw(){
        if(this.isActive() && this.isLoaded()){
            const start_time = this.getPropertyValue('start-time');
            const start_frame = this.getPropertyValue('start-frame');
            const loop_duration = this.getPropertyValue('loop-duration');
            const reversed = this.getPropertyValue('reversed');
            const current_time = MasterClock.getTime();

            const time = current_time - start_time;
            const total_frames = this.getTotalFrames();
            const fps = total_frames / loop_duration;
            let frame = (time * fps + (start_frame-1)) % total_frames;

            if(reversed){
                frame = total_frames - frame;
            }

            this.animation.goToAndStop(frame, true);
        }

        return this;
    }

    /**
     * Animation DOMLoaded event handler.
     *
     * @private
     */
    onLoad(){
        this._loaded = true;

        if(!this.getPropertyValue('loop-duration')){
            if(this.animation){
                this.setPropertyValue('loop-duration', this.animation.getDuration());
            }
        }

        this
            .updateSpeed(this.getPropertyValue('loop-duration'))
            .updateDirection(this.getPropertyValue('reversed'))
            .updateColors(this.getPropertyValue('colors'));

        if(this._playing){
            this.play();
        }

        this.triggerEvent('contentload', {'component': this});
    }

    /**
     * Get the Lottie animation instance.
     *
     * @return {Object} The AnimationItem instance
     */
    getAnimation(){
        return this.animation;
    }

    /**
     * Check if the animation has loaded.
     *
     * @return {Boolean} Whether the animation has loaded.
     */
    isLoaded(){
        return this._loaded;
    }

    /**
     * Get the total number of frames.
     *
     * @return {number} The number of frames.
     */
    getTotalFrames(){
        if(this.animation){
            return this.animation.getDuration(true);
        }

        return 0;
    }

    /**
     * Play the animation.
     *
     * @return {this}
     */
    play(){
        if(this.isLoaded()){
            this.animation.play();
        }

        this._playing = true;

        return this;
    }

    /**
     * Stop the animation.
     *
     * @return {this}
     */
    stop(){
        if(this.isLoaded()){
            this.animation.stop();
        }

        delete this._playing;

        return this;
    }

    /**
     * Update the animation's source URL.
     *
     * @private
     * @param {string} url The new URL.
     * @return {this}
     */
    updateSrc(url){
        this.removeAnimation();

        this.contents.empty();

        if(url){
            /**
             * The Lottie AnimationItem instance
             * @type {Object}
             */
            this.animation = Lottie.loadAnimation({
                container: this.contents.get(0),
                path: url,
                renderer: 'svg',
                loop: true,
                autoplay: false,
            });

            this.animation.addEventListener('DOMLoaded', this.onLoad);
        }

        return this;
    }

    /**
     * Update the animation's speed.
     *
     * @private
     * @param {number} loop_duration The loop duration.
     * @return {this}
     */
    updateSpeed(loop_duration){
        if(this.isLoaded()){
            const duration = this.animation.getDuration();
            this.animation.setSpeed(duration/loop_duration);

            if(!this._playing){
                this.draw();
            }
        }

        return this;
    }

    /**
     * Update the animation's direction.
     *
     * @private
     * @param {boolean} reversed Whether to play in reversed.
     * @return {this}
     */
    updateDirection(reversed){
        if(this.isLoaded()){
            this.animation.setDirection(reversed ? -1 : 1);

            if(!this._playing){
                this.draw();
            }
        }

        return this;
    }

    /**
     * Update the animation's colors.
     *
     * @private
     * @param {string[]} colors An array of color values.
     * @return {this}
     */
    updateColors(colors){
        if(this.animation && this.isLoaded()){
            (colors ?? [null, null]).forEach((val, index) => {
                this.contents.find(`.color${index+1} path`).css('fill', val);
            });
        }

        return this;
    }

    /**
     * Stop and remove the animation.
     *
     * @private
     * @return {this}
     */
    removeAnimation(){
        this.stop();

        if(this.animation){
            this.animation.removeEventListener('DOMLoaded', this.onLoad);
            this.animation.destroy();
        }

        delete this.animation;
        delete this._loaded;

        return this;
    }

    /**
     * @inheritdoc
     */
    remove(){
        this.removeAnimation();

        super.remove();
    }

}
