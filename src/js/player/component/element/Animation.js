import Element from '../Element';
import {MasterClock} from '../../../core/media/Clock';
import Lottie from 'lottie-web';

/**
 * An Animation element
 */
export default class Animation extends Element{

    /**
     * @inheritdoc
    */
    static getType(){
        return 'Animation';
    }

    /**
     * @inheritdoc
    */
    static getDefaults(){
        const defaults = super.getDefaults();

        return Object.assign({}, defaults, {
            'properties': Object.assign({}, defaults.properties, {
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
                    'type': 'array'
                }
            })
        });
    }

    /**
     *Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.onAnimationLoad = this.onAnimationLoad.bind(this);

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
                this.updateSrc();
                break;

            case 'start-frame':
                this.updateStartFrame();
                break;

            case 'loop-duration':
                this.updateFPS();
                break;

            case 'reversed':
                this.updateDirection();
                break;

            case 'colors':
                this.updateColors();
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

    draw(){
        if(this.isActive()){
            if(this.animation && this._loaded){
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
        }

        return this;
    }

    onAnimationLoad(){
        this._loaded = true;

        if(!this.getPropertyValue('loop-duration')){
            if(this.animation){
                this.setPropertyValue('loop-duration', this.animation.getDuration());
            }
        }

        this
            .updateFPS()
            .updateDirection()
            .updateColors();

        if(this._playing){
            this.play();
        }

        this.triggerEvent('contentload', {'component': this});
    }

    getAnimation(){
        return this.animation;
    }

    isLoaded(){
        return this._loaded;
    }

    getTotalFrames(){
        if(this.animation){
            return this.animation.getDuration(true);
        }

        return 0;
    }

    play(){
        if(this._loaded){
            this.animation.play();
        }

        this._playing = true;

        return this;
    }

    stop(){
        if(this._loaded){
            this.animation.stop();
        }

        delete this._playing;

        return this;
    }

    updateSrc(){
        this.removeAnimation();

        this.contents.empty();

        const src = this.getPropertyValue('src');
        if(src){
            this.animation = Lottie.loadAnimation({
                container: this.contents.get(0),
                path: src,
                renderer: 'svg',
                loop: true,
                autoplay: false,
            });

            this.animation.addEventListener('DOMLoaded', this.onAnimationLoad);
        }

        return this;
    }

    updateStartFrame(){
        if(!this._playing){
            this.draw();
        }
    }

    updateFPS(){
        if(this.animation && this._loaded){
            const duration = this.animation.getDuration();
            const loop_duration = this.getPropertyValue('loop-duration');

            this.animation.setSpeed(duration/loop_duration);

            if(!this._playing){
                this.draw();
            }
        }

        return this;
    }

    updateDirection(){
        if(this.animation && this._loaded){
            const direction = this.getPropertyValue('reversed') ? -1 : 1;
            this.animation.setDirection(direction);

            if(!this._playing){
                this.draw();
            }
        }

        return this;
    }

    updateColors(){
        if(this.animation && this._loaded){
            let colors = this.getPropertyValue('colors');

            if(!colors){
                colors = [null, null];
            }
            else{
                colors = colors.split(',');
            }

            if(colors.length >= 1){
                this.contents.find('.color1 path').forEach((path) => {
                    path.style.fill = colors[0];
                });
            }

            if(colors.length >= 2){
                this.contents.find('.color2 path').forEach((path) => {
                    path.style.fill = colors[1];
                });
            }
        }

        return this;
    }

    removeAnimation(){
        this.stop();

        if(this.animation){
            this.animation.removeEventListener('DOMLoaded', this.onAnimationLoad);
            this.animation.destroy();
        }

        delete this.animation;
        delete this._loaded;

        return this;
    }

    remove(){
        this.removeAnimation();

        super.remove();
    }

}
