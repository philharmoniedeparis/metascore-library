import Dom from '../core/Dom';
import ResizeObserver from 'resize-observer-polyfill';
import {throttle} from '../core/utils/Function';

import {className} from '../../css/editor/Ruler.scss';

/**
 * A 'photoshop' like ruler
 */
export default class Ruler extends Dom {

    /**
     * Instantiate
     *
     * @param {Object} configs Custom configs to override defaults
     */
    constructor(configs) {
        // call parent constructor
        super('<div/>', {'class': `ruler ${className}`});

        /**
         * The configuration values
         * @type {Object}
         */
        this.configs = Object.assign({}, this.constructor.getDefaults(), configs);

        // Fix event handlers scope.
        this.onMouseover = this.onMouseover.bind(this);
        this.onMousemove = this.onMousemove.bind(this);
        this.onMouseout = this.onMouseout.bind(this);

        this.data('axis', this.configs.axis);

        /**
         * A scale factor to apply to all measurements.
         * @type {Number}
         */
        this.scale = 1;

        /**
         * The buffered <canvas> element.
         * @type {Dom}
         */
        this.canvas = new Dom('<canvas/>')
            .appendTo(this);

        this.tracker = new Dom('<div/>', {'class': 'tracker'})
            .hide()
            .appendTo(this);
    }

    /**
     * Get the default config values
     *
     * @return {Object} The default values
     */
    static getDefaults(){
        return {
            'axis': 'x',
            'tickWidth': 1,
            'minorTickLength': 5,
            'minorTickStep': 5,
            'minMinorTickSpacing': 5,
            'majorTickLength': 18,
            'majorTickStep': 50,
            'minMajorTickSpacing': 50,
            'tickColor': '#fff',
            'textColor': '#fff',
            'font': '10px sans-serif',
            'trackTarget': null,
        };
    }

    onResize(){
        this.updateSize();
    }

    /**
     * The mouseenter event callback
     *
     * @private
     */
    onMouseover(){
        this.tracker.show();
    }

    /**
     * The mousemove event callback
     *
     * @private
     */
    onMousemove(evt){
        const x = evt.clientX;
        const y = evt.clientY;
        const axis = this.configs.axis;
        const scale = this.scale;

        const {top, left} = this.get(0).getBoundingClientRect();

        if(axis === 'y'){
            this.tracker.css('top', `${(y - top) * scale}px`);
        }
        else{
            this.tracker.css('left', `${(x - left) * scale}px`);
        }
    }

    /**
     * The mouseout event callback
     *
     * @private
     */
    onMouseout(){
        this.tracker.hide();
    }

    /**
     * Initialize
     *
     * @return {this}
     */
    init(){
        this.configs.trackTarget
            .addListener('mouseover', this.onMouseover, true)
            .addListener('mousemove', this.onMousemove, true)
            .addListener('mouseout', this.onMouseout, true);

        const resize_observer = new ResizeObserver(throttle(this.onResize, 200, this));
        resize_observer.observe(this.get(0));

        this.updateSize();

        return this;
    }

    /**
     * Update the <canvas> sizes
     *
     * @return {this}
     */
    updateSize(){
        const el = this.get(0);
        const canvas = this.canvas.get(0);

        canvas.width = el.clientWidth;
        canvas.height = el.clientHeight;

        this.draw();

        return this;
    }

    /**
     * Set the scale factor.
     *
     * @return {this}
     */
    setScale(value){
        this.scale = value;
        this.draw();

        return this;
    }

    getMinorTickStep(){
        const base_step = this.configs.minorTickStep;
        const min_spacing = this.configs.minMinorTickSpacing;
        const scale = this.scale;
        let step = base_step;

        while(step * scale < min_spacing) {
            step += base_step;
        }

        return step;
    }

    getMajorTickStep(){
        const base_step = this.configs.majorTickStep;
        const min_spacing = this.configs.minMajorTickSpacing;
        const scale = this.scale;
        let step = base_step;

        while(step * scale < min_spacing) {
            step += base_step;
        }

        return step;
    }

    draw(){
        const canvas = this.canvas.get(0);
        const context = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const axis = this.configs.axis;
        const scale = this.scale;
        const minorTickStep = this.getMinorTickStep();
        const majorTickStep = this.getMajorTickStep();
        const minorTickLength = this.configs.minorTickLength;
        const majorTickLength = this.configs.majorTickLength;

        context.strokeStyle = this.configs.tickColor;
        context.lineWidth = this.configs.tickWidth;
        context.font = this.configs.font;
        context.fillStyle = this.configs.textColor;
        context.textAlign = 'left';
        context.textBaseline = 'top';

        context.clearRect(0, 0, canvas.width, canvas.height);
        context.translate(0.5, 0.5);
        context.beginPath();

        if(axis === 'y'){
            // Draw minor ticks
            for(let i = 0; i < height / scale; i+=minorTickStep){
                context.moveTo(width, i*scale);
                context.lineTo(width - minorTickLength, i*scale);
                context.stroke();
            }

            // Draw major ticks and labels
            context.textAlign = 'right';
            for(let i = 0; i < height / scale; i+=majorTickStep){
                const left = width - majorTickLength;

                context.moveTo(width, i*scale);
                context.lineTo(left, i*scale);
                context.stroke();

                context.save();
                context.translate(0, i*scale);
                context.rotate(-Math.PI/2);
                context.fillText(i, -minorTickStep*scale, left);
                context.restore();
            }
        }
        else{
            // Draw minor ticks
            for(let i = 0; i < width / scale; i+=minorTickStep){
                context.moveTo(i*scale, height);
                context.lineTo(i*scale, height - minorTickLength);
                context.stroke();
            }

            // Draw major ticks and labels
            for(let i = 0; i < width / scale; i+=majorTickStep){
                const top = height - majorTickLength;

                context.moveTo(i*scale, height);
                context.lineTo(i*scale, top);
                context.stroke();
                context.fillText(i, (i + minorTickStep)*scale, top);
            }
        }

        return this;
    }

    remove(){
        this.configs.trackTarget
            .removeListener('mouseover', this.onMouseover, true)
            .removeListener('mousemove', this.onMousemove, true)
            .removeListener('mouseout', this.onMouseout, true);

        super.remove();
    }

}
