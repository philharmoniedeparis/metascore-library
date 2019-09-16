import Dom from '../core/Dom';
import ResizeObserver from 'resize-observer-polyfill';

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

        // fix event handlers scope
        this.onMouseover = this.onMouseover.bind(this);
        this.onMousemove = this.onMousemove.bind(this);
        this.onMouseout = this.onMouseout.bind(this);

        this.data('axis', this.configs.axis);

        /**
         * The buffered <canvas> element
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
            'majorTickLength': 18,
            'minorTickStep': 5,
            'majorTickStep': 50,
            'tickColor': '#000',
            'textColor': '#333',
            'font': '10px sans-serif',
            'trackTarget': null,
        };
    }

    onResize(){
        this.updateSize().draw();
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

        const rect = this.get(0).getBoundingClientRect();

        if(axis === 'y'){
            this.tracker.css('top', `${y - rect.top}px`);
        }
        else{
            this.tracker.css('left', `${x - rect.left}px`);
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

    init(){
        this.configs.trackTarget
            .addListener('mouseover', this.onMouseover, true)
            .addListener('mousemove', this.onMousemove, true)
            .addListener('mouseout', this.onMouseout, true);

        const resize_observer = new ResizeObserver(this.onResize.bind(this));
        resize_observer.observe(this.get(0));

        this.updateSize().draw();
    }

    remove(){
        this.configs.trackTarget
            .removeListener('mouseover', this.onMouseover, true)
            .removeListener('mousemove', this.onMousemove, true)
            .removeListener('mouseout', this.onMouseout, true);

        super.remove();
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

        return this;
    }

    draw(){
        const canvas = this.canvas.get(0);
        const context = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height
        const axis = this.configs.axis;

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
            for(let i = 0; i < height; i+=this.configs.minorTickStep){
                context.moveTo(width, i);
                context.lineTo(width - this.configs.minorTickLength, i);
                context.stroke();
            }

            // Draw major ticks and labels
            context.textAlign = 'right';
            for(let i = 0; i < height; i+=this.configs.majorTickStep){
                const left = width - this.configs.majorTickLength;

                context.moveTo(width, i);
                context.lineTo(left, i);
                context.stroke();

                context.save();
                context.translate(0, i);
                context.rotate(-Math.PI/2);
                context.fillText(i, -this.configs.minorTickStep, left);
                context.restore();
            }
        }
        else{
            // Draw minor ticks
            for(let i = 0; i < width; i+=this.configs.minorTickStep){
                context.moveTo(i, height);
                context.lineTo(i, height - this.configs.minorTickLength);
                context.stroke();
            }

            // Draw major ticks and labels
            for(let i = 0; i < width; i+=this.configs.majorTickStep){
                const top = height - this.configs.majorTickLength;

                context.moveTo(i, height);
                context.lineTo(i, top);
                context.stroke();
                context.fillText(i, i + this.configs.minorTickStep, top);
            }
        }

        return this;
    }

}
