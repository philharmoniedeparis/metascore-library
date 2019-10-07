import Element from '../Element';
import {toSeconds, toCentiseconds} from '../../../core/utils/Media';
import MediaClock from '../../../core/clock/MediaClock';
import Lottie from 'lottie-web';

/**
 * An Animation element
 */
export default class Animation extends Element{

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
                    'getter': function(){
                        return this.data('src');
                    },
                    'setter': function(value){
                        this.data('src', value);
                    }
                },
                'start-frame': {
                    'getter': function(){
                        const value = parseInt(this.data('start-frame'), 10);
                        return isNaN(value) ? 0 : value;
                    },
                    'setter': function(value){
                        this.data('start-frame', value);
                    }
                },
                'loop-duration': {
                    'getter': function(){
                        const value = parseFloat(this.data('loop-duration'));
                        return isNaN(value) ? null : value;
                    },
                    'setter': function(value){
                        this.data('loop-duration', isNaN(value) ? null : value);
                    }
                },
                'reversed': {
                    'getter': function(){
                        return this.data('reversed') === "true";
                    },
                    'setter': function(value){
                        this.data('reversed', value ? "true" : null);
                    }
                },
                'colors': {
                    'getter': function(){
                        const value = this.data('colors');
                        return value ? value : null;
                    },
                    'setter': function(value){
                        this.data('colors', value);
                    }
                }
            })
        });
    }

    constructor(configs) {
        super(configs);

        this.onAnimationLoaded = this.onAnimationLoaded.bind(this);
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
            .addListener('propchange', this.onPropChange.bind(this))
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
    onPropChange(evt){
        switch(evt.detail.property){
            case 'src':
                this.updateSrc();
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

    onActivate(){
        if(!this.getCuePoint()){
            this.play();
        }
    }

    /**
     * The cuepoint set event handler
     *
     * @param {Event} evt The event object
     * @private
     */
    onCuePointSet(evt){
        const cuepoint = evt.detail.cuepoint;
        cuepoint.addListener('update', this.onCuePointUpdate.bind(this));

        super.onCuePointSet(evt);
    }

    /**
     * The cuepoint update event handler
     *
     * @private
     * @param {Event} evt The event object
     */
    onCuePointUpdate(){
        this.draw();
    }

    onDeactivate(){
        this.stop();
    }

    draw(){
        const animation = this.getAnimation();

        if(animation && this._loaded){
            const start_time = this.getPropertyValue('start-time');
            const start_frame = this.getPropertyValue('start-frame');
            const loop_duration = this.getPropertyValue('loop-duration');
            const current_time = MediaClock.getTime();

            const time = toSeconds(current_time - start_time);
            const total_frames = animation.getDuration(true);
            const fps = total_frames / toSeconds(loop_duration);
            const frame = (time * fps + start_frame) % total_frames;

            animation.goToAndStop(frame, true);
        }
    }

    onAnimationLoaded(){
        this._loaded = true;

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

    getLoopDuration(){
        let duration = this.getPropertyValue('loop-duration');

        if(!duration){
            const animation = this.getAnimation();

            if(animation){
                duration = toCentiseconds(animation.getDuration());
            }
        }

        return duration;
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

    updateFPS(){
        const animation = this.getAnimation();

        if(animation && this._loaded){
            const duration = toCentiseconds(animation.getDuration());
            const loop_duration = this.getLoopDuration();

            animation.setSpeed(duration/loop_duration);

            this.draw();
        }

        return this;
    }

    updateDirection(){
        const animation = this.getAnimation();

        if(animation && this._loaded){
            const direction = this.getPropertyValue('reversed') ? -1 : 1;
            animation.setDirection(direction);

            this.draw();
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
