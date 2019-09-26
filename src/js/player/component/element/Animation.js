import Element from '../Element';
import Lottie from 'lottie-web';

const renderer = 'svg';

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
                'fps': {
                    'getter': function(){
                        const value = parseFloat(this.data('fps'));
                        return isNaN(value) ? this.getDefaultFPS() : value;
                    },
                    'setter': function(value){
                        this.data('fps', isNaN(value) ? null : value);
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

        this.playing = false;
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
            .addListener('resizeend', this.onResizeEnd.bind(this))
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

            case 'fps':
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
     * The resizeend event handler
     *
     * @private
     */
    onResizeEnd(){
    }

    onActivate(){
        if(!this.getCuePoint()){
            this.play();
        }
    }

    onCuePointStart(){
        // call parent function
        super.onCuePointStart();

        this.play();
    }

    onDeactivate(){

    }

    onAnimationLoaded(){
        this
            .updateFPS()
            .updateDirection()
            .updateColors();

        if(this.playing){
            this.play();
        }
    }

    getAnimation(){
        return this.animation;
    }

    getDefaultFPS(){
        const animation = this.getAnimation();
        if(!animation){
            return null;
        }

        const duration = animation.getDuration();
        const frames = animation.getDuration(true);

        return Math.round(frames/duration);
    }

    play(){
        const animation = this.getAnimation();
        if(animation){
            animation.play();
        }

        return this;
    }

    stop(){
        const animation = this.getAnimation();
        if(animation){
            animation.stop();
        }

        this.playing = false;

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
                renderer: renderer,
                loop: true,
                autoplay: false,
            });

            this.animation.addEventListener('DOMLoaded', this.onAnimationLoaded);
        }

        return this;
    }

    updateFPS(){
        const animation = this.getAnimation();
        if(animation){
            const fps = this.getPropertyValue('fps');
            const duration = animation.getDuration();
            const frames = animation.getDuration(true);
            const speed = Math.round(frames/duration) / fps;

            animation.setSpeed(speed);
        }

        return this;
    }

    updateDirection(){
        const animation = this.getAnimation();
        if(animation){
            const direction = this.getPropertyValue('reversed') ? -1 : 1;

            animation.setDirection(direction);
        }

        return this;
    }

    updateColors(){
        const animation = this.getAnimation();
        if(animation){
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
        if(this.animation){
            this.animation.removeEventListener('DOMLoaded', this.onAnimationLoaded);
            this.animation.destroy();
            delete this.animation;
        }

        return this;
    }

    remove(){
        this.removeAnimation();

        super.remove();
    }

}
