import Element from '../Element';
import {MasterClock} from '../../../core/media/Clock';
import Lottie from 'lottie-web';

/**
 * An Animation element
 */
export default class Animation extends Element{

    /**
     *Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super(configs);

        this.onAnimationLoaded = this.onAnimationLoaded.bind(this);
    }

    /**
    * Get the component's type
    *
    * @return {String} The component's type
    */
    static getType(){
        return 'Animation';
    }

    /**
    * Get the default config values
    *
    * @return {Object} The default values
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
                    'type': 'time'
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
     * Setup the cursor's UI
     *
     * @private
     */
    setupUI(){
        // call parent function
        super.setupUI();

        this
            .addListener('cuepointset', this.onCuePointSet.bind(this))
            .addListener('activate', this.onActivate.bind(this))
            .addListener('deactivate', this.onDeactivate.bind(this));

        return this;
    }

    /**
     * The propchange event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onOwnPropChange(evt){
        super.onOwnPropChange(evt);

        switch(evt.detail.property){
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
            const animation = this.getAnimation();

            if(animation && this._loaded){
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

                animation.goToAndStop(frame, true);
            }
        }

        return this;
    }

    onAnimationLoaded(){
        this._loaded = true;

        if(!this.getPropertyValue('loop-duration')){
            const animation = this.getAnimation();
            if(animation){
                this.setPropertyValue('loop-duration', animation.getDuration());
            }
        }

        this
            .updateFPS()
            .updateDirection()
            .updateColors();

        if(this._playing){
            this.play();
        }
    }

    getAnimation(){
        return this.animation;
    }

    isLoaded(){
        return this._loaded;
    }

    getTotalFrames(){
        const animation = this.getAnimation();

        if(animation){
            return animation.getDuration(true);
        }

        return 0;
    }

    play(){
        if(this._loaded){
            this.getAnimation().play();
        }

        this._playing = true;

        return this;
    }

    stop(){
        if(this._loaded){
            this.getAnimation().stop();
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

            this.animation.addEventListener('DOMLoaded', this.onAnimationLoaded);
        }

        return this;
    }

    updateStartFrame(){
        if(!this._playing){
            this.draw();
        }
    }

    updateFPS(){
        const animation = this.getAnimation();

        if(animation && this._loaded){
            const duration = animation.getDuration();
            const loop_duration = this.getPropertyValue('loop-duration');

            animation.setSpeed(duration/loop_duration);

            if(!this._playing){
                this.draw();
            }
        }

        return this;
    }

    updateDirection(){
        const animation = this.getAnimation();

        if(animation && this._loaded){
            const direction = this.getPropertyValue('reversed') ? -1 : 1;
            animation.setDirection(direction);

            if(!this._playing){
                this.draw();
            }
        }

        return this;
    }

    updateColors(){
        const animation = this.getAnimation();

        if(animation && this._loaded){
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
            this.animation.removeEventListener('DOMLoaded', this.onAnimationLoaded);
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
